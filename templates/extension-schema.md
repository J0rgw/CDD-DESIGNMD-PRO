# CDD-DesignMD-Pro Extension Schema (alpha)

This document is the internal specification for the five extensions
that CDD-DesignMD-Pro layers on top of `@google/design.md`. It is the
authoritative reference for SKILL.md, the AUDIT/REFACTOR engine, and
every future foundation document.

## Compatibility Statement

The five extensions defined here — `themingAxes`, `tokenTiers`,
`invariants`, `antiPatterns`, and `runtime` — are designed to coexist
with the upstream `@google/design.md` schema (`alpha`, range `0.1.x`).
None of them collide with keys reserved or used by upstream as of the
referenced version: upstream owns `version`, `name`, `description`,
`colors`, `typography`, `rounded`, `spacing`, and `components`. We
add new top-level keys at the same level as those, so a vanilla
upstream linter ignores our keys without erroring.

This is enforced two ways:

1. Every artifact emitted by this skill remains parseable by upstream
   `design.md lint`. The linter may emit warnings about our extra
   markdown sections (out of canonical section order); those are
   tolerated and documented.
2. We run a second validation pass — implemented inside this skill —
   that applies the rules described in each extension below.

**Forward-compatibility strategy.** If a future upstream release
claims any of our top-level keys, we migrate the corresponding
extension under a `cddPro:` namespace (e.g. `cddPro.themingAxes`).
The skill will then read both shapes for one minor version and emit
a deprecation warning before dropping the unprefixed form.

## Extension: themingAxes

### Purpose

Most non-trivial frontend systems vary along more than one independent
axis: an aesthetic axis (e.g. `scada` vs `modern`), a mode axis
(`dark` vs `light`), and a branding axis (per-tenant or per-customer
accent colors injected at runtime). Without a declared structure,
these axes leak into ad-hoc CSS classes and one-off conditionals.
`themingAxes` makes the axes explicit, names which token paths each
axis controls, and declares which axes are runtime-driven.

This extension applies to any project that supports more than one
visual configuration of the same UI.

### YAML schema

```yaml
themingAxes:
  aesthetic:
    values: [scada, modern]
    controls: [rounded, shadow, density, fontFamily]
  mode:
    values: [dark, light]
    controls: [colors.surface, colors.text, colors.border]
  branding:
    runtime: true
    source: config.theme_primary
    controls: [colors.accent]
    excludedFrom: [colors.status]
```

### Field definitions

| Field          | Type        | Required | Description                                                                                                                          |
| -------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `values`       | `string[]`  | yes\*    | Enumerated, mutually exclusive values of the axis. Required for non-runtime axes. For a runtime axis, omit if values are open-ended. |
| `controls`     | `string[]`  | yes      | Token paths whose values are bound to this axis. Each entry is a dot path into the YAML token tree.                                  |
| `runtime`      | `boolean`   | no       | If `true`, the axis is driven by a runtime input rather than a build-time value. Defaults to `false`.                                |
| `source`       | `string`    | yes\*\*  | Identifier of the runtime input. Required when `runtime: true`. Free-form string; convention is `<provider>.<key>`.                  |
| `excludedFrom` | `string[]`  | no       | Token paths that must not vary with this axis even if they live under a controlled subtree. Only meaningful when `runtime: true`.    |

\* `values` is required unless `runtime: true` and the input space is
open. \*\* `source` is required only when `runtime: true`.

### Validation rules

1. Each axis has at least one entry in `controls`.
2. Each entry in `controls` resolves to a token path that exists in the
   front matter (in `colors`, `typography`, `rounded`, `spacing`, or
   `components`).
3. If `runtime: true`, `source` is mandatory.
4. `excludedFrom` is rejected if `runtime` is absent or `false`.
5. The values declared in `values` must be mutually exclusive at any
   given moment: at runtime, exactly one value is active per axis.
6. Two axes may not list the same token path under `controls` unless
   one of them lists it under `excludedFrom` to disambiguate.
7. A non-runtime axis must declare `values` with at least two entries
   (a single-value axis is degenerate and should be inlined).

### Minimal valid example

```yaml
themingAxes:
  mode:
    values: [dark, light]
    controls: [colors.surface, colors.text]
```

### Full example with all fields

```yaml
themingAxes:
  aesthetic:
    values: [scada, modern]
    controls: [rounded, shadow, density, fontFamily]
  mode:
    values: [dark, light]
    controls: [colors.surface, colors.text, colors.border]
  branding:
    runtime: true
    source: config.theme_primary
    controls: [colors.accent]
    excludedFrom: [colors.status]
```

### Common mistakes

- `controls: [my-custom-prop]` — `my-custom-prop` is not a path that
  resolves in the token tree. Use a real path like `colors.accent`.
- Declaring `runtime: false` together with `source: config.x` —
  `source` is only meaningful for runtime-driven axes. Either drop
  `source` or flip `runtime` to `true`.
- Listing the same token under `controls` of two different axes
  without an `excludedFrom` carve-out — the token cannot vary along
  two axes at once without ambiguity.

### Drift detection patterns

- A hardcoded value (CSS literal, Tailwind arbitrary value, inline
  style) on a property that the axis lists in `controls` is a drift
  finding: the value should come from the axis-bound token.
- A component reads a token from the `branding` axis (e.g.
  `colors.accent`) inside a region whose styling is on the
  `excludedFrom` list (e.g. status indicators) — invariant violation
  for that axis.
- A runtime axis's `source` is referenced from code that does not pass
  through the declared provider (e.g. reading the CSS variable
  directly instead of going through the theme context) — runtime
  drift.

## Extension: tokenTiers

### Purpose

A flat token namespace collapses the difference between raw values
("black"), semantic intents ("primary"), and component-local choices
("button-bg"). Once collapsed, every change becomes load-bearing for
unrelated places. `tokenTiers` makes the hierarchy explicit and lets
the skill enforce reference direction: `component → semantic → primitive`.

This extension applies to projects with more than ~30 tokens or with
a pre-existing intent of separating raw palette from semantic roles.

Semantic tokens typically reference primitives (e.g.,
`surface-card: {colors.gray-900}`), enabling theme switching by
swapping the underlying primitive. However, semantic tokens MAY
hold literal values when the role itself prescribes the value
canonically.

Example: in safety-critical domains where ISA-101 or IEC 60601-1-8
prescribes the exact hue for `status-critical`, that token is
semantic-literal — its value is not derived from a brand primitive
because the standard mandates the hue. Forcing an intermediate
primitive ("crit-red-base") would be ceremony, not abstraction.

Use semantic-literal only when the value is a normative or
domain-mandated decision. The default remains semantic-reference.

### YAML schema

```yaml
tokenTiers:
  primitive:
    - colors.gray-50
    - colors.gray-100
    - colors.brand-500
  semantic:
    - colors.surface
    - colors.text
    - colors.accent
  component:
    - components.button-primary.backgroundColor
    - components.card.borderColor
```

### Field definitions

| Field       | Type       | Required | Description                                                                            |
| ----------- | ---------- | -------- | -------------------------------------------------------------------------------------- |
| `primitive` | `string[]` | yes      | Token paths that hold raw, brand-neutral values. References to other tokens forbidden. |
| `semantic`  | `string[]` | yes      | Token paths that hold intent-bearing values. May reference `primitive`.                |
| `component` | `string[]` | no       | Component-scoped tokens. May reference `semantic` (preferred) or `primitive`.          |

### Validation rules

1. Every token path in the front matter is assigned to exactly one
   tier. Unassigned tokens trigger a warning.
2. A `primitive` token must hold a literal value (color hex,
   dimension, etc.); it must not contain a `{path}` reference.
3. A `semantic` token may reference only `primitive` tokens (or
   literals).
4. A `component` token may reference `semantic` or `primitive` tokens
   (or literals).
5. Tier inversion — a `primitive` referencing a `semantic`, or a
   `semantic` referencing a `component` — is an error.
6. The same path may not appear in more than one tier list.

### Minimal valid example

```yaml
tokenTiers:
  primitive: [colors.gray-50, colors.brand-500]
  semantic:  [colors.surface, colors.accent]
```

### Full example with all fields

```yaml
tokenTiers:
  primitive:
    - colors.gray-50
    - colors.gray-100
    - colors.gray-900
    - colors.brand-500
  semantic:
    - colors.surface
    - colors.text
    - colors.border
    - colors.accent
  component:
    - components.button-primary.backgroundColor
    - components.button-primary.color
    - components.card.borderColor
```

### Component-tier path forms

Tier-3 (component) entries in tokenTiers list paths to component
declarations. Two valid forms:

Component-rooted (declares the entire component as tier-3):

```yaml
tokenTiers:
  component:
    - components.button-primary
    - components.alarm-banner
```

Sub-token-rooted (declares specific properties as tier-3 while
others may inherit from semantic):

```yaml
tokenTiers:
  component:
    - components.button-primary.backgroundColor
    - components.button-primary.textColor
```

Sub-token-rooted is more precise but verbose. Use it when a
component mixes tiers (e.g., backgroundColor is component-tier
with a custom value, but typography inherits from a semantic
tier-2 token).

### Common mistakes

- Listing the same token under both `primitive` and `semantic` —
  tiers are partitions, not labels you stack.
- A primitive that references another token: `colors.gray-50:
  "{colors.brand-500}"`. Primitives are leaves of the reference graph.
- Putting every component-scoped value under `semantic` to avoid
  declaring `component`. The skill cannot then warn when component
  styles diverge from semantics.

### Drift detection patterns

- A token in `primitive` whose value contains `{...}` — tier inversion
  by construction.
- A code site (CSS, Tailwind class, JS style object) that reads a
  primitive directly when a semantic exists for the same intent —
  candidate drift; the skill suggests routing through the semantic.
- A new token added to the front matter that is not classified into
  any tier — governance drift; the skill prompts the user to
  classify it.

### Convention: paired role tokens (text-on-*, fg-on-*, etc.)

Background-role tokens (status-ok, primary, surface-card) often
need a paired foreground-role token to express the text/icon color
that goes on top.

CDD-DesignMD-Pro adopts the convention `text-on-X` for paired
tokens (e.g., text-on-primary, text-on-status-ok, text-on-warning).
Components express both roles explicitly:

```yaml
components:
  badge-success:
    backgroundColor: "{colors.status-ok}"
    textColor: "{colors.text-on-ok}"
```

This separation is what tokenTiers exists to enforce: status-ok is
a tier-2 semantic role (a state), text-on-ok is a tier-2 semantic
role (paired role), and badge-success is a tier-3 component that
combines both.

Paired tokens may be collapsed when all members of a group share
the same value — see Cross-extension rules below.

## Extension: invariants

### Purpose

Some rules are non-negotiable: ISA-101 forbids using red except for
abnormal-state alarms; WCAG AA mandates a 4.5:1 contrast minimum for
body text; a brand contract may forbid mutating the primary hue.
`invariants` declares those rules as first-class objects with an id,
a scope, and a severity. AUDIT always treats invariant violations as
errors.

This extension applies to any project that has at least one rule the
team is unwilling to break, regardless of design fashion.

### YAML schema

```yaml
invariants:
  - id: wcag-aa-text
    description: Body text must meet WCAG AA contrast (4.5:1) on every surface.
    scope: [colors.text, colors.surface]
    enforcement: automated
    type: contrast-min
    parameters:
      ratio: 4.5
  - id: status-color-floor
    description: Color-coded status uses red only for abnormal alarms.
    scope: [colors.status]
    enforcement: ci-only
    type: color-floor
```

### Field definitions

| Field          | Type       | Required | Description                                                                              |
| -------------- | ---------- | -------- | ---------------------------------------------------------------------------------------- |
| `id`           | `string`   | yes      | Unique kebab-case identifier. Stable across versions.                                    |
| `description`  | `string`   | yes      | Human-readable rationale. Appears in AUDIT findings.                                     |
| `scope`        | `string[]` | yes      | Token paths the invariant constrains. May be specific paths or `colors.*` wildcards.     |
| `enforcement`  | `string`   | yes      | One of `manual`, `automated`, `ci-only`.                                                 |
| `type`         | `string`   | no       | Invariant family: `contrast-min`, `color-floor`, `no-mutation`, `value-pin`, `custom`.   |
| `parameters`   | `object`   | no       | Type-specific arguments (e.g. `ratio` for `contrast-min`).                               |

### Validation rules

1. `id` is unique across the `invariants` list.
2. `scope` paths exist in the front matter (or resolve via wildcard).
3. `enforcement` is one of the three enumerated values.
4. If `type` is set, `parameters` must satisfy the type's contract:
   - `contrast-min` requires `ratio: number > 1`.
   - `color-floor` requires `palette: string[]` listing forbidden hues
     (or accepts a built-in catalog when omitted, e.g. ISA-101).
   - `no-mutation` takes no parameters.
   - `value-pin` requires `value: <literal>`.
5. An invariant of type `custom` must include a `detect` field
   describing how the skill matches violations.

### Minimal valid example

```yaml
invariants:
  - id: wcag-aa-text
    description: Body text contrast must meet WCAG AA.
    scope: [colors.text, colors.surface]
    enforcement: automated
```

### Full example with all fields

```yaml
invariants:
  - id: wcag-aa-text
    description: Body text must meet WCAG AA contrast (4.5:1) on every surface.
    scope: [colors.text, colors.surface]
    enforcement: automated
    type: contrast-min
    parameters:
      ratio: 4.5
  - id: status-color-floor
    description: Status colors follow ISA-101 conventions.
    scope: [colors.status]
    enforcement: ci-only
    type: color-floor
    parameters:
      catalog: isa-101
  - id: brand-primary-immutable
    description: The primary brand hue may not be mutated by themes.
    scope: [colors.brand-500]
    enforcement: automated
    type: no-mutation
```

### Common mistakes

- Reusing an `id` across two invariants — AUDIT findings would
  collide.
- A scope path that does not resolve (typo, removed token) —
  invariant becomes a no-op.
- Mismatching `type` and `parameters` (e.g. `contrast-min` without
  `ratio`).

### Drift detection patterns

- `contrast-min`: the skill computes contrast for every (text, surface)
  pair in scope and reports any pair below `ratio`.
- `color-floor`: any token in scope whose value falls within a
  forbidden hue range is flagged.
- `no-mutation`: any axis under `themingAxes.*.controls` that names a
  scoped path triggers an error — the token is being mutated.
- `value-pin`: any code site that overrides the pinned token with a
  literal value is flagged.
- `custom`: the `detect` rule is applied as written.

## Extension: antiPatterns

### Purpose

A drift catalog tells the skill what to look for in the codebase. Each
anti-pattern has an id, a severity, a detection rule, and a
remediation hint. Anti-patterns at severity `error` are upgraded to
invariant-equivalent treatment — REFACTOR will not exit clean while
they remain.

This extension applies to every project; even a small system benefits
from naming the violations it has decided to forbid.

### YAML schema

```yaml
antiPatterns:
  - id: hardcoded-hex
    severity: warning
    detect:
      type: regex
      pattern: '#[0-9a-fA-F]{3,8}\b'
      paths: ['src/**/*.{ts,tsx,css}']
      excludePaths: ['src/tokens/**']
    remediation: Replace literal hex with a token reference from colors.*.
  - id: tailwind-arbitrary-color
    severity: error
    detect:
      type: regex
      pattern: '\b(bg|text|border)-\[#'
      paths: ['src/**/*.{ts,tsx}']
    remediation: Use a Tailwind class bound to a semantic token.
```

### Field definitions

| Field           | Type     | Required | Description                                                                            |
| --------------- | -------- | -------- | -------------------------------------------------------------------------------------- |
| `id`            | `string` | yes      | Unique kebab-case identifier.                                                          |
| `severity`      | `string` | yes      | One of `error`, `warning`, `info`.                                                     |
| `detect`        | `object` | yes      | The match rule (see below).                                                            |
| `remediation`   | `string` | yes      | Short imperative sentence describing the fix.                                          |

`detect` shape:

| Field         | Type       | Required | Description                                                          |
| ------------- | ---------- | -------- | -------------------------------------------------------------------- |
| `type`        | `string`   | yes      | `regex` or `pattern` (declarative).                                  |
| `pattern`     | `string`   | yes      | The regex source or pattern body.                                    |
| `paths`       | `string[]` | no       | Glob(s) of files to scan. Defaults to all source files.              |
| `excludePaths`| `string[]` | no       | Globs to exclude from the scan.                                      |

### Validation rules

1. `severity` is one of `error`, `warning`, `info`.
2. `detect.type` is `regex` or `pattern`. If `regex`, `pattern` must
   compile under JavaScript regex semantics.
3. `id` is unique across the `antiPatterns` list.
4. Every anti-pattern has a non-empty `remediation`.
5. `paths` and `excludePaths` are valid globs (no naked path
   traversal like `..`).

### Minimal valid example

```yaml
antiPatterns:
  - id: hardcoded-hex
    severity: warning
    detect:
      type: regex
      pattern: '#[0-9a-fA-F]{3,8}\b'
    remediation: Replace literal hex with a token reference from colors.*.
```

### Full example with all fields

```yaml
antiPatterns:
  - id: hardcoded-hex
    severity: warning
    detect:
      type: regex
      pattern: '#[0-9a-fA-F]{3,8}\b'
      paths: ['src/**/*.{ts,tsx,css,scss}']
      excludePaths: ['src/tokens/**', 'src/**/*.test.*']
    remediation: Replace literal hex with a token reference from colors.*.
  - id: tailwind-arbitrary-color
    severity: error
    detect:
      type: regex
      pattern: '\b(bg|text|border)-\[#[0-9a-fA-F]+\]'
      paths: ['src/**/*.{ts,tsx}']
    remediation: Use a Tailwind class bound to a semantic token.
  - id: inline-style-color
    severity: info
    detect:
      type: regex
      pattern: 'style=\{?\s*\{[^}]*color:\s*["''#]'
      paths: ['src/**/*.{tsx,jsx}']
    remediation: Move color into the stylesheet and reference a semantic token.
```

### Common mistakes

- A `detect.pattern` that does not compile as a regex when `type:
  regex` — the rule silently never matches.
- Severity left at default — the skill enforces `error` literally;
  ambiguous defaults are not allowed.
- Overlapping `paths` between two rules without coordination, leading
  to duplicate findings on the same line.

### Drift detection patterns

The literal application of `detect`. The skill walks `paths`, applies
`pattern`, and reports each match as a finding tagged with the rule's
`id` and `severity`. Findings include the matched line, file, and a
remediation suggestion.

## Extension: runtime

### Purpose

Some tokens cannot be resolved at build time: a per-tenant accent
color, a user-selected density, a feature-flag-driven palette swap.
`runtime` declares these tokens explicitly: where the value comes
from, what fallback applies if the runtime input is absent, and what
scope the token covers. This makes runtime theming auditable instead
of folkloric.

This extension applies whenever any token is dynamic at request,
session, or render time.

### YAML schema

```yaml
runtime:
  - path: colors.accent
    source: config.theme_primary
    fallback: '#0066cc'
    scope: app
  - path: spacing.density-unit
    source: user.density
    fallback: 8px
    scope: session
```

### Field definitions

| Field      | Type     | Required | Description                                                                |
| ---------- | -------- | -------- | -------------------------------------------------------------------------- |
| `path`     | `string` | yes      | Token path the runtime value populates.                                    |
| `source`   | `string` | yes      | Identifier of the runtime input. Convention: `<provider>.<key>`.           |
| `fallback` | `value`  | yes      | Literal value used when the runtime input is missing or invalid.           |
| `scope`    | `string` | no       | One of `app`, `tenant`, `user`, `session`, `request`. Defaults to `app`.   |

### Validation rules

1. `path` resolves to a token defined in the front matter.
2. `fallback` is a literal value of the type matching the token at
   `path` (a hex color for `colors.*`, a dimension or number for
   `spacing.*`, etc.).
3. `source` is non-empty and follows the `<provider>.<key>` convention
   (warning, not error, if it does not).
4. If `scope` is provided it is one of the enumerated values.
5. A token marked under `runtime` must also be the target of an
   axis with `runtime: true` in `themingAxes`, OR it must not appear
   in any axis at all (a runtime token with no axis is an
   independent runtime override).

### Minimal valid example

```yaml
runtime:
  - path: colors.accent
    source: config.theme_primary
    fallback: '#0066cc'
```

### Full example with all fields

```yaml
runtime:
  - path: colors.accent
    source: config.theme_primary
    fallback: '#0066cc'
    scope: app
  - path: colors.banner
    source: feature.holiday_skin
    fallback: '#cccccc'
    scope: request
  - path: spacing.density-unit
    source: user.density
    fallback: 8px
    scope: session
```

### Common mistakes

- A `path` that does not exist in the front matter — the runtime
  declaration has no token to populate.
- A `fallback` whose type disagrees with the token's type (e.g.
  `fallback: 8px` for a color path).
- Listing a token under `runtime` while a non-runtime axis claims it
  in `controls` — the axis says build-time, runtime says dynamic.

### Drift detection patterns

- A code site reads the token's CSS custom property directly without
  going through the declared provider — runtime drift; the value
  bypasses the fallback contract.
- The fallback value is also hardcoded in code as a redundant default
  — duplication finding; trust the runtime declaration.
- A runtime token is referenced from a `primitive` tier — tier
  inversion combined with runtime drift.

## Cross-extension rules

These rules apply to combinations of the above extensions and are
checked after each extension passes its own validation:

1. If `themingAxes.<axis>.runtime: true`, there must be at least one
   entry in `runtime` whose `source` matches the axis's `source`.
2. Every token listed in `themingAxes.<axis>.controls` should appear
   in `tokenTiers` if `tokenTiers` is declared (warning if missing).
3. Token paths under `tokenTiers.primitive` must not appear in
   `runtime` — primitives are static by definition.
4. `invariants` and `antiPatterns` may reference tokens of any tier
   and any axis. `tokenTiers` may not reference invariants or
   anti-patterns (the dependency direction is one-way).
5. Anti-patterns with `severity: error` are treated as invariants by
   AUDIT: any match blocks REFACTOR from completing successfully.
6. `runtime` entries whose `path` is also constrained by an
   invariant of type `value-pin` are an error — the value cannot be
   both pinned and runtime.
7. **Domain preset attribution.** When BOOTSTRAP applies a domain
   preset (banking, healthcare, industrial-scada), the preset's
   `references` field is emitted as a YAML comment block above the
   merged invariants:

   ```yaml
   # Invariants imported from preset: industrial-scada
   # References: ANSI/ISA-101.01-2015, ANSI/ISA-18.2-2016, IEC 62682
   invariants:
     - id: status-color-immutable
       ...
   ```

   This convention preserves traceability from invariants back to
   their normative sources without inflating the YAML schema. AUDIT
   workflows may surface these references in reports.

## Versioning

The extension schema follows its own SemVer, kept in lockstep with
the skill's `package.json` version (currently `0.1.0`). Breaking
changes to any extension shape require a MINOR bump pre-1.0 and are
listed in `CHANGELOG.md` (when introduced) under a "Breaking changes"
section. The mapping between skill version and supported extension
schema version is recorded in `package.json#designmd`.
