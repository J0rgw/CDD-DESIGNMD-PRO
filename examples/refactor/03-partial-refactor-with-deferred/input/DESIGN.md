---
version: alpha
name: Partial-Refactor Reference (industrial-scada)
description: >
  Industrial monitoring contract with the industrial-scada preset
  invariants imported. Used as the REFACTOR canonical fixture for
  the mixed case: tokenizable colors plus an invariant violation
  that REFACTOR rejects plus deferred matches in test files.
colors:
  blue-600: "#2563EB"
  gray-50: "#F8FAFC"
  gray-900: "#0F172A"
  primary: "{colors.blue-600}"
  surface: "{colors.gray-50}"
  text: "{colors.gray-900}"
  text-on-primary: "{colors.gray-50}"
  status-critical: "#7F1D1D"
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
  alarm-critical:
    backgroundColor: "{colors.status-critical}"
    textColor: "{colors.text-on-status-dark}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
    typography: "{typography.label-md}"
themingAxes:
  mode:
    values: [light, dark]
    controls: [colors.surface, colors.text]
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
    - colors.status-critical
    - colors.text-on-status-dark
  component:
    - components.button-primary.backgroundColor
    - components.card.backgroundColor
    - components.alarm-critical.backgroundColor
# Invariants imported from preset: industrial-scada
# References: ANSI/ISA-101.01-2015, ANSI/ISA-18.2-2016, IEC 62682
invariants:
  - id: status-color-immutable
    description: >
      Status colors are not customizable per tenant; they encode
      operational meaning, not branding.
    scope: ["colors.status-*"]
    enforcement: ci-only
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
audit:
  failOn: [error]
  excludePaths:
    - "**/*.test.tsx"
  excludeRules: []
  additionalPaths: []
---

# Partial-Refactor Reference (industrial-scada)

Mixed audit: five tokenizable warnings, one invariant violation
(rejected), two deferred matches in `*.test.tsx` files.
REFACTOR applies the five tokenizable transformations and
explicitly leaves the invariant violation and the deferred
items for human review.