# Bootstrap Example 02 — Brownfield Industrial Dashboard

A two-year-old React dashboard for an industrial-process monitoring
product. The repo already ships a `tailwind.config.js` with eight
brand colors and four spacing tokens, but no formal token system or
design contract. The current customer's brand is a green palette;
the product owner expects to onboard additional customers, each with
their own accent, within the next year.

This example shows BOOTSTRAP on a brownfield project: existing tokens
become tier-1 primitives, a semantic layer is proposed on top, the
`industrial-scada` domain preset supplies invariants (ISA-101 and
ISA-18.2), and `themingAxes` is pre-wired for multi-tenant branding
even though only one tenant exists today.

## Files

- `input.md` — captures the project state BOOTSTRAP detects plus the
  user's answers to the eight interview questions.
- `expected-output/DESIGN.md` — the DESIGN.md the skill should
  produce. Used by the test suite as a golden file.
- `notes.md` — what this example demonstrates and what it
  intentionally does NOT cover.
