# Example 01 — Clean repo

A small B2B SaaS with a three-component UI (`Button`, `Card`,
`Input`). Every component routes through the semantic token layer
via CSS modules, and no source file violates any anti-pattern,
invariant, or tier rule. AUDIT produces a zero-findings report and
exits `0`.

## Files

- `input/DESIGN.md` — the contract under audit.
- `input/src/components/*.tsx` — the source files in scope.
- `expected-output/audit-report.md` — canonical zero-findings
  report.
- `expected-output/audit-report.sarif.json` — SARIF sidecar with
  empty `results[]`.
- `notes.md` — what this example demonstrates.