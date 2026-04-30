---
version: alpha
name: Brownfield Industrial Dashboard
description: >
  React + Vite dashboard for continuous-process plant monitoring.
  Imports an existing tailwind.config.js token set as primitives,
  layers a semantic tier on top, and applies the industrial-scada
  domain preset (ISA-101, ISA-18.2). Pre-wired for multi-tenant
  branding even though only one customer is live today.
colors:
  brand-green-500: "#16A34A"
  brand-green-700: "#15803D"
  sky-500: "#0EA5E9"
  gray-50: "#F9FAFB"
  gray-100: "#F3F4F6"
  gray-300: "#D1D5DB"
  gray-700: "#374151"
  gray-900: "#111827"
  status-normal: "#207A4A"
  status-advisory: "#0E7490"
  status-warning: "#854D0E"
  status-critical: "#B91C1C"
  status-emergency: "#86198F"
  primary: "{colors.brand-green-500}"
  primary-strong: "{colors.brand-green-700}"
  surface: "{colors.gray-50}"
  surface-strong: "{colors.gray-100}"
  text: "{colors.gray-900}"
  text-muted: "{colors.gray-700}"
  text-on-primary: "{colors.gray-900}"
  text-on-accent: "{colors.gray-900}"
  text-on-status-dark: "{colors.gray-50}"
  border: "{colors.gray-300}"
  accent: "{colors.sky-500}"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  vital-readout:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.05em
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-on-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.gray-50}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
  button-secondary:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  caption:
    textColor: "{colors.text-muted}"
    typography: "{typography.body-sm}"
  badge-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text-on-accent}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
  status-indicator-normal:
    backgroundColor: "{colors.status-normal}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
  status-indicator-advisory:
    backgroundColor: "{colors.status-advisory}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
  status-indicator-warning:
    backgroundColor: "{colors.status-warning}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
  status-indicator-critical:
    backgroundColor: "{colors.status-critical}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
  status-indicator-emergency:
    backgroundColor: "{colors.status-emergency}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
  vital-display:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    typography: "{typography.vital-readout}"
  divider:
    backgroundColor: "{colors.border}"
    height: "1px"
themingAxes:
  mode:
    values: [light, dark]
    controls: [colors.surface, colors.surface-strong, colors.text, colors.text-muted, colors.border]
  branding:
    runtime: true
    source: customer.theme_primary
    controls: [colors.accent]
    excludedFrom:
      - colors.status-normal
      - colors.status-advisory
      - colors.status-warning
      - colors.status-critical
      - colors.status-emergency
tokenTiers:
  primitive:
    - colors.brand-green-500
    - colors.brand-green-700
    - colors.sky-500
    - colors.gray-50
    - colors.gray-100
    - colors.gray-300
    - colors.gray-700
    - colors.gray-900
  semantic:
    - colors.primary
    - colors.primary-strong
    - colors.surface
    - colors.surface-strong
    - colors.text
    - colors.text-muted
    - colors.text-on-primary
    - colors.text-on-accent
    - colors.text-on-status-dark
    - colors.border
    - colors.accent
    - colors.status-normal
    - colors.status-advisory
    - colors.status-warning
    - colors.status-critical
    - colors.status-emergency
  component:
    - components.button-primary.backgroundColor
    - components.card.backgroundColor
    - components.vital-display.backgroundColor
invariants:
  # references:
  #   - ANSI/ISA-101.01-2015 (HMI for process automation)
  #   - ANSI/ISA-18.2-2016 (alarm management)
  #   - IEC 62682
  - id: status-color-immutable
    description: >
      Status colors (normal/advisory/warning/critical/emergency) are
      not customizable per tenant; they encode operational meaning,
      not branding.
    scope: colors.status-*
    enforcement: ci-only
    severity: error
  - id: redundant-encoding
    description: >
      Each status communicated by AT LEAST color + symbol/shape.
      Color alone is insufficient.
    scope: components.status-indicator-*
    enforcement: manual
    severity: error
  - id: calm-default-state
    description: >
      Normal/operational state is visually muted; saturation reserved
      for abnormal states.
    scope: colors.surface, colors.surface-strong, colors.text in nominal state
    enforcement: manual
    severity: warning
  - id: alarm-priority-distinguishable
    description: >
      ISA-18.2 priority levels must be perceptually distinguishable,
      not just labeled.
    scope: components.status-indicator-*
    enforcement: manual
    severity: error
  - id: branding-excluded-from-status
    description: >
      Customer brand colors must NOT influence status colors; runtime
      branding scopes to accent only.
    scope: themingAxes.branding.excludedFrom must include status-*
    enforcement: ci-only
    severity: error
antiPatterns:
  - id: hardcoded-hex
    severity: warning
    detect:
      type: regex
      pattern: '#[0-9a-fA-F]{3,8}\b'
      paths: ['src/**/*.{ts,tsx,css,scss}']
      excludePaths: ['src/tokens/**', 'src/**/*.test.*']
    remediation: Replace literal hex with a token reference from colors.*.
  - id: tailwind-arbitrary-color
    severity: error
    detect:
      type: regex
      pattern: '\b(bg|text|border)-\[#[0-9a-fA-F]+\]'
      paths: ['src/**/*.{ts,tsx}']
    remediation: Use a Tailwind class bound to a semantic color token.
  - id: inline-style-color
    severity: info
    detect:
      type: regex
      pattern: 'style=\{?\s*\{[^}]*color:\s*["''#]'
      paths: ['src/**/*.{tsx,jsx}']
    remediation: Move the color into the stylesheet and reference a semantic token.
  - id: customer-accent-bypass
    severity: error
    detect:
      type: regex
      pattern: 'var\(--customer-accent\)'
      paths: ['src/**/*.{ts,tsx,css}']
    remediation: Read customer accent through the Theme provider, not the CSS variable.
runtime:
  - path: colors.accent
    source: customer.theme_primary
    fallback: "#0EA5E9"
    scope: tenant
---

# Brownfield Industrial Dashboard

## Overview

This DESIGN.md was generated by CDD-DesignMD-Pro for an existing
React + Vite dashboard for continuous-process plant monitoring. The
existing `tailwind.config.js` is preserved by importing its color
and spacing entries verbatim as tier-1 primitives. The new contract
adds a semantic tier above them, formalizes status colors per
ISA-101, models alarm priority per ISA-18.2, and pre-wires
multi-tenant branding even though only one customer is live today.

The brand voice is sober and operational. Color is reserved almost
entirely for status; surfaces are muted; type is dense and
monospaced for readouts.

## Colors

The palette has three layers. **Brand and gray primitives** were
imported from the existing tailwind config and are not consumed
directly by components. **Status primitives** (five hues) encode
ISA-101 operational states and are protected from any theming axis.
**Semantic tokens** route every component through one of the above.

- **Primary (`#16A34A`):** the current customer's brand green. Used
  for primary actions in the application chrome — *not* for status.
- **Accent (`#0EA5E9`):** the sky accent. Overridden per customer at
  runtime.
- **Status — normal (`#207A4A`):** muted green for nominal state.
  Distinct from primary green to avoid confusion between brand and
  operational meaning.
- **Status — advisory (`#0E7490`):** teal for low-priority events.
- **Status — warning (`#854D0E`):** dark amber for medium-priority.
  Darker than typical SaaS amber so light text on top clears WCAG-AA.
- **Status — critical (`#B91C1C`):** red for high-priority alarms.
- **Status — emergency (`#86198F`):** magenta for the highest
  priority. Distinct from critical for ISA-18.2 distinguishability.

All five status indicators take light text on top
(`text-on-status-dark` → `gray-50`); the `status-warning` hex was
darkened to `#854D0E` so this single text color works across the
full status set without per-priority pairing.

## Typography

The system uses **Inter** for narrative and **JetBrains Mono** for
labels and vital readouts.

- **`vital-readout`** is the dedicated 24px monospaced scale for
  numeric values that operators scan at distance.
- **`label-md`** is the smaller monospaced scale for indicator
  chrome.
- Body and headline scales follow conventional product UI.

## Layout

A 12-column grid, fixed max-width 1440px on desktop (wider than
typical SaaS to accommodate plant overviews). 4px-based spacing
scale, named `xs` through `xxl`. No density axis: a single calibrated
spacing system is mandated by the calm-default-state invariant.

## Elevation & Depth

Tonal layering only. Cards sit on `surface`; the dashboard chrome
sits on `surface-strong`. Shadow is reserved for transient overlays
(context menus, tooltips). Status indicators do NOT use elevation;
their distinctness is colour + shape per ISA-101.

## Shapes

Indicators and chips: `rounded.full`. Cards and panels:
`rounded.lg`. Buttons: `rounded.md`. Sharp corners are not used;
none are required by the domain.

## Components

The component set seeds a five-level status indicator family
(normal / advisory / warning / critical / emergency), a vital
display tile, the standard buttons and card, and the divider. Each
status indicator is its own component to allow per-priority
overrides without violating the immutability invariant.

## Do's and Don'ts

- Do read customer accent through the Theme provider; never reach
  the CSS variable directly.
- Don't theme status colours under any circumstances. They encode
  operational meaning, not brand.
- Do communicate every status through both color and shape/symbol.
  Color alone fails ISA-101.
- Don't introduce new alarm hues at the component layer; extend the
  status semantic set if the priority taxonomy changes.
- Do meet WCAG-AA on every text/surface pair, including status
  indicators.
- Don't use the brand green (`primary`) where a status green is
  appropriate. They are different concepts.

## Theming Axes

Two axes are declared:

- **`mode`** (`light`, `dark`) controls the surface, text, and
  border tokens. Build-time.
- **`branding`** is runtime, sourced from
  `customer.theme_primary`, and controls **only** `colors.accent`.
  All five status colors are listed under `excludedFrom` to enforce
  the `branding-excluded-from-status` invariant.

## Token Tiers

Three tiers, with brownfield-specific notes:

- **Primitive** — eight colors imported verbatim from the existing
  `tailwind.config.js` (`brand-green-*`, `sky-500`, `gray-*`).
  Primitives never reference other tokens.
- **Semantic** — eighteen tokens including the five status roles,
  the four `text-on-*` paired roles, and the standard
  `primary`/`surface`/`text` set.
- **Component** — components reference semantic tokens; never
  primitive directly.

## Invariants

Five invariants, all from the `industrial-scada` domain preset:

- **`status-color-immutable`** — status hues never vary by axis.
- **`redundant-encoding`** — color + shape/symbol on every status.
- **`calm-default-state`** — saturation reserved for abnormal.
- **`alarm-priority-distinguishable`** — ISA-18.2 levels are
  perceptually distinct.
- **`branding-excluded-from-status`** — branding axis does not
  touch status colors.

These are starting points; the team can edit or remove any after
generation.

## Anti-Patterns

Four drift entries are declared:

- **`hardcoded-hex`** (warning), **`tailwind-arbitrary-color`**
  (error), **`inline-style-color`** (info) — the standard color-
  drift trio.
- **`customer-accent-bypass`** (error) — reading the customer
  accent CSS variable directly bypasses the runtime fallback.

## Runtime Tokens

One runtime token: `colors.accent`, sourced from
`customer.theme_primary`, scoped per-tenant, fallback `#0EA5E9`.
Only the accent is runtime; the rest of the palette is build-time.
