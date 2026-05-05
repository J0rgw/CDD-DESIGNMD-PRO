# Notes — Invariant Violation

## What this example demonstrates

- **Pass 2 (invariant violations).** The contract carries the
  `status-color-immutable` invariant from the
  `industrial-scada` preset. The detector for that invariant
  scans CSS files for redeclarations of `--status-*` custom
  properties and reports the override in
  `theme-override.css` at error severity.
- **Pass 1 (anti-pattern, colocated).** The same line also
  contains a literal hex (`#C62828`), so the
  `hardcoded-color-literal` anti-pattern fires too. AUDIT does
  not de-duplicate findings across passes — colocation is
  expected when an override happens to be a hex literal — but
  the report makes the relationship explicit.
- **`audit.failOn: [error, warning]`.** The contract elevates
  warnings to gating severity, so a single warning would also
  block the merge. The error finding alone is enough to exit
  `1`; the warning reinforces the team's stance that hardcoded
  hexes outside token files are unacceptable.
- **Manual-review surfacing.** Three preset invariants
  (`redundant-encoding`, `calm-default-state`,
  `alarm-priority-distinguishable`) declare
  `enforcement: manual`. AUDIT does not verify them
  automatically; instead the report's "Manual review required"
  section names them so reviewers know what they own.

## What this example intentionally does NOT cover

- **Tier inversions.** Example 02 covers those.
- **Orphan tokens.** Example 02 covers those too.
- **Runtime mismatch detection.** No code in scope reads the
  runtime-bound `colors.primary` directly; the contract simply
  declares the runtime hook.

## Why this matters for the test suite

The test asserts:

1. `input/DESIGN.md` passes upstream `lint` with zero errors.
2. `expected-output/audit-report.sarif.json` is valid JSON,
   passes the SARIF 2.1.0 schema, and has exactly two entries in
   `results[]`.
3. `expected-output/audit-report.md` `## Summary` rows total
   `error: 1`, `warning: 1`, `info: 0`, matching the SARIF
   `level` distribution.
4. The exit code documented in the report footer is `1` (because
   `audit.failOn` includes `warning`).
5. The "Manual review required" section in the markdown report
   names the three manual-enforcement invariants by id.