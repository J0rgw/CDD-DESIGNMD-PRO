# Example 03 — Runtime override decoupled from theming axes

A single-theme B2B SaaS dashboard that uses a feature-flag platform
to drive a runtime color override on a specific component token,
without modeling the override as a theming axis.

This example exists to exercise the schema's allowance for `runtime`
entries whose `path` is not the target of any axis under
`themingAxes` — see `extension-schema.md`, runtime validation rule
5, and `bootstrap.md` Phase 4 for context.

## Files

- `input.md` — the BOOTSTRAP signals and interview answers.
- `expected-output/DESIGN.md` — the canonical output.
- `notes.md` — what this example demonstrates and why.
</content>
</invoke>