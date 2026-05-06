# Example 01 — Tokenize hardcoded colors

A small B2B SaaS app with three components (`Button`, `Card`,
`Header`) that contain four hardcoded hex literals for values
that already exist as tokens in DESIGN.md. REFACTOR's plan
proposes four tokenizable transformations across three files;
applying the plan results in a clean re-audit and exit `0`.

## Files

- `input/DESIGN.md` — the contract.
- `input/audit-report.json` — the SARIF input feeding REFACTOR.
- `input/src/{Button,Card,Header}.tsx` — the source files.
- `expected-plan/refactor-plan.md` — canonical plan with four
  transformations, zero deferred, zero rejected.
- `expected-output/refactor-report.md` — report after apply.
- `expected-output/diff.patch` — unified diff of the writes.
- `notes.md` — what this example demonstrates.