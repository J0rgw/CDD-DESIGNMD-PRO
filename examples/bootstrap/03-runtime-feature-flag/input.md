# BOOTSTRAP Input — Single-Theme SaaS with Experiment Overrides

## Phase 1 — Detected signals

| Signal               | Value                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| `hasDesignMd`        | false                                                                  |
| `hasTokenAssets`     | weak — minimal CSS custom properties for primary/text/surface          |
| `multiThemeHints`    | weak — `dark:` Tailwind variants used in 6 files                       |
| `multiTenantHints`   | none                                                                   |
| `stack`              | `react@18`, `vite@5`, `tailwindcss@3`                                  |
| `headlessLib`        | `@radix-ui/*`                                                          |
| `existingComponents` | 22 (`src/components/`)                                                 |

## Phase 2 — User answers

- **Q1 Domain.** `none/other`. Generic B2B SaaS with no normative
  visual language.
- **Q2 Theme axes.** `mode-only`. Single brand, no per-tenant
  branding, no density variants.
- **Q3 Tier needs.** Standard 3-tier (primitive / semantic /
  component).
- **Q4 Runtime.** Yes — but NOT for branding or theming. The team
  uses a feature-flag platform (LaunchDarkly) to run visual A/B
  experiments and wants the design contract to acknowledge that
  specific component tokens MAY be runtime-overridable for those
  experiments. The override is target-specific (a single CTA token
  today) and decoupled from any theming axis.
- **Q5 Anti-pattern catalog.** Yes. Code review in place; product
  expected to live for years.
- **Q6 Stack confirmation.** Confirmed. Output format: `tailwind`
  (Tailwind config) plus CSS custom properties.
- **Q7 Brand identity.** Primary `#2563EB` (blue), accent `#F59E0B`
  (amber). Font: `Inter` everywhere.
- **Q8 Output path.** Repo root.

## Phase 3 — Plan presented and confirmed

```
Based on your answers I'll include:
  - themingAxes: mode (build-time) only — no branding, density, or
                 aesthetic axes.
  - tokenTiers:  3 tiers — blue/amber/slate primitives, semantic
                 layer including a dedicated `cta` token, component
                 tier seeded.
  - invariants:  none — no normative domain.
  - antiPatterns: yes — hardcoded-hex, tailwind-arbitrary-color,
                 experiment-flag-bypass.
  - runtime:     yes — ONE entry, `colors.cta` sourced from a
                 feature flag, decoupled from any axis.

Token output format: tailwind + CSS custom properties
DESIGN.md path:     ./DESIGN.md

Proceed? (yes / edit / cancel)
```

User: `yes`.
</content>
</invoke>