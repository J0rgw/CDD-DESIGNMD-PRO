# Notes — Partial refactor with deferred items

## What this example demonstrates

- **REFACTOR's three categories landing in one plan.** The plan
  has a non-empty Transformations list, a non-empty Deferred
  list, and a non-empty Rejected list — the only example that
  exercises all three.
- **Bundling on same-line literals.** Three of the audit
  findings cover lines that contain two hex literals each
  (`Button.tsx:8`, `Card.tsx:7`, `AlarmBanner.tsx:7`). Per the
  schema's "no overlapping ranges" rule, REFACTOR does not emit
  two separate transformations for the same line; it emits one
  bundled transformation whose `Token used` field lists both
  tokens. The summary surfaces this explicitly ("3
  transformations resolving 5 findings").
- **Test-file matches deferred, not auto-resolved.** The audit
  scoped `*.test.tsx` in for completeness, but the matches
  inside `Card.test.tsx` are intentional: one literal documents
  a legacy hex, the other is the expected value of an
  assertion. Tokenizing them would change test semantics.
  REFACTOR defers with `ambiguous-context`.
- **Invariant violation rejected, not silently dropped.** The
  `status-color-immutable` finding lands in the Rejected list
  with the invariant description verbatim. The re-audit confirms
  the residual; the report's exit code is `1` so CI gates the
  merge until a human resolves it.

## What this example intentionally does NOT cover

- **Successful invariant resolution.** REFACTOR never auto-
  resolves invariant violations by design.
- **Cross-file transformations.** All transformations are
  single-file. The brownfield-style cascading rename is v0.3+
  scope.
- **Tier promotion.** Example 02 covers that explicitly.

## Why this matters for the test suite

The test asserts:

1. `input/DESIGN.md` passes upstream lint with zero errors.
2. `input/audit-report.json` is valid SARIF.
3. `expected-plan/refactor-plan.md` has the front-matter shape
   defined in `plan-schema.md` (UUID, ISO 8601, SHA256, plan
   version 1.0).
4. The plan declares exactly three transformations, two
   deferred items, and one rejected item.
5. The rejected item references an invariant id (`status-color-
   immutable`) that exists in the input DESIGN.md.
6. `expected-output/refactor-report.md` summary counts match
   the plan and the residual section is non-empty.
7. The exit code documented in the report footer is `1`.