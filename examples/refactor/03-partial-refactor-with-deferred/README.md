# Example 03 — Partial refactor with deferred items

A mixed-finding audit that exercises every category REFACTOR
distinguishes:

- 5 tokenizable hardcoded color findings (across `Button`,
  `Card`, `AlarmBanner`).
- 1 invariant-violation error (`status-color-immutable` in
  `theme-override.css`).
- 2 deferred matches in `Card.test.tsx` (test-file context).

The plan emits 3 bundled tokenizable transformations (resolving
the 5 findings — same-line literals are bundled per the schema's
non-overlapping-range rule), 2 deferred items, and 1 rejected
item. Apply succeeds for the tokenizable transformations, the
re-audit reports the residual invariant violation, and exit `1`
matches `audit.failOn: [error]`.

## Files

- `input/DESIGN.md` — industrial-scada-imported contract.
- `input/audit-report.json` — 8 findings (5 tokenizable, 1
  error, 2 deferred).
- `input/src/components/{Button,Card,AlarmBanner}.tsx` — source
  with hardcoded literals.
- `input/src/components/Card.test.tsx` — test file with
  literals REFACTOR defers.
- `input/src/styles/theme-override.css` — the invariant
  violator.
- `expected-plan/refactor-plan.md` — 3 transformations, 2
  deferred, 1 rejected.
- `expected-output/refactor-report.md` — partial-success
  report; exit 1.
- `expected-output/diff.patch` — unified diff.
- `notes.md` — what this example demonstrates.