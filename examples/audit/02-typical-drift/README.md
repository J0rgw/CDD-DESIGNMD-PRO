# Example 02 — Typical drift

Six months of feature work without contract enforcement produced
the typical pattern: hardcoded hex colors in a banner component,
an inline style attribute, a CSS module reading the primitive
ramp directly, and a couple of token paths that were declared
during BOOTSTRAP but never landed any consumer in code. AUDIT
emits seven findings — four warnings and three info-level orphan
tokens — and exits `0` because `audit.failOn` is the default
`[error]`.

## Files

- `input/DESIGN.md` — the contract under audit.
- `input/src/components/*.tsx` — `Button` and `Card` are clean;
  `Banner` and `Badge` exhibit the drift cases.
- `input/src/components/Badge.module.css` — reads
  `--colors-gray-50` directly (soft tier inversion) and uses a
  literal hex.
- `expected-output/audit-report.md` — markdown report.
- `expected-output/audit-report.sarif.json` — SARIF sidecar.
- `notes.md` — what this example demonstrates.