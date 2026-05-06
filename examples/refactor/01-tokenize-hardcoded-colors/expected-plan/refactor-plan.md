---
plan-id: 7f9c2b14-9e3d-4a1f-8b6c-2d5e8f1a9c3b
generated-at: 2026-05-06T10:00:00Z
source-design-md: ./DESIGN.md
source-audit-report: ./audit-report.json
target-codebase-hash: 4b3a8f2c9e1d5b7a6f0c8e4d2a9b3c5f7e1d8a4b6c2f9e3d5a7b1c4f8e6d2a9b
plan-version: "1.0"
---

# Refactor Plan

## Summary

- Tokenizable transformations: 4
- Structural changes deferred: 0
- Invariant violations rejected: 0
- Files affected: 3
- Estimated review time: 5

## Transformations

### transformation-1: tokenize primary in Button

- **File:** `src/Button.tsx`
- **Line:** 7
- **Column:** 23
- **Category:** tokenizable
- **Before:**

  ```tsx
        className="rounded bg-[#0EA5E9] px-3 py-2 text-sm text-white"
  ```

- **After:**

  ```tsx
        className="rounded bg-primary px-3 py-2 text-sm text-on-primary"
  ```

- **Rationale:** Replace literal hex with the brand primary token; matches `colors.primary` exactly. Paired text class promoted to `text-on-primary` so the contrast pair stays inside the contract.
- **Token used:** `colors.primary` (verified in DESIGN.md)

### transformation-2: tokenize border in Card

- **File:** `src/Card.tsx`
- **Line:** 6
- **Column:** 30
- **Category:** tokenizable
- **Before:**

  ```tsx
        style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 24 }}
  ```

- **After:**

  ```tsx
        style={{ border: "1px solid var(--colors-border)", borderRadius: 8, padding: 24 }}
  ```

- **Rationale:** Replace literal hex with the semantic border token. Tier promotion suggested (`gray-200` → `border`) because Card is a component-tier consumer.
- **Token used:** `colors.border` (verified in DESIGN.md)

### transformation-3: tokenize background in Header

- **File:** `src/Header.tsx`
- **Line:** 4
- **Column:** 24
- **Category:** tokenizable
- **Before:**

  ```tsx
        style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}
  ```

- **After:**

  ```tsx
        style={{ background: "var(--colors-surface)", borderBottom: "1px solid var(--colors-border)" }}
  ```

- **Rationale:** Two literals on the same line; bundled into one transformation since both replacements are deterministic and the line range is contiguous.
- **Token used:** `colors.surface`, `colors.border` (both verified in DESIGN.md)

### transformation-4: tokenize text color in Header

- **File:** `src/Header.tsx`
- **Line:** 7
- **Column:** 22
- **Category:** tokenizable
- **Before:**

  ```tsx
        <h1 style={{ color: "#0F172A" }}>Dashboard</h1>
  ```

- **After:**

  ```tsx
        <h1 style={{ color: "var(--colors-text)" }}>Dashboard</h1>
  ```

- **Rationale:** Replace literal hex with the semantic text token; matches `colors.text` resolved value exactly.
- **Token used:** `colors.text` (verified in DESIGN.md)

## Deferred items

(none)

## Rejected items

(none)

## Validation

- Plan validated at: 2026-05-06T10:00:01Z
- All transformations reference tokens defined in DESIGN.md: ✓
- No transformation modifies DESIGN.md itself: ✓
- All "Before" excerpts found at declared file:line: ✓