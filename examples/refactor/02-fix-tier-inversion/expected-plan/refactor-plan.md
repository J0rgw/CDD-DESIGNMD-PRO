---
plan-id: 91d3e4f5-a6c8-4b9d-bf2e-1a7c8d4e3b9f
generated-at: 2026-05-06T11:00:00Z
source-design-md: ./DESIGN.md
source-audit-report: ./audit-report.json
target-codebase-hash: 8c2f9b1a4d7e3a5b6c8f0e1d4a9b3c5f7e2d8a4b6c1f9e3d5a7b8c4f1e6d2a9c
plan-version: "1.0"
---

# Refactor Plan

## Summary

- Tokenizable transformations: 3
- Structural changes deferred: 0
- Invariant violations rejected: 0
- Files affected: 1
- Estimated review time: 4

## Transformations

### transformation-1: inline blue-500 primitive value

- **File:** `src/tokens.css`
- **Line:** 12
- **Column:** 3
- **Category:** tier-promotion
- **Before:**

  ```css
    --colors-blue-500: var(--colors-primary);
  ```

- **After:**

  ```css
    --colors-blue-500: #0EA5E9;
  ```

- **Rationale:** Primitive must hold a literal value. The current reference inverts tiers (primitive → semantic). Inline the resolved value of `colors.blue-500` from DESIGN.md.
- **Token used:** `colors.blue-500` (verified in DESIGN.md, value `#0EA5E9`)

### transformation-2: inline gray-50 primitive value

- **File:** `src/tokens.css`
- **Line:** 13
- **Column:** 3
- **Category:** tier-promotion
- **Before:**

  ```css
    --colors-gray-50: var(--colors-surface);
  ```

- **After:**

  ```css
    --colors-gray-50: #F8FAFC;
  ```

- **Rationale:** Same tier-inversion fix as transformation-1, applied to the gray-50 primitive.
- **Token used:** `colors.gray-50` (verified in DESIGN.md, value `#F8FAFC`)

### transformation-3: inline gray-200 primitive value

- **File:** `src/tokens.css`
- **Line:** 14
- **Column:** 3
- **Category:** tier-promotion
- **Before:**

  ```css
    --colors-gray-200: var(--colors-border);
  ```

- **After:**

  ```css
    --colors-gray-200: #E5E7EB;
  ```

- **Rationale:** Final inversion in the file; gray-200 inlined to its DESIGN.md literal value.
- **Token used:** `colors.gray-200` (verified in DESIGN.md, value `#E5E7EB`)

## Deferred items

(none)

## Rejected items

(none)

## Validation

- Plan validated at: 2026-05-06T11:00:01Z
- All transformations reference tokens defined in DESIGN.md: ✓
- No transformation modifies DESIGN.md itself: ✓
- All "Before" excerpts found at declared file:line: ✓