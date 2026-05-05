# Changelog

All notable changes to CDD-DesignMD-Pro are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Removed

- `detect.type: pattern` from the `antiPatterns` extension. Declarative
  pattern matching was specified but never documented or implemented;
  removed in favor of clarity. Will return in v0.2 with AST-based
  detection.

### Added

- Exit code `2` in AUDIT for configuration errors (invalid DESIGN.md
  or cross-extension violations), distinct from exit `1` (findings
  above `failOn` threshold) and exit `0` (clean run).
- SARIF 2.1.0 subset output as `audit-report.sarif.json`, documented
  in `skill-workflows/audit/sarif-schema.md`.
- `audit` extension to the schema (`failOn`, `excludePaths`,
  `excludeRules`, `additionalPaths`).
- Three audit example workflows (`01-clean-repo`, `02-typical-drift`,
  `03-invariant-violation`).
- `## Path syntax` section to the schema, documenting the unified
  glob syntax (with explicit brace expansion) used by all path
  fields.
- `docs/roadmap.md` tracking deferred items and future capabilities.

### Changed

- `invariants.<id>.scope` now accepts `string` OR `string[]`. Bare
  strings are normalized to single-element arrays internally; the
  canonical emitted form is always an array.
- `runtime.<entry>.fallback` is explicitly literal-only. Token
  references (e.g., `{colors.primary}`) are rejected. Rationale:
  the fallback is the safety net when runtime injection fails; if
  that safety net itself references another runtime token, two
  failure points are coupled.
- `audit.excludePaths`, `audit.additionalPaths`, and
  `antiPatterns.detect.paths` all reference the new `## Path syntax`
  section instead of duplicating the explanation. Brace expansion
  (e.g., `src/**/*.{ts,tsx}`) is explicitly supported.
- SKILL.md updated to reference SARIF output (was generic "JSON
  sidecar") and to enumerate AUDIT exit codes.

## [0.1.0] - 2026-01

Initial alpha release.

### Added

- SKILL.md with three capabilities: BOOTSTRAP, AUDIT, REFACTOR.
- Five extensions to DESIGN.md: `themingAxes`, `tokenTiers`,
  `invariants`, `antiPatterns`, `runtime`.
- BOOTSTRAP workflow with structured interview, three domain presets
  (`banking`, `healthcare`, `industrial-scada`), and three canonical
  examples (greenfield React SaaS, brownfield with tokens, runtime
  feature flag).
- AUDIT workflow protocol with six phases and regex-based detection.
- Compatibility with `@google/design.md` alpha (pinned to `0.1.1`).