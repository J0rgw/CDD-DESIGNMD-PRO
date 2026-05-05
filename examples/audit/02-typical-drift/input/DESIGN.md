---
version: alpha
name: Typical Drift Reference
description: >
  B2B SaaS where six months of feature work without contract
  enforcement produced typical drift: hex literals in components,
  inline-style colors, a primitive read directly, and a token left
  declared but never used. Used as the AUDIT canonical
  warning+info fixture.
colors:
  blue-600: "#2563EB"
  gray-50: "#F8FAFC"
  gray-100: "#F1F5F9"
  gray-700: "#334155"
  gray-900: "#0F172A"
  primary: "{colors.blue-600}"
  surface: "{colors.gray-50}"
  surface-strong: "{colors.gray-100}"
  text: "{colors.gray-900}"
  text-muted: "{colors.gray-700}"
  text-on-primary: "{colors.gray-50}"
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
  caption:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-md}"
themingAxes:
  mode:
    values: [light, dark]
    controls: [colors.surface, colors.surface-strong, colors.text]
tokenTiers:
  primitive:
    - colors.blue-600
    - colors.gray-50
    - colors.gray-100
    - colors.gray-700
    - colors.gray-900
  semantic:
    - colors.primary
    - colors.surface
    - colors.surface-strong
    - colors.text
    - colors.text-muted
    - colors.text-on-primary
  component:
    - components.button-primary.backgroundColor
    - components.card.backgroundColor
    - components.caption.backgroundColor
antiPatterns:
  - id: hardcoded-color-literal
    severity: warning
    detect:
      type: regex
      pattern: '#[0-9a-fA-F]{3,8}\b'
      paths: ['src/**/*.{ts,tsx,css,scss}']
      excludePaths: ['src/tokens/**']
    remediation: Replace literal hex with a token reference from colors.*.
  - id: inline-style-attribute
    severity: warning
    detect:
      type: regex
      pattern: 'style=\{?\s*\{[^}]*color:\s*["''#]'
      paths: ['src/**/*.{tsx,jsx}']
    remediation: Move color into the stylesheet and reference a semantic token.
audit:
  failOn: [error]
  excludePaths:
    - "**/*.test.tsx"
    - "**/*.stories.tsx"
  excludeRules: []
  additionalPaths: []
---

# Typical Drift Reference

## Overview

The contract is the same shape as `01-clean-repo`. The codebase has
accumulated typical drift and exercises every warning+info path of
the AUDIT detector.
</content>
</invoke>