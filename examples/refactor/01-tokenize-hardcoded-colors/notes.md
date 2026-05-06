# Notes — Tokenize hardcoded colors

## What this example demonstrates

- The straight-line success case for `refactor plan` +
  `refactor apply`: every audit finding is `tokenizable`, the
  literal values match declared token values exactly, and the
  apply phase results in a clean re-audit.
- Bundling adjacent literals on the same line into one
  transformation (Header.tsx:4 contains both a background and a
  border-bottom literal). The plan describes both replacements
  inside a single `Before`/`After` block because they share the
  line range; the validator's "no overlapping ranges" rule
  permits this as long as the bundled change is atomic.
- Tier promotion in passing: the Card example was reading what
  would have been the gray-200 primitive directly. The plan
  routes through the semantic `colors.border` token even though
  the literal value is identical, because Card is component-tier
  and should consume semantics.

## What this example intentionally does NOT cover

- **Invariant violations.** Example 03 covers the rejected case.
- **Tier inversions.** Example 02 covers that.
- **Dry-run preview.** The expected output assumes a real apply.
  A reviewer can substitute `--dry-run` mentally — the report
  shape is identical except the diff would not be written.

## Why this matters for the test suite

The test asserts:

1. `input/DESIGN.md` passes upstream lint with zero errors.
2. `expected-plan/refactor-plan.md` has the front-matter shape
   defined in `skill-workflows/refactor/plan-schema.md`
   (UUID v4 plan-id, ISO 8601 generated-at, SHA256 hash, and
   plan-version `1.0`).
3. The plan declares exactly four transformations with the
   mandatory per-transformation fields populated.
4. Every "Token used" in the plan resolves to a token under
   `colors`, `typography`, `spacing`, `rounded`, or `components`
   in the input DESIGN.md.
5. `expected-output/refactor-report.md` summary counts match
   the plan: 4 applied, 0 deferred, 0 rejected, 0 residual.
6. The exit code documented in the report footer is `0`.