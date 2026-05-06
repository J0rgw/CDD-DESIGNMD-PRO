---
version: alpha
name: Fix-Tier-Inversion Reference
description: >
  A contract whose primitives have been edited to reference
  semantic tokens — a hard tier inversion that REFACTOR
  normalizes by inlining the literal values back into the
  primitive layer.
colors:
  blue-500: "#0EA5E9"
  gray-50: "#F8FAFC"
  gray-200: "#E5E7EB"
  gray-900: "#0F172A"
  primary: "{colors.blue-500}"
  surface: "{colors.gray-50}"
  border: "{colors.gray-200}"
  text: "{colors.gray-900}"
  text-on-primary: "{colors.gray-900}"
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
  divider:
    backgroundColor: "{colors.border}"
    height: "1px"
themingAxes:
  mode:
    values: [light, dark]
    controls: [colors.surface, colors.text]
tokenTiers:
  primitive:
    - colors.blue-500
    - colors.gray-50
    - colors.gray-200
    - colors.gray-900
  semantic:
    - colors.primary
    - colors.surface
    - colors.border
    - colors.text
    - colors.text-on-primary
  component:
    - components.button-primary.backgroundColor
    - components.card.backgroundColor
    - components.divider.backgroundColor
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
  excludePaths: []
  excludeRules: []
  additionalPaths: []
---

# Fix-Tier-Inversion Reference

The contract is well-formed, but `src/tokens.css` has drifted:
three primitive CSS variables now read from semantic tokens
instead of holding literal values. REFACTOR resolves the
inversion by inlining the literals.