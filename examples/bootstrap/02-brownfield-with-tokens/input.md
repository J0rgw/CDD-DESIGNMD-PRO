# BOOTSTRAP Input — Brownfield Industrial Dashboard

## Phase 1 — Detected signals

| Signal               | Value                                                                              |
| -------------------- | ---------------------------------------------------------------------------------- |
| `hasDesignMd`        | false                                                                              |
| `hasTokenAssets`     | true — `tailwind.config.js` with `theme.extend.colors` (8 entries) and `spacing` (4 entries) |
| `multiThemeHints`    | weak — `dark:` Tailwind variants used in 12 files                                  |
| `multiTenantHints`   | medium — `Customer`, `Site`, `Plant` types in `src/domain/` (no per-customer routes yet) |
| `stack`              | `react@18`, `vite@5`, `tailwindcss@3`                                              |
| `headlessLib`        | `@headlessui/react`                                                                |
| `existingComponents` | 47 (`src/components/`)                                                             |

## Phase 2 — User answers

- **Q1 Domain.** `industrial-scada`. The product monitors a
  continuous-process plant; status colors and alarms follow ISA-101
  and ISA-18.2.
- **Q2a Mode axis.** `both`. The team wants to keep light/dark
  (web default in 2026; existing `dark:` Tailwind variants already
  in 12 files).
- **Q2b Other axes.** `branding`. Prepare for per-customer accent
  injected at runtime. No density axis.
- **Q3 Tier needs.** Yes. The existing tailwind colors are raw
  (`brand-green`, `gray-light`, etc.); the team wants a clear
  semantic layer above them.
- **Q4 Runtime.** Yes — per-customer accent will be runtime-injected
  once multi-tenancy ships. Single tenant today; declare the
  contract now.
- **Q5 Anti-pattern catalog.** Yes. Six devs with code review; long
  product lifespan.
- **Q6 Stack confirmation.** Confirmed. Output format: `tailwind`
  (Tailwind config) plus CSS custom properties.
- **Q7 Brand identity.** Current customer's primary `#16A34A`
  (green), accent `#0EA5E9` (sky). Font: `Inter` for prose,
  `JetBrains Mono` for technical labels.
- **Q8 Output path.** Repo root.

## Phase 3 — Plan presented and confirmed

```
Based on your answers I'll include:
  - themingAxes: mode (build-time) + branding (runtime, accent only,
                 status excluded per industrial-scada preset)
  - tokenTiers:  3 tiers — existing tailwind colors imported as
                 primitives; new semantic layer; component tier seeded
  - invariants:  industrial-scada preset (ISA-101 status,
                 ISA-18.2 alarms, branding excluded from status)
  - antiPatterns:yes — hardcoded-hex, tailwind-arbitrary-color,
                 inline-style-color, tenant-accent-bypass
  - runtime:     yes — colors.accent sourced from customer config

Token output format: tailwind + CSS custom properties
DESIGN.md path:     ./DESIGN.md

Proceed? (yes / edit / cancel)
```

User: `yes`.
