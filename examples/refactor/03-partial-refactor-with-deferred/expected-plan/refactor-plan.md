---
plan-id: a4b8c1d2-3e5f-4a6b-9c7d-8e9f0a1b2c3d
generated-at: 2026-05-06T12:00:00Z
source-design-md: ./DESIGN.md
source-audit-report: ./audit-report.json
target-codebase-hash: 1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d
plan-version: "1.0"
---

# Refactor Plan

## Summary

- Tokenizable transformations: 3 (resolving 5 audit findings; same-line literals bundled)
- Structural changes deferred: 2
- Invariant violations rejected: 1
- Files affected: 3
- Estimated review time: 8

## Transformations

### transformation-1: tokenize Button background

- **File:** `src/components/Button.tsx`
- **Line:** 8
- **Column:** 27
- **Category:** tokenizable
- **Before:**

  ```tsx
        style={{ background: "#2563EB", color: "#F8FAFC" }}
  ```

- **After:**

  ```tsx
        style={{ background: "var(--colors-primary)", color: "var(--colors-text-on-primary)" }}
  ```

- **Rationale:** Two literals on the same line bundled into one transformation. `#2563EB` matches `colors.primary`; `#F8FAFC` matches the resolved value of `colors.text-on-primary` for the brand-on-blue pair.
- **Token used:** `colors.primary`, `colors.text-on-primary` (both verified in DESIGN.md)

### transformation-2: tokenize Card background

- **File:** `src/components/Card.tsx`
- **Line:** 7
- **Column:** 27
- **Category:** tokenizable
- **Before:**

  ```tsx
        style={{ background: "#F8FAFC", color: "#0F172A" }}
  ```

- **After:**

  ```tsx
        style={{ background: "var(--colors-surface)", color: "var(--colors-text)" }}
  ```

- **Rationale:** `#F8FAFC` matches `colors.surface`; `#0F172A` matches `colors.text`. Both are semantic-tier and route through their primitives.
- **Token used:** `colors.surface`, `colors.text` (both verified in DESIGN.md)

### transformation-3: tokenize AlarmBanner background

- **File:** `src/components/AlarmBanner.tsx`
- **Line:** 7
- **Column:** 47
- **Category:** tokenizable
- **Before:**

  ```tsx
        style={{ background: "#7F1D1D", color: "#F8FAFC" }}
  ```

- **After:**

  ```tsx
        style={{ background: "var(--colors-status-critical)", color: "var(--colors-text-on-status-dark)" }}
  ```

- **Rationale:** Status color pairing. `#7F1D1D` matches `colors.status-critical`; the foreground `#F8FAFC` matches the collapsed `colors.text-on-status-dark` shared by every status background.
- **Token used:** `colors.status-critical`, `colors.text-on-status-dark` (both verified in DESIGN.md)

## Deferred items

### deferred-1: hardcoded-color-literal in Card.test.tsx:14

- **File:** `src/components/Card.test.tsx:14`
- **Reason:** ambiguous-context
- **Note:** Match inside a string literal whose content is documenting the legacy hex value. Tokenizing the string would change test semantics. Audit included this file because the team scoped tests in for completeness; REFACTOR defers because the literal is intentional in this position.

### deferred-2: hardcoded-color-literal in Card.test.tsx:15

- **File:** `src/components/Card.test.tsx:15`
- **Reason:** ambiguous-context
- **Note:** Same as deferred-1: the hex appears as the expected value of an `expect(...).toBe(...)` assertion. Replacing it with a token reference would couple the test to the runtime resolver and change the intent of the assertion.

## Rejected items

### rejected-1: status-color-immutable in theme-override.css:8

- **File:** `src/styles/theme-override.css:8`
- **Invariant:** Status colors are not customizable per tenant; they encode operational meaning, not branding.
- **Reason:** invariant violations require human judgment

## Validation

- Plan validated at: 2026-05-06T12:00:01Z
- All transformations reference tokens defined in DESIGN.md: ✓
- No transformation modifies DESIGN.md itself: ✓
- All "Before" excerpts found at declared file:line: ✓