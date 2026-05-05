# Notes — Typical Drift

## What this example demonstrates

- **Pass 1 (anti-pattern matches).** Two anti-pattern entries in
  the contract (`hardcoded-color-literal`,
  `inline-style-attribute`) match the obvious cases in
  `Banner.tsx` and `Badge.module.css`.
- **Pass 3 (tier inversion, soft).** `Badge.module.css` reads
  `var(--colors-gray-50)` directly when a semantic token covering
  the same intent (`colors.surface`) exists. AUDIT flags this as
  `tier-inversion-soft` at warning severity.
- **Pass 5 (orphan tokens).** `components.caption` was declared in
  DESIGN.md but no source file imports it; `colors.text-muted`
  is only consumed by the orphan caption; `spacing.xs` is never
  referenced anywhere in scope. All three are info-severity
  findings.
- **Phase 6 exit code.** `audit.failOn` is the default `[error]`,
  so the run exits `0`. The team can merge — but the warnings and
  info findings remain visible in the SARIF sidecar so reviewers
  see the drift before it compounds.

## What this example intentionally does NOT cover

- **Hard tier inversions.** Those are example 03's territory
  (and they are surfaced as errors, not warnings).
- **Invariant violations.** This DESIGN.md declares no invariants;
  the drift is purely anti-pattern + tier + orphan.
- **Runtime mismatch.** No runtime extension is declared.

## Why this matters for the test suite

The test asserts:

1. `input/DESIGN.md` passes upstream `lint` with zero errors.
2. `expected-output/audit-report.sarif.json` is valid JSON, passes
   the SARIF 2.1.0 schema, and has exactly seven entries in
   `results[]`.
3. `expected-output/audit-report.md` `## Summary` rows total
   `error: 0`, `warning: 4`, `info: 3`, matching the SARIF
   `level` distribution (`note` is the SARIF mapping for `info`).
4. The exit code documented in the report footer is `0`, matching
   the default `failOn: [error]` on a finding set with no errors.