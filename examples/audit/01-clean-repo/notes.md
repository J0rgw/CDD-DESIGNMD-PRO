# Notes — Clean Repo

## What this example demonstrates

- The shape of a zero-findings AUDIT report (markdown + SARIF
  sidecar with empty `results[]`).
- The header information that AUDIT always emits even when there
  is nothing to report: report path, generator version, strict
  mode flag, active suppressions, scope description.
- The `Manual review required` section is present but explicitly
  empty when no invariant declares `enforcement: manual`.

## Why this matters for the test suite

The test asserts that:

1. `input/DESIGN.md` passes upstream `lint` with zero errors.
2. `expected-output/audit-report.sarif.json` parses as JSON,
   validates against the SARIF 2.1.0 schema, and has an empty
   `results[]` array.
3. `expected-output/audit-report.md` contains a `## Summary`
   section whose three counter rows all read `0`.
4. The summary table totals match the SARIF results array length
   (zero on both sides).