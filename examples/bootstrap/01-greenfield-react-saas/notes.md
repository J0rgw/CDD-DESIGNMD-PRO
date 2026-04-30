# Notes — Greenfield React SaaS

## What this example demonstrates

- BOOTSTRAP on a project with **no prior assets**: no DESIGN.md, no
  token files, no existing components.
- A **two-axis** theming system (`mode + branding`) chosen because
  the product genuinely has both. The aesthetic axis is omitted
  rather than included as a placeholder.
- An **explicit three-tier** token decomposition. Brand and gray
  ramps as primitives; semantic roles in the middle; component-
  scoped overrides at tier 3.
- Runtime theming via a single `runtime` entry, with a fallback
  literal (`#F59E0B`) so the system is never broken by a missing
  tenant value.
- An **antiPatterns catalog without invariants**. The team imposes
  drift rules, but the domain ("none/other") imposes nothing.

## What this example intentionally does NOT cover

- No **invariants**. Important: BOOTSTRAP does not invent
  invariants for projects whose domain does not have them. Any
  invariant that ends up in the DESIGN.md must come from a domain
  preset (Q1) or be added explicitly later.
- No **density axis**. The team didn't ask for one; the skill
  didn't add one. If density requirements emerge, that is a future
  BOOTSTRAP-extend pass.
- No **multi-aesthetic axis**. Same reason: the product has one
  look. If a future re-skin or seasonal mode is required, it's an
  extension.
- No **components beyond the seed set**. The skill scaffolds the
  minimum set that exercises every extension; teams expand the
  components map as they build.

## Why these choices matter for the test suite

The test asserts:

1. The DESIGN.md passes upstream `lint` with zero errors.
2. The front-matter contains `themingAxes`, `tokenTiers`,
   `antiPatterns`, and `runtime`.
3. The front-matter does **NOT** contain `invariants` (this is the
   "no invariants when domain is none" check).
4. `runtime` declares `colors.accent` and matches a runtime axis.
