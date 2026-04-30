# BOOTSTRAP Input — Greenfield React SaaS

## Phase 1 — Detected signals

| Signal               | Value                                                 |
| -------------------- | ----------------------------------------------------- |
| `hasDesignMd`        | false                                                 |
| `hasTokenAssets`     | false                                                 |
| `multiThemeHints`    | partial — `next-themes` package present, no class hits yet |
| `multiTenantHints`   | strong — `Tenant`, `Workspace`, `OrgId` types in `src/types/` |
| `stack`              | `react@18`, `next@14`, `tailwindcss@3`                |
| `headlessLib`        | `@radix-ui/react-*` (8 packages)                      |
| `existingComponents` | 0 (greenfield)                                        |

## Phase 2 — User answers

- **Q1 Domain.** `none/other`. The product is generic B2B SaaS
  collaboration tooling.
- **Q2 Theme axes.** `mode + branding`. No density axis: a single
  spacing system is acceptable. Aesthetic axis not needed: one look.
- **Q3 Tier needs.** Yes — explicit primitive / semantic / component
  tiers. The team wants to onboard new devs without ambiguity.
- **Q4 Runtime.** Yes. Tenant accent color is injected per request.
- **Q5 Anti-pattern catalog.** Yes. Six-person team with code review;
  long-lived product.
- **Q6 Stack confirmation.** Confirmed. Output format: `tailwind`
  (Tailwind config) plus CSS custom properties for runtime tokens.
- **Q7 Brand identity.** Primary `#0EA5E9`, accent `#F59E0B`. Font:
  `Inter` for prose, `JetBrains Mono` for technical labels.
- **Q8 Output path.** Repo root.

## Phase 3 — Plan presented and confirmed

```
Based on your answers I'll include:
  - themingAxes: mode (build-time, controls surface/text/border)
                 + branding (runtime, controls accent only)
  - tokenTiers:  3 tiers — primitive (gray + brand ramps),
                 semantic (intent roles), component (component-scoped)
  - invariants:  none — domain "none/other"
  - antiPatterns:yes — hardcoded-hex, tailwind-arbitrary-color,
                 inline-style-color (and two more)
  - runtime:     yes — colors.accent sourced from tenant config

Token output format: tailwind + CSS custom properties
DESIGN.md path:     ./DESIGN.md

Proceed? (yes / edit / cancel)
```

User: `yes`.
