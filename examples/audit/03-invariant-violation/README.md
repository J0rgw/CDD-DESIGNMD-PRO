# Example 03 — Invariant violation

An industrial monitoring dashboard with the `industrial-scada`
preset invariants merged into the contract. A
`theme-override.css` file checked into the repo redeclares
`--status-critical` for a customer that requested a softer red.
This is exactly the drift the `status-color-immutable` invariant
exists to prevent: status colors encode operational meaning under
ISA-101 and may not be tenant-customised.

AUDIT emits two findings — one error (the invariant violation)
and one warning (the hardcoded hex literal colocated on the same
line) — and exits `1` because `audit.failOn` is
`[error, warning]`.

## Files

- `input/DESIGN.md` — the contract under audit, with two
  ci-enforceable preset invariants and three manual ones.
- `input/src/components/*.tsx` — three clean components
  (`Button`, `Card`, `AlarmCritical`).
- `input/src/styles/theme-override.css` — the offending file.
- `expected-output/audit-report.md` — markdown report with
  the error + warning findings and a manual-review notice.
- `expected-output/audit-report.sarif.json` — SARIF sidecar.
- `notes.md` — what this example demonstrates.