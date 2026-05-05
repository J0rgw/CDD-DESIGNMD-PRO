---
name: cdd-designmd-pro
version: 0.2.0
specCompatibility:
  designmd: "0.1.x"
license: Apache-2.0
description: |
  Extends Google's DESIGN.md (alpha) for frontend systems whose constraints
  exceed the upstream core: multi-axis theming, explicit token tiers, declared
  invariants (ISA-101, WCAG floors), formal anti-pattern catalogs, and
  runtime-injected tokens. The skill operates in three modes — BOOTSTRAP
  (interview the user and write the initial DESIGN.md), AUDIT (scan the
  codebase for violations of the contract), and REFACTOR (rewrite code so it
  conforms to the contract). All outputs remain backward compatible with the
  upstream `@google/design.md` schema.

  TRIGGERS — invoke when the user:
    - asks to "create / write / bootstrap a DESIGN.md", "design contract",
      "design system spec", or "tokens spec"
    - mentions multi-theme, multi-brand, dark/light + density, or
      aesthetic/mode/branding orthogonality
    - asks to audit a frontend repo for "hardcoded colors", "magic numbers",
      "token leakage", "off-system styles", "design drift", or "anti-patterns"
    - asks to refactor components/styles to conform to a token system, design
      contract, or DESIGN.md
    - mentions ISA-101, SCADA color rules, WCAG as a hard constraint, or any
      domain whose visual rules are non-negotiable
    - already has a DESIGN.md and wants to extend it or check drift against
      the codebase

  ANTI-TRIGGERS — do NOT invoke when:
    - the user only wants raw UI implementation with no system intent
      (use frontend-design / ui-ux-pro-max instead)
    - the request is backend, infra, data, or non-visual code
    - the user wants free-form visual art or marketing assets
      (use canvas-design instead)
    - the project has no design system ambition and the user has not asked
      for one — do not impose a contract unsolicited
    - the work is a one-off prototype the user explicitly marks as throwaway
---

# CDD-DesignMD-Pro

Extension of Google's DESIGN.md (alpha) for frontend systems whose
constraints exceed the upstream core. Backward compatible: every artifact
this skill emits remains a valid DESIGN.md per `@google/design.md spec`.

## Extensions over upstream

| Section        | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `themingAxes`  | Declare orthogonal axes (aesthetic × mode × branding) and matrices.  |
| `tokenTiers`   | Make the primitive → semantic → component hierarchy explicit.        |
| `invariants`   | Non-negotiable rules (ISA-101, WCAG floors, brand law).              |
| `antiPatterns` | Formal catalog of violations with detection + remediation hints.     |
| `runtime`      | Tokens injected at runtime (theme switcher, tenant skin, telemetry). |
| `audit`        | AUDIT workflow configuration (failOn thresholds, scope overrides).   |

## Capabilities

### 1. BOOTSTRAP

Goal: produce an initial DESIGN.md by interviewing the user.

- **Inputs accepted:**
  - free-text description of the product, brand(s), and constraints
  - an existing token file (CSS vars, Tailwind config, Style Dictionary,
    Figma variables export)
  - an existing partial DESIGN.md (will be extended, never overwritten)
- **Process:**
  1. Detect existing assets in the working dir (tokens, themes, configs).
  2. Run a structured interview covering: brands, themes, density modes,
     domain invariants, runtime needs.
  3. Draft the DESIGN.md, validate it against `@google/design.md spec`,
     iterate until clean.
  4. Place at the repo root unless the user specifies otherwise.
- **Output (canonical):**
  - `DESIGN.md` at the agreed path
  - a short summary of decisions made and unresolved questions
  - never modifies code in BOOTSTRAP mode

### 2. AUDIT

Goal: report every place the codebase contradicts the DESIGN.md.

- **Inputs accepted:**
  - a `DESIGN.md` (required) at repo root or explicit path
  - optional `--paths` to scope the scan
- **Process:**
  1. Parse and validate the DESIGN.md (must pass upstream `spec`).
  2. Build the contract: tokens, axes, invariants, anti-patterns.
  3. Scan source for: hardcoded literals where tokens are required,
     mode-specific styles outside the declared axes, runtime-token
     misuse, anti-pattern matches, invariant violations.
  4. Each finding has a `severity` (error | warning | info) and a `type`.
     Invariant violations are always `error`. Anti-patterns default to
     `warning` unless the DESIGN.md elevates them. Drift defaults to
     `info` unless the token is marked critical.
- **Output (canonical):**
  - `audit-report.md` — human-readable report grouped by severity
    (error / warning / info), with file:line headers, code
    excerpts, and remediation hints.
  - `audit-report.sarif.json` — SARIF 2.1.0 subset suitable for
    GitHub PR Annotations, IDE plugins, and programmatic
    post-processing. The exact subset emitted is documented in
    `skill-workflows/audit/sarif-schema.md`.

  AUDIT is read-only — it never edits code.

- **Exit codes:**
  - `0` — no finding has a severity in `audit.failOn` (default
    `[error]`).
  - `1` — at least one finding has a severity in `audit.failOn`.
  - `2` — configuration error: invalid DESIGN.md, cross-extension
    rule violation, or unreadable scope. Distinct from `1` so CI
    scripts can branch on contract failure vs. finding-driven
    failure.

### 3. REFACTOR

Goal: bring code into conformance with the DESIGN.md contract.

- **Inputs accepted:**
  - a `DESIGN.md` (required)
  - an `audit-report.json` (recommended) or a finding subset
  - optional `--dry-run`
- **Process:**
  1. Re-validate DESIGN.md and re-audit if no report supplied.
  2. Plan a minimal diff: replace literals with tokens, hoist
     mode-specific code to declared axes, remove anti-patterns.
  3. Apply edits; never invent new tokens — only those declared
     in the contract.
  4. Re-run AUDIT; report remaining residue.
- **Output (canonical):**
  - file edits in place
  - `refactor-report.md` (what changed, what was deferred and why)
  - exit non-zero if any `invariant`-severity finding remains

## Boundaries

- This skill **never** modifies the upstream `@google/design.md` schema.
  Extensions live under reserved keys; if upstream later claims those
  keys, this skill will namespace them under `cddPro:`.
- This skill does not generate visual art. For artwork use `canvas-design`.
  For greenfield UI without a system, use `frontend-design`.
- This skill does not enforce any specific tech stack. Token output
  format is negotiated during BOOTSTRAP (CSS vars, Tailwind, SD, etc.).

## Versioning

- This skill: SemVer, currently `0.2.0`.
- Tracks `@google/design.md` `alpha` (currently `0.1.x`); supported
  upstream range is declared in `package.json#designmd.supportedVersion`.
