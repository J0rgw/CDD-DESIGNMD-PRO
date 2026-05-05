---
version: alpha
name: Clean Repo Reference
description: >
  Small B2B SaaS with three components, all consuming tokens through
  the semantic layer. Used as the AUDIT canonical zero-findings
  fixture.
colors:
  blue-600: "#2563EB"
  gray-50: "#F8FAFC"
  gray-100: "#F1F5F9"
  gray-900: "#0F172A"
  primary: "{colors.blue-600}"
  surface: "{colors.gray-50}"
  surface-strong: "{colors.gray-100}"
  text: "{colors.gray-900}"
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
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  input-text:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
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
    - colors.gray-900
  semantic:
    - colors.primary
    - colors.surface
    - colors.surface-strong
    - colors.text
    - colors.text-on-primary
  component:
    - components.button-primary.backgroundColor
    - components.card.backgroundColor
    - components.input-text.backgroundColor
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

# Clean Repo Reference

## Overview

A minimal contract used as the AUDIT zero-findings fixture. Three
components consume tokens through the semantic layer; no source
file violates any anti-pattern, invariant, or tier rule.
</content>
</invoke>