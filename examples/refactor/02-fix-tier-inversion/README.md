# Example 02 — Fix tier inversion

`src/tokens.css` had three primitive CSS variables rewritten to
read from semantic variables, inverting the contract's reference
direction. AUDIT flagged each as `tier-inversion-hard` (warning).
REFACTOR's plan emits three `tier-promotion` transformations that
restore the literal values declared in DESIGN.md; applying the
plan results in a clean re-audit and exit `0`.

## Files

- `input/DESIGN.md` — the contract.
- `input/audit-report.json` — three tier-inversion warnings.
- `input/src/tokens.css` — the file with the inversion.
- `expected-plan/refactor-plan.md` — three `tier-promotion`
  transformations.
- `expected-output/refactor-report.md` — applied summary.
- `expected-output/diff.patch` — unified diff.
- `notes.md` — what this example demonstrates.