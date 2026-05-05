---
version: alpha
name: Industrial Dashboard with Status Override Drift
description: >
  Industrial monitoring dashboard with the industrial-scada preset
  applied. A theme-override stylesheet redefines a status color,
  which violates the status-color-immutable invariant. Used as the
  AUDIT canonical error-severity fixture.
colors:
  blue-600: "#2563EB"
  gray-50: "#F8FAFC"
  gray-900: "#0F172A"
  primary: "{colors.blue-600}"
  surface: "{colors.gray-50}"
  text: "{colors.gray-900}"
  text-on-primary: "{colors.gray-50}"
  status-normal: "#1A3A2F"
  status-advisory: "#1E3A5F"
  status-warning: "#854D0E"
  status-critical: "#7F1D1D"
  status-emergency: "#581C87"
  text-on-status-dark: "{colors.gray-50}"
typography:
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.05em
rounded:
  sm: 4px
  md: 8px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-on-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  alarm-normal:
    backgroundColor: "{colors.status-normal}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
  alarm-advisory:
    backgroundColor: "{colors.status-advisory}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
  alarm-warning:
    backgroundColor: "{colors.status-warning}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
  alarm-critical:
    backgroundColor: "{colors.status-critical}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
  alarm-emergency:
    backgroundColor: "{colors.status-emergency}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
themingAxes:
  mode:
    values: [light, dark]
    controls: [colors.surface, colors.text]
  branding:
    runtime: true
    source: tenant.theme_primary
    controls: [colors.primary]
    excludedFrom: [colors.status-normal, colors.status-advisory, colors.status-warning, colors.status-critical, colors.status-emergency]
tokenTiers:
  primitive:
    - colors.blue-600
    - colors.gray-50
    - colors.gray-900
  semantic:
    - colors.primary
    - colors.surface
    - colors.text
    - colors.text-on-primary
    - colors.status-normal
    - colors.status-advisory
    - colors.status-warning
    - colors.status-critical
    - colors.status-emergency
    - colors.text-on-status-dark
  component:
    - components.button-primary.backgroundColor
    - components.card.backgroundColor
    - components.alarm-critical.backgroundColor
# Invariants imported from preset: industrial-scada
# References: ANSI/ISA-101.01-2015, ANSI/ISA-18.2-2016, IEC 62682
invariants:
  - id: status-color-immutable
    description: Status colors are not customizable per tenant; they encode operational meaning, not branding.
    scope: [colors.status-normal, colors.status-advisory, colors.status-warning, colors.status-critical, colors.status-emergency]
    enforcement: ci-only
    severity: error
  - id: branding-excluded-from-status
    description: Tenant brand colors must NOT influence status colors; runtime branding scopes to accent and surface only.
    scope: [colors.status-normal, colors.status-advisory, colors.status-warning, colors.status-critical, colors.status-emergency]
    enforcement: ci-only
    severity: error
  - id: redundant-encoding
    description: Each status communicated by AT LEAST color + symbol/shape. Color alone is insufficient (color blindness, monochrome secondary displays).
    scope: [components.alarm-normal, components.alarm-advisory, components.alarm-warning, components.alarm-critical, components.alarm-emergency]
    enforcement: manual
    severity: error
  - id: calm-default-state
    description: Normal/operational state is visually muted; saturation and color intensity reserved for abnormal states.
    scope: [colors.surface, colors.text]
    enforcement: manual
    severity: warning
  - id: alarm-priority-distinguishable
    description: ISA-18.2 priority levels (low/medium/high/critical/emergency) must be perceptually distinguishable, not just labeled.
    scope: [components.alarm-normal, components.alarm-advisory, components.alarm-warning, components.alarm-critical, components.alarm-emergency]
    enforcement: manual
    severity: error
antiPatterns:
  - id: hardcoded-color-literal
    severity: warning
    detect:
      type: regex
      pattern: '#[0-9a-fA-F]{3,8}\b'
      paths: ['src/**/*.{ts,tsx,css,scss}']
      excludePaths: ['src/tokens/**']
    remediation: Replace literal hex with a token reference from colors.*.
runtime:
  - path: colors.primary
    source: tenant.theme_primary
    fallback: "#2563EB"
    scope: tenant
audit:
  failOn: [error, warning]
  excludePaths:
    - "**/*.test.tsx"
    - "**/*.stories.tsx"
  excludeRules: []
  additionalPaths: []
---

# Industrial Dashboard with Status Override Drift

## Overview

The contract carries the `industrial-scada` preset's two
ci-enforceable invariants. A theme-override stylesheet checked into
the repo redeclares `--status-critical` to satisfy a customer
preference, which the invariants exist to prevent. AUDIT exits
`1` because the violation is at error severity.
</content>
</invoke>