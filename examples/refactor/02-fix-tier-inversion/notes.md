# Notes — Fix tier inversion

## What this example demonstrates

- The `tier-promotion` category in action. AUDIT's
  `tier-inversion-hard` pass detects primitives whose value is a
  reference (instead of a literal); REFACTOR's plan resolves
  each by reading the canonical literal from DESIGN.md and
  inlining it.
- A single-file refactor plan: all three transformations land in
  `src/tokens.css`. The applier orders them bottom-to-top so
  earlier line edits do not invalidate later line numbers (lines
  12, 13, 14 — applied in reverse).
- "Token used" semantics for `tier-promotion`. The plan declares
  `colors.blue-500` (etc.) as the token used, even though the
  replacement is the LITERAL value, not a reference. The token
  reference identifies the contract source of truth that the
  literal was looked up against.

## What this example intentionally does NOT cover

- **Cross-file inversions.** A single-file fixture is enough to
  exercise the pattern; multi-file inversions would either
  defer (per `Known limitations`) or be applied as separate
  transformations across files.
- **Soft tier inversions.** The brownfield audit example
  (`examples/audit/02-typical-drift/`) covers a soft inversion
  (a component reading a primitive directly when a semantic
  exists). REFACTOR's behavior there is the same `tier-promotion`
  transformation but in the consuming component, not the token
  file.

## Why this matters for the test suite

The test asserts:

1. `input/DESIGN.md` passes upstream lint with zero errors.
2. `expected-plan/refactor-plan.md` declares three
   `tier-promotion` transformations, all targeting
   `src/tokens.css`.
3. Each "Token used" resolves to a `tokenTiers.primitive` entry
   in the input DESIGN.md.
4. The "After" excerpt for each transformation is a literal
   matching the resolved value from DESIGN.md (no `var(...)`
   reference remains).
5. The report's exit code is `0`.