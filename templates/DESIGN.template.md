---
version: alpha
name: CDD Reference System
description: >
  Generic reference design system used as the canonical template for
  CDD-DesignMD-Pro. Exercises every upstream section and every CDD
  extension with realistic but non-domain-specific values.
colors:
  brand-500: "#1f5dcf"
  brand-600: "#1a4daa"
  gray-50: "#f8f9fb"
  gray-100: "#eef0f4"
  gray-300: "#c5cad3"
  gray-700: "#3a4150"
  gray-900: "#101319"
  status-ok-bg: "#207a4a"
  status-warn-bg: "#b87a07"
  status-error-bg: "#a8341f"
  primary: "{colors.brand-500}"
  primary-hover: "{colors.brand-600}"
  surface: "{colors.gray-50}"
  surface-strong: "{colors.gray-100}"
  text: "{colors.gray-900}"
  text-muted: "{colors.gray-700}"
  text-on-primary: "{colors.gray-50}"
  border: "{colors.gray-300}"
  accent: "{colors.brand-500}"
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
    letterSpacing: -0.01em
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
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.text-on-primary}"
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
  divider:
    backgroundColor: "{colors.border}"
    height: "1px"
  caption:
    textColor: "{colors.text-muted}"
    typography: "{typography.body-sm}"
  badge-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text-on-primary}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
  status-ok:
    backgroundColor: "{colors.status-ok-bg}"
    textColor: "{colors.text-on-primary}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
  status-warn:
    backgroundColor: "{colors.status-warn-bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
  status-error:
    backgroundColor: "{colors.status-error-bg}"
    textColor: "{colors.text-on-primary}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
    typography: "{typography.label-md}"
themingAxes:
  mode:
    values: [light, dark]
    controls: [colors.surface, colors.surface-strong, colors.text, colors.text-muted, colors.border]
  density:
    values: [comfortable, compact]
    controls: [spacing.md, spacing.lg, components.card.padding]
  branding:
    runtime: true
    source: tenant.theme_primary
    controls: [colors.accent]
    excludedFrom: [colors.status-ok-bg, colors.status-warn-bg, colors.status-error-bg]
tokenTiers:
  primitive:
    - colors.brand-500
    - colors.brand-600
    - colors.gray-50
    - colors.gray-100
    - colors.gray-300
    - colors.gray-700
    - colors.gray-900
    - colors.status-ok-bg
    - colors.status-warn-bg
    - colors.status-error-bg
  semantic:
    - colors.primary
    - colors.primary-hover
    - colors.surface
    - colors.surface-strong
    - colors.text
    - colors.text-muted
    - colors.text-on-primary
    - colors.border
    - colors.accent
  component:
    - components.button-primary.backgroundColor
    - components.button-secondary.backgroundColor
    - components.card.backgroundColor
    - components.badge-accent.backgroundColor
invariants:
  - id: wcag-aa-body-text
    description: Body text on every surface must meet WCAG AA contrast (4.5:1).
    scope: [colors.text, colors.text-muted, colors.surface, colors.surface-strong]
    enforcement: automated
    type: contrast-min
    parameters:
      ratio: 4.5
  - id: status-color-stability
    description: Status colors are pinned by meaning and may not vary by axis.
    scope: [colors.status-ok-bg, colors.status-warn-bg, colors.status-error-bg]
    enforcement: automated
    type: no-mutation
  - id: brand-primary-pin
    description: The primary brand hue is fixed by the brand contract.
    scope: [colors.brand-500]
    enforcement: ci-only
    type: value-pin
    parameters:
      value: "#1f5dcf"
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
runtime:
  - path: colors.accent
    source: tenant.theme_primary
    fallback: "#1f5dcf"
    scope: tenant
  - path: spacing.md
    source: user.density
    fallback: 16px
    scope: session
---

# CDD Reference System

## Overview

This template is the canonical DESIGN.md emitted by CDD-DesignMD-Pro
in BOOTSTRAP mode and consumed by AUDIT and REFACTOR as the contract
for example workspaces. It is intentionally generic: a calm,
information-dense product UI that prioritises legibility over
ornament. The brand personality is precise, neutral, and engineering-
flavoured. Spacing and elevation favour clarity over softness; colour
is reserved for state, not decoration.

The system is multi-axis: it varies along **mode** (light vs dark),
**density** (comfortable vs compact), and **branding** (a runtime-
injected accent driven by the active tenant). All other visual
decisions are stable across these axes.

## Colors

The palette is built from a brand blue and a neutral gray ramp, with
three pinned status colours that never vary by theme. Semantic
roles (`primary`, `surface`, `text`, `border`, `accent`) reference
the primitive ramp; component tokens reference the semantic layer.

- **Primary (`#1f5dcf`):** the canonical brand hue. Used for the
  single most important action per screen.
- **Surface (`#f8f9fb` light / inverted in dark mode):** the
  baseline canvas for content.
- **Text (`#101319`):** body copy at maximum contrast.
- **Border (`#c5cad3`):** the structural separator between surfaces.
- **Status backgrounds (`#207a4a`, `#b87a07`, `#a8341f`):** pinned
  by meaning; do not theme.

The primitives in `colors.brand-*` and `colors.gray-*` are not
intended to be used directly by components; route through the
semantic layer.

## Typography

The system uses **Inter** for narrative text and **JetBrains Mono**
for labels and inline data. Type scale is conservative: a single
display level, one headline, two body sizes, and a single label.
Weights are restricted to 400, 500, and 600; finer gradations
encourage stylistic noise without aiding hierarchy.

- **`display-lg`** establishes the page voice when needed; reserve
  for marketing or empty-state hero treatments.
- **`headline-md`** is the workhorse for section titles inside
  product UI.
- **`body-md`** is the default for prose; **`body-sm`** for
  secondary metadata.
- **`label-md`** is monospaced and set in caps to differentiate
  technical readout from prose.

## Layout

Layout follows a **12-column fluid grid** with a fixed max-width of
1280px on desktop. The spacing scale is a 4px base with named steps
(`xs` through `xxl`); `gutter` and `margin` are derived for grid
contexts. Containers use `card` styling for grouping; bare content
sits on the surface.

The `density` axis varies the medium and large spacing units, which
in turn varies card padding. All other dimensions are stable.

## Elevation & Depth

The system uses **tonal depth** rather than shadow. Hierarchy is
expressed by changing the surface token (`surface` vs
`surface-strong`) and by border emphasis. Shadow is reserved for
ephemeral overlays (popovers, dropdowns); body content does not
cast shadow. This keeps the system flat enough to read in dense
data contexts without losing affordance for transient surfaces.

## Shapes

Corners are softly rounded (`rounded.md = 8px`) on interactive
elements and slightly larger (`rounded.lg = 12px`) on containers.
Status indicators and chips use `rounded.full`. Sharp corners
(`rounded.none`) are not used in the default theme; the `aesthetic`
axis is reserved for future expansion.

## Components

Component tokens reference the semantic layer; never the primitive
layer. Three components are declared:

- **`button-primary`** is the high-emphasis action: brand colour
  background, surface-coloured label, monospaced label
  typography, medium radius. One primary action per screen.
- **`button-secondary`** is the supporting action: tonal
  background, full-contrast text, otherwise identical metrics.
- **`card`** is the grouping container: surface background, border
  emphasis, large radius, large padding. Padding tracks the
  density axis.

Variants for state (hover, pressed, disabled) are declared in
sibling component keys (e.g. `button-primary-hover`) when added;
the template omits them for brevity.

## Do's and Don'ts

- Do use `colors.primary` as the only background for high-emphasis
  buttons; reserve it for the single most important action per
  screen.
- Don't introduce additional accent hues at the component layer —
  route through `colors.accent` so the branding axis remains the
  single source of truth.
- Do meet WCAG AA contrast (4.5:1) for body text on every surface;
  the `wcag-aa-body-text` invariant enforces this.
- Don't theme the status colours; they are pinned by meaning and
  any deviation defeats their semantic purpose.
- Do bind density-sensitive padding to `spacing.md` / `spacing.lg`
  so the density axis can vary it; do not hardcode pixel values
  inside components.
- Don't read CSS custom properties directly for runtime tokens;
  go through the declared provider so the fallback contract holds.

## Theming Axes

Three axes are declared in the front matter:

- **`mode`** (`light`, `dark`) controls the surface, text, and
  border tokens. It is build-time: the active mode is selected at
  page load via a class on the document root.
- **`density`** (`comfortable`, `compact`) controls the medium and
  large spacing units, which propagate into card padding.
  Build-time, selected per user preference.
- **`branding`** is runtime, sourced from `tenant.theme_primary`,
  and controls only `colors.accent`. Status colours are excluded
  to preserve their meaning across tenants.

Each axis lists the token paths it controls; tokens not listed are
stable across that axis. Two axes never claim the same token
without an `excludedFrom` carve-out.

## Token Tiers

The token tree is partitioned into three tiers:

- **Primitive** holds raw values: the brand and gray ramps and the
  three pinned status colours. Primitives never reference other
  tokens.
- **Semantic** holds intent-bearing roles: `primary`, `surface`,
  `text`, `border`, `accent`, etc. Semantics may reference
  primitives.
- **Component** holds component-scoped values that reference the
  semantic layer (preferred) or, where no semantic exists, a
  primitive directly.

Tier inversion (a primitive that references a semantic, a semantic
that references a component) is an error. The skill enforces this
during AUDIT.

## Invariants

Three invariants are declared:

- **`wcag-aa-body-text`**: every (text, surface) pair must meet a
  4.5:1 contrast ratio. Automated; checked on every change.
- **`status-color-stability`**: status colours may not be mutated
  by any axis. Automated.
- **`brand-primary-pin`**: `colors.brand-500` is pinned to its
  literal value by brand contract. CI-only; the primitive cannot
  drift through manual edits.

Invariant violations are always `error` severity; AUDIT findings
of this type block REFACTOR.

## Anti-Patterns

Three drift catalog entries are declared:

- **`hardcoded-hex`** (warning) — any literal hex outside the
  token files indicates colour drift.
- **`tailwind-arbitrary-color`** (error) — Tailwind arbitrary-
  value classes for colour bypass the semantic layer entirely.
- **`inline-style-color`** (info) — JSX inline colour styles are
  legible but should be hoisted into stylesheets so semantics can
  travel with them.

`error`-severity anti-patterns are treated as invariants by AUDIT:
any match blocks REFACTOR completion.

## Runtime Tokens

Two runtime tokens are declared:

- **`colors.accent`** is sourced from `tenant.theme_primary`,
  scoped per-tenant, and falls back to `#1f5dcf` (the brand blue)
  if no tenant override is present. This is the binding for the
  `branding` axis.
- **`spacing.md`** is sourced from `user.density`, scoped per-
  session, and falls back to `16px`. This is the binding for the
  `density` axis at runtime when the user changes density mid-
  session.

Runtime tokens must be read through the declared provider; reading
the underlying CSS custom property directly bypasses the fallback
contract and is flagged by AUDIT.

---

> **Note on linter warnings.** The five extension sections above
> (Theming Axes, Token Tiers, Invariants, Anti-Patterns, Runtime
> Tokens) follow the upstream `## Do's and Don'ts` and are not part
> of the canonical section list defined by `@google/design.md`
> alpha. Upstream `lint` may emit `section-order` warnings or treat
> them as unknown sections; both are expected. The skill's own
> validator covers the extension content; the upstream linter is
> the source of truth for the canonical sections only.
