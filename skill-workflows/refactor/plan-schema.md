# Refactor Plan Schema

## Compatibility statement

This document defines the structure of `refactor-plan.md` — the
artifact emitted by `refactor plan` and consumed by
`refactor apply`. The format is markdown with a YAML front
matter block for machine parsing, mirroring DESIGN.md's own
shape so the same parser stack handles both.

The schema is versioned via `plan-version` in the front matter.
This document defines version `1.0`. Forward-incompatible changes
will bump the major; backward-compatible additions will bump the
minor and be ignored by older `refactor apply` implementations
that do not know the new fields.

## File structure

```markdown
---
plan-id: <UUID v4>
generated-at: <ISO 8601 timestamp>
source-design-md: <relative path>
source-audit-report: <relative path>
target-codebase-hash: <SHA256 hex digest>
plan-version: "1.0"
---

# Refactor Plan

## Summary

- Tokenizable transformations: <count>
- Structural changes deferred: <count>
- Invariant violations rejected: <count>
- Files affected: <count>
- Estimated review time: <minutes>

## Transformations

### transformation-<N>: <short title>

- **File:** `<relative path>`
- **Line:** <line number>
- **Column:** <column number>
- **Category:** tokenizable | tier-promotion
- **Before:**

  ```<lang>
  <code excerpt with the literal>
  ```

- **After:**

  ```<lang>
  <code excerpt with the replacement>
  ```

- **Rationale:** <one human-readable line>
- **Token used:** `<token reference>` (verified in DESIGN.md)

## Deferred items

### deferred-<N>: <finding-id>

- **File:** `<relative path>:<line>`
- **Reason:** ambiguous-context | structural-required | cross-file | manual-review
- **Note:** <explanation>

## Rejected items

### rejected-<N>: <invariant-id>

- **File:** `<relative path>:<line>`
- **Invariant:** <invariant description>
- **Reason:** invariant violations require human judgment

## Validation

- Plan validated at: <ISO 8601 timestamp>
- All transformations reference tokens defined in DESIGN.md: ✓
- No transformation modifies DESIGN.md itself: ✓
- All "Before" excerpts found at declared file:line: ✓
```

## Front matter fields

| Field                  | Type     | Required | Notes                                                                                                  |
| ---------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `plan-id`              | UUID v4  | yes      | Fresh on every plan generation. Prevents accidental reuse and gives reports a stable handle.           |
| `generated-at`         | ISO 8601 | yes      | UTC timestamp at plan write. Used in the report header.                                                |
| `source-design-md`     | string   | yes      | Path (relative to repo root) of the DESIGN.md the plan was generated against.                          |
| `source-audit-report`  | string   | yes      | Path of the `audit-report.json` (or sarif sidecar) consumed.                                           |
| `target-codebase-hash` | SHA256   | yes      | SHA256 hex digest of the concatenated SHA256s of every file the plan touches, in stable sorted order. |
| `plan-version`         | string   | yes      | Schema version of this plan (`"1.0"` for plans matching this document).                                |

## Mandatory fields per transformation

| Field        | Type    | Required | Notes                                                                |
| ------------ | ------- | -------- | -------------------------------------------------------------------- |
| File         | string  | yes      | Relative path from repo root.                                        |
| Line         | integer | yes      | 1-indexed.                                                           |
| Column       | integer | yes      | 1-indexed; column of the first character of the "Before" excerpt.    |
| Category     | enum    | yes      | `tokenizable`, `tier-promotion`, or `structural` (rare in v0.1.x).   |
| Before       | string  | yes      | Original code excerpt; non-empty.                                    |
| After        | string  | yes      | Replacement code; non-empty and distinct from Before.                |
| Rationale    | string  | yes      | One-line human-readable explanation.                                 |
| Token used   | string  | yes      | Contract path (e.g. `colors.primary`); MUST resolve in DESIGN.md.    |

## Mandatory fields per deferred item

| Field   | Type   | Required | Notes                                                                                                  |
| ------- | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| File    | string | yes      | Relative path with `:line` suffix.                                                                     |
| Reason  | enum   | yes      | `ambiguous-context`, `structural-required`, `cross-file`, `manual-review`.                             |
| Note    | string | yes      | One-line explanation.                                                                                  |

## Mandatory fields per rejected item

| Field      | Type   | Required | Notes                                                  |
| ---------- | ------ | -------- | ------------------------------------------------------ |
| File       | string | yes      | Relative path with `:line` suffix.                     |
| Invariant  | string | yes      | The `invariants[].description` from DESIGN.md.         |
| Reason     | string | yes      | Always `invariant violations require human judgment`.  |

## Validation rules

1. **Plan-id uniqueness.** Every plan gets a fresh UUID v4 at
   generation time. `refactor apply` does not enforce uniqueness
   across the filesystem (the file path is the de-facto unique
   identifier), but the UUID gives the report and any external
   tracker a stable handle distinct from the file path.
2. **Hash freshness.** `target-codebase-hash` MUST match the
   currently-computed hash at apply time. A mismatch indicates
   the codebase drifted between plan and apply; abort exit 2 and
   suggest re-running `refactor plan`.
3. **Token references resolve.** Every "Token used" string MUST
   resolve to a token in the current DESIGN.md. A failure here
   means either the contract drifted (token renamed/removed) or
   the plan was generated against a different DESIGN.md than the
   one declared in `source-design-md`.
4. **Before/After consistency.** "Before" and "After" excerpts
   MUST both be non-empty and MUST differ. A no-op transformation
   is rejected at plan validation.
5. **No DESIGN.md modifications.** No transformation may have
   `source-design-md` (or any path resolving to a DESIGN.md) as
   its `File`. The contract is read-only from REFACTOR's
   perspective.
6. **No overlapping ranges.** Two transformations on the same
   file MUST NOT overlap in line range. The plan generator
   serializes overlapping matches into a single transformation
   or defers the second; the validator enforces non-overlap as
   a safety net.
7. **Category constraints.** `tier-promotion` transformations
   move primitive → semantic; the inverse direction is rejected.
   `tokenizable` transformations cover the literal→token case
   without a tier change. `structural` is reserved for v0.3+
   AST-aware refactors.

## Example minimal plan

A valid plan with one transformation, zero deferred, zero
rejected:

```markdown
---
plan-id: 7f9c2b14-9e3d-4a1f-8b6c-2d5e8f1a9c3b
generated-at: 2026-05-06T10:30:00Z
source-design-md: ./DESIGN.md
source-audit-report: ./audit-report.sarif.json
target-codebase-hash: 4b3a8f2c9e1d5b7a6f0c8e4d2a9b3c5f7e1d8a4b6c2f9e3d5a7b1c4f8e6d2a9b
plan-version: "1.0"
---

# Refactor Plan

## Summary

- Tokenizable transformations: 1
- Structural changes deferred: 0
- Invariant violations rejected: 0
- Files affected: 1
- Estimated review time: 2

## Transformations

### transformation-1: tokenize hardcoded primary in Button

- **File:** `src/components/Button.tsx`
- **Line:** 7
- **Column:** 18
- **Category:** tokenizable
- **Before:**

  ```tsx
  <button className="bg-[#0EA5E9] text-white">
  ```

- **After:**

  ```tsx
  <button className="bg-primary text-on-primary">
  ```

- **Rationale:** Replace literal hex with the brand primary
  token; matches `colors.primary` exactly.
- **Token used:** `colors.primary` (verified in DESIGN.md)

## Deferred items

(none)

## Rejected items

(none)

## Validation

- Plan validated at: 2026-05-06T10:30:01Z
- All transformations reference tokens defined in DESIGN.md: ✓
- No transformation modifies DESIGN.md itself: ✓
- All "Before" excerpts found at declared file:line: ✓
```