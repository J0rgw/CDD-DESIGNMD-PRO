# Roadmap

This document tracks deferred items, future capabilities, and the
evolution of CDD-DesignMD-Pro across versions. It is the canonical
"what's next" reference and is read alongside `CHANGELOG.md` (which
tracks what already shipped).

## v0.2 (planned)

### AST-based detection

Replace the regex-only detector in AUDIT with AST parsing for JSX,
TSX, CSS, and SCSS. Eliminates false positives from comments and
string literals, which the v0.1.x detector matches indiscriminately.
Provides the foundation for semantic pattern detection (the
declarative `detect.type: pattern` reintroduction below).

Tracking: see `skill-workflows/audit.md` § "Known limitations
(v0.1.x)".

### Full SARIF schema validation in tests

Validate emitted `audit-report.sarif.json` files against the
official SARIF 2.1.0 JSON schema in `tests/audit-workflow.test.ts`,
using `ajv` + `ajv-formats`. Currently the test asserts the
documented subset only (mandatory and per-result fields). Full
validation is deferred until `ajv`'s audit obligation under the
project's Apache-2.0 redistribution becomes justified by runtime
AUDIT shipping with that dependency anyway.

Tracking: see `skill-workflows/audit/sarif-schema.md` and
`tests/audit-workflow.test.ts`.

### Enrich domain presets with `type` taxonomy

Once AUDIT runtime detection lands, revisit each of the 15
invariants across the `banking`, `healthcare`, and
`industrial-scada` presets. Assign appropriate `type`
(`contrast-min`, `color-floor`, `no-mutation`, `value-pin`, or
`custom` with explicit detector) and `parameters` per the schema
definition.

Until this lands, preset invariants are effectively
`enforcement: manual` regardless of declared enforcement.

Origin: mini-task 4.6 review hallazgo H#9.1.

### Verify path matcher implementation

The "Path syntax" section in `templates/extension-schema.md` cites
picomatch as the reference implementation. When AUDIT ships as
runtime code, verify that the actual matcher used (picomatch,
micromatch, fast-glob, minimatch, or other) matches the documented
syntax — including brace expansion, leading `!` negation, and the
ban on naked `..` traversal. Update either the documentation or
the implementation to align.

Origin: mini-task 4.5 review hallazgo H5.

### Declarative pattern matching for antiPatterns

Reintroduce `detect.type: pattern` (declarative, AST-aware) once
the AST migration above lands. Provides safer, more readable
detection rules than regex — for example, "any `style={…}` JSX
attribute that contains a literal hex" expressed structurally
rather than via regex backtracking.

Removed in v0.2.0 development; tracked here for reintroduction.

## v0.3+ (under consideration)

### Cross-domain "common patterns" preset category

Beyond domain-specific presets (banking, healthcare,
industrial-scada), introduce a category for patterns common across
domains: feature-flag bypass detection, hardcoded localhost URLs,
`console.log` in production paths, test IDs in production builds,
etc. The category would ship as a preset family that BOOTSTRAP can
mix into any domain selection.

Origin: session 3.5 review hallazgo H2 (`experiment-flag-bypass`).

### Programmatic API for the upstream linter

When upstream `@google/design.md` exposes a programmatic API
(currently CLI-only), migrate test infrastructure from
`child_process.spawnSync` to direct invocation. Faster tests,
better error messages, and a typed surface for the schema work.

Origin: session 2 trade-off, audit-workflow.test.ts limitation.

### Conventions section in extension-schema.md

When more than two cross-extension conventions exist (currently
"paired role tokens" and "preset attribution comment"), reorganize
into a dedicated `## Conventions` section in the schema rather
than nesting under specific extensions. Improves discoverability
and avoids the "is this a tokenTiers thing?" confusion.

Origin: session 3.5 review hallazgo H4.

### Meta-schema invariants (`type: schema-shape`)

Some invariants are machine-verifiable but operate on the
DESIGN.md structure itself rather than on source code (e.g.,
"`themingAxes.branding.excludedFrom` must include `status-*`").
These cannot use the current `type: contrast-min | color-floor |
no-mutation | value-pin | custom` taxonomy because their target
is the spec, not the codebase.

Proposed: introduce `type: schema-shape` for invariants that
validate the structure of the DESIGN.md itself. This requires
extending the parameters schema and the AUDIT detector to know
how to evaluate against the parsed contract.

Origin: mini-task 4.6 review hallazgo H#9.2
(`industrial-scada.branding-excluded-from-status`).

### Consider renaming `docs/foundations/` to `docs/spec/`

The directory `docs/foundations/` holds the 10 normative modules
that constitute the conceptual spec of the skill. The name is
ambiguous: contributors may not know what belongs there versus
in `docs/meta/`.

Renaming to `docs/spec/` (or `docs/contracts/`) would make the
role explicit. Trade-off: rename breaks any external bookmarks
and requires updating internal references. Defer until the
modules have substantive content (currently placeholders) so
the rename is worth the friction.

Origin: mini-task 4.6 review hallazgo H#9.4.

## Open questions

These are unresolved design decisions awaiting more user data
before they are answered:

- **Granularity of `audit.failOn` per finding type.** Currently
  severity-based only. Use case driving the question: fail on
  `error` for invariant violations but only `warning` for orphan
  tokens, expressed once at the contract level rather than via
  `excludeRules` + custom CI scripting.
- **Multi-DESIGN.md projects.** The protocol assumes one
  DESIGN.md per project. Monorepos with per-package contracts
  would need a discovery mechanism and a way to scope `--paths`
  across multiple contracts.
- **Internationalization of audit reports.** Currently
  English-only. SARIF natively supports localized message strings
  (`message.markdown` + `message.arguments`); whether to emit them
  depends on whether GitHub PR Annotations and IDE plugins
  honour the localization.
- **Component-rooted vs. sub-token-rooted tokenTiers paths in
  practice.** The schema permits both forms (see "Component-tier
  path forms" in extension-schema.md). Real-world usage will tell
  whether the choice should be normative.