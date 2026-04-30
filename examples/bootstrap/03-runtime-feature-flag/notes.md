# Notes — Single-Theme SaaS with Experiment Overrides

## What this example demonstrates

- A `runtime` entry whose `path` is **not** the target of any
  `themingAxes` axis. The schema explicitly permits this case (see
  `runtime` validation rule 5: a runtime token must be the target
  of a runtime axis OR not appear in any axis at all).
- The override is **per-token, ad-hoc, and session-scoped**, not a
  system-wide configuration. There is no enumerated set of
  experiment values, so modeling it as an axis would be dishonest.
- A dedicated component slot (`button-cta`) so the experiment does
  not bleed into every primary action.
- A dedicated semantic-tier token (`colors.cta`) defaulting to
  `{colors.primary}` so the contract reads naturally when the flag
  is absent.

## What this example intentionally does NOT cover

- **Multi-tenant branding.** That is example 01.
- **Domain invariants.** This product has no normative visual
  language; example 02 covers that case (industrial-scada preset).
- **Feature-flag platform glue code.** The design contract names
  the source (`feature-flag.experiment-cta-color-v2`) but does not
  prescribe how the flag is evaluated. Implementation details
  belong in product code.
- **Multiple simultaneous experiments.** A second runtime override
  on a different token would be added as a sibling entry under
  `runtime`. This example keeps it to one to make the pattern
  obvious.

## Why these choices matter for the test suite

The test asserts:

1. The DESIGN.md passes upstream `lint` with zero errors.
2. The front-matter contains `themingAxes`, `tokenTiers`,
   `antiPatterns`, and `runtime`. (Invariants are absent — domain
   is none/other, like example 01.)
3. The `runtime` block contains exactly one entry whose `path` is
   not listed under any `themingAxes.<axis>.controls`.
4. `themingAxes` contains a `mode` axis but no `branding` axis.
</content>
</invoke>