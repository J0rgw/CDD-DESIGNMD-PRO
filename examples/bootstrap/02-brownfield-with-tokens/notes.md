# Notes — Brownfield Industrial Dashboard

## What this example demonstrates

- BOOTSTRAP on a project with **existing token assets**. The
  tailwind config's colors are imported as tier-1 primitives
  verbatim; nothing is renamed mid-import. The semantic tier is
  added on top.
- A **domain preset applied**. The `industrial-scada` preset's five
  invariants are merged into the generated `invariants:` block,
  with the preset's references emitted as a YAML comment above the
  block.
- A **two-axis** theming system (`mode + branding`) where the
  branding axis explicitly excludes the five status colors via
  `excludedFrom`, satisfying the
  `branding-excluded-from-status` invariant.
- A **paired text-on-* convention** for status colors. Five status
  hues, one shared `text-on-status-dark` (light text). The warning
  hue was deliberately darkened to `#854D0E` so a single light
  text color clears WCAG-AA on every status indicator without
  per-priority pairing.
- **Multi-tenant runtime pre-wiring** for a single-tenant product
  today. The `runtime` declaration and the branding axis exist
  even though only one customer ships, so the contract does not
  need to be rewritten when the second customer arrives.

## What this example intentionally does NOT cover

- **Migration of existing components.** BOOTSTRAP creates the
  contract; AUDIT and REFACTOR migrate components later. The 47
  existing components are not touched.
- **Density axis.** The calm-default-state invariant pushes toward
  a single calibrated spacing system; density variants would
  conflict with that and need explicit user consent.
- **Custom alarm sounds, motion, or accessibility-beyond-color.**
  These belong in a separate contract layer; DESIGN.md models the
  visual language only.

## Why these choices matter for the test suite

The test asserts:

1. The DESIGN.md passes upstream `lint` with zero errors.
2. The front-matter contains `themingAxes`, `tokenTiers`,
   `invariants`, `antiPatterns`, and `runtime`.
3. The `invariants` block contains every `id` from
   `skill-workflows/domain-presets/industrial-scada.yml` (the preset
   was applied verbatim).
4. `themingAxes.branding.excludedFrom` lists every `colors.status-*`
   token (the `branding-excluded-from-status` invariant is
   structurally satisfied, not just documented).

## Invariants from industrial-scada preset

This example imports the `industrial-scada` preset. As of v0.2.x,
preset invariants ship with `enforcement: manual` for every entry
whose scope is conceptual rather than path-bound, because the
AUDIT runtime detector that would handle `automated` and `ci-only`
enforcement is deferred to v0.3+ (see `docs/meta/roadmap.md`).

Adopters who want stricter enforcement in their own DESIGN.md can
override enforcement values per invariant — but doing so before
the detector exists means those invariants will be treated as
manual at audit time anyway.

This example tracks the preset as-is to preserve fidelity between
the canonical preset and the canonical example. If the preset
changes (e.g., a future session adds `type` to one of the
invariants), the example moves with it.
