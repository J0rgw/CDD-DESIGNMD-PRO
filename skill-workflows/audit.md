# Audit Workflow

## Purpose

AUDIT scans a project codebase against an existing DESIGN.md and
reports every place the code contradicts the contract. It detects
five classes of finding: anti-pattern matches (the `antiPatterns`
extension's regex catalog), invariant violations (the `invariants`
extension's automated and ci-only enforcement), tier inversions
(violations of the `tokenTiers` reference direction), runtime
mismatches (tokens declared `runtime` that are read directly
instead of through the declared provider), and orphan tokens
(declared in the contract but never referenced in scanned code).

AUDIT is read-only. It never edits source files. Its outputs are
two sidecars at the configured report path: a human-readable
markdown report and a SARIF 2.1.0 subset JSON suitable for GitHub
PR Annotations and SARIF-aware IDE plugins. To apply fixes, see
the REFACTOR workflow.

## When to invoke

Trigger AUDIT when the user:

- Asks to "audit", "scan", "check drift", "lint design tokens",
  or "report token violations" against a DESIGN.md.
- Mentions hardcoded colors, magic numbers, off-system styles,
  token leakage, or design drift.
- Asks for a CI-friendly check that gates merges on contract
  violations.
- Has just generated a DESIGN.md via BOOTSTRAP and wants the
  initial baseline of findings before any refactor.

Do NOT invoke AUDIT when:

- No DESIGN.md exists at the agreed path. Run BOOTSTRAP first.
- The DESIGN.md fails upstream `@google/design.md lint`. Repair
  it first; AUDIT refuses to run against an invalid contract.
- The user wants fixes applied. Use REFACTOR; AUDIT only reports.

## Inputs

- **`DESIGN.md`** — required, at repo root or an explicit
  `--path` override.
- **`--paths`** — optional CLI override; replaces the default
  heuristic scope. Multiple globs allowed.
- **`--strict`** — optional flag that elevates every warning to
  error severity for the duration of the run. Useful for
  pre-release gating without permanently changing `audit.failOn`.
- **`--report-path`** — optional output dir; defaults to
  `./audit-report.md` and `./audit-report.sarif.json` siblings.

## Phase 1 — Contract loading

Before scanning anything, AUDIT loads and validates the contract:

1. Read DESIGN.md from the input path.
2. Run `bunx @google/design.md lint <path>`. If the upstream
   linter reports any error, AUDIT aborts with the linter output
   and exit code 2 (configuration error, distinct from finding-
   driven exit 1).
3. Parse YAML front matter and extract the six extensions:
   `themingAxes`, `tokenTiers`, `invariants`, `antiPatterns`,
   `runtime`, `audit`. Missing extensions are tolerated; missing
   `audit` triggers documented defaults.
4. Apply the schema's cross-extension rules (see
   `templates/extension-schema.md`). Any cross-rule violation
   aborts with the same exit code 2 as upstream lint failure.
5. Build the in-memory contract: a structured representation of
   what the codebase MUST and MUST NOT contain, used by every
   detection pass.

The contract is read-only after Phase 1 — no detection pass may
mutate it.

## Phase 2 — Scope determination

AUDIT decides which files to scan in this order:

1. **Default heuristic globs** (applied unless `--paths` is given):

   - `src/**/*.{ts,tsx,js,jsx,vue,svelte,css,scss}`
   - `components/**/*.{ts,tsx,js,jsx,vue,svelte}`
   - `app/**/*.{ts,tsx,js,jsx}`
   - `pages/**/*.{ts,tsx,js,jsx}`
   - `ui/**/*.{ts,tsx,js,jsx,vue,svelte}`
   - `styles/**/*.{css,scss}`
   - `theme/**/*.{ts,js,css}`

2. **`audit.additionalPaths` from DESIGN.md** (union with the
   heuristic).
3. **`audit.excludePaths` from DESIGN.md** (subtract).
4. **`--paths` CLI override** (replaces steps 1–3 entirely; the
   user has taken explicit responsibility for scope).

If the resulting set is empty, AUDIT exits 0 with an info
message stating that the configured scope matched no files. This
is not an error — it can legitimately happen on a freshly
bootstrapped repo.

## Phase 3 — Detection passes

AUDIT runs five passes over the scope. Each pass produces
findings tagged with `ruleId` and `severity` and feeds them into
Phase 4. Passes are independent: a single line may produce
findings from more than one pass.

### Pass 1 — Anti-pattern matches

For each entry in `antiPatterns`, AUDIT compiles its `detect.pattern`
as a JavaScript regex (anchored per `detect.type`) and applies it
to every file in scope, restricted to that entry's `paths` and
excluding `excludePaths`. Each match becomes a finding whose
severity is the entry's declared `severity` and whose `ruleId` is
the entry's `id`.

Limitations: regex is content-blind. It matches inside string
literals, JSX attribute values, and comments. v0.1.x ships this
trade-off honestly; v0.2+ migrates to AST-based detection. To
silence noisy false positives, list the rule id under
`audit.excludeRules` rather than removing the anti-pattern.

### Pass 2 — Invariant violations

For each entry in `invariants` whose `enforcement` is `automated`
or `ci-only`, AUDIT runs the matching detector:

- `contrast-min`: computes WCAG contrast for every (text,
  surface) pair under `scope` and reports any pair below
  `parameters.ratio`.
- `color-floor`: scans token values under `scope` for any value
  inside the forbidden hue range declared by `parameters.catalog`
  or `parameters.palette`.
- `no-mutation`: reports an error if any axis under
  `themingAxes.<axis>.controls` lists a path inside the
  invariant's `scope`.
- `value-pin`: reports any code site that overrides the pinned
  token with a literal value.
- `status-color-immutable` (preset-driven): scans CSS files for
  redeclarations of `--status-*` custom properties or for
  Tailwind arbitrary-value classes targeting status tokens.
- `redundant-encoding` (preset-driven): structural check that
  components in scope declare more than one channel (e.g.
  `backgroundColor` AND `icon` or `text` slot), not color alone.

Invariants with `enforcement: manual` produce no automated
findings; they are surfaced in the report's "Manual review
required" section so reviewers see what the contract expects of
them.

### Pass 3 — Tier inversion detection

If `tokenTiers` is declared, AUDIT scans CSS, theme files, and
component style declarations for two failure shapes:

- **Hard inversion (error):** a token classified `primitive`
  whose value contains `{path}` reference syntax, or a `semantic`
  token whose value resolves through a `component` token.
- **Soft inversion (warning):** a component or page reads a
  primitive directly when a semantic token covering the same
  intent exists. The skill suggests routing through the
  semantic.

### Pass 4 — Runtime mismatch

For each entry in `runtime`, AUDIT looks for direct reads of the
underlying CSS custom property or token name from code that
should go through the declared `source` provider. The skill
recognises common runtime providers heuristically: `useTheme()`,
`ThemeProvider`, LaunchDarkly clients (`useFlag`, `useVariation`),
Unleash clients, and CSS variable reads of the same name.

Findings under this pass are tagged `runtime-bypass` and default
to `warning` severity (the fallback contract is intact, but
auditability is degraded).

### Pass 5 — Orphan tokens in real use

Cross-check: every token path declared in `colors.*`,
`typography.*`, `spacing.*`, `rounded.*`, and `components.*` is
matched against the scanned code. Tokens that are never
referenced become findings tagged `orphan-token` at `info`
severity. Useful for detecting bloat after a refactor.

Tokens listed under `runtime[].fallback` are excluded from this
check — they are referenced indirectly through the runtime
provider.

## Phase 4 — Severity ranking and report assembly

Every finding produced by Phases 3.1–3.5 has the shape:

```yaml
ruleId: string             # antiPattern.id, invariant.id, or built-in
severity: error|warning|info
file: string               # path relative to repo root
line: number
column: number
message: string            # one-line description
excerpt: string            # up to three lines of code context
remediation: string        # optional suggestion (from antiPattern.remediation
                           # or a built-in template for invariant types)
```

Filters applied in this phase:

1. **`audit.excludeRules`**: findings whose `ruleId` matches an
   id in this list are dropped. The active suppression list is
   surfaced in the report header so reviewers see what is being
   silenced.
2. **`--strict`**: every finding with `severity: warning` is
   re-tagged as `error` for the rest of the run. The report
   notes that strict mode is active.

Sort order: `error` before `warning` before `info`; within each
severity, alphabetical by file then ascending by line then by
column. Stable order makes diffs of the markdown report
reviewable across runs.

## Phase 5 — Output emission

AUDIT writes two sidecars next to the DESIGN.md (or to the path
given by `--report-path`):

- **`audit-report.md`** — a human-readable markdown report with
  one section per severity, a per-finding block (file:line
  header, message, code excerpt in a triple-backtick block,
  remediation), and a footer with summary counts. Suppressions,
  manual-review invariants, and `--strict` status appear in the
  header.
- **`audit-report.sarif.json`** — a SARIF 2.1.0 subset JSON
  suitable for GitHub PR Annotations and SARIF-aware IDE
  plugins. The exact subset emitted is documented in
  `skill-workflows/audit/sarif-schema.md`. The output is
  validated against the published schema before write; if
  validation fails, AUDIT emits the markdown only and logs a
  warning rather than failing the run.

Both files are overwritten on every run. Findings are not
de-duplicated across runs — AUDIT is stateless by design.

## Phase 6 — Exit code

AUDIT computes its exit code from the final finding set:

- **Exit 0** — no finding has a severity listed in
  `audit.failOn`. Default `failOn` is `[error]` when the
  extension is absent.
- **Exit 1** — at least one finding has a severity in
  `audit.failOn`.
- **Exit 2** — Phase 1 contract loading failed (DESIGN.md
  invalid, cross-extension rules violated, or unreachable file).
  Distinct from finding-driven failure so CI scripts can branch.

## Boundaries

- AUDIT is READ-ONLY. It never modifies source files, the
  DESIGN.md, or any other repo content. The two report sidecars
  are the only artifacts it writes.
- AUDIT does not apply fixes. For fixes, see the REFACTOR
  workflow, which consumes the AUDIT report.
- AUDIT does not generate a DESIGN.md. For that, see the
  BOOTSTRAP workflow.
- AUDIT does not edit `audit.excludeRules` or any other
  extension. Suppression is the user's responsibility, recorded
  in DESIGN.md under code review.

## Known limitations (v0.1.x)

- **Regex-based detection has false positives.** The detector
  matches inside string literals, JSX attribute values, and
  comments. v0.2+ migrates to an AST-based pass; in the alpha
  range, suppress noisy patterns via `audit.excludeRules`
  rather than weakening the regex.
- **Tier inversion detection assumes consistent token naming.**
  If `tokenTiers` paths use globs (e.g. `colors.gray-*`),
  detection may miss inversions on tokens added later that match
  the glob.
- **Runtime mismatch detection is heuristic.** Provider
  libraries with non-standard import patterns (custom wrappers,
  re-exports under a different name) may not be recognised. The
  pass under-reports rather than over-reports.
- **Manual-enforcement invariants are not automatically
  verified.** They appear in the "Manual review required"
  section of the report; code review is the required complement.
- **SARIF subset is intentionally minimal.** Several SARIF
  features useful for richer tooling (taxonomies, suggested
  fixes, codeFlows) are deferred to v0.2+.

## Failure modes

- **DESIGN.md invalid (upstream lint or cross-extension rule
  failure).** Abort with exit 2 and the underlying linter or
  rule output. Do not produce a partial report.
- **Scope empty after applying `excludePaths` and
  `additionalPaths`.** Exit 0 with an info message; this is a
  legitimate state on freshly bootstrapped repos.
- **Single-file read error during a detection pass.** Log the
  file path and continue with the rest of the scope. Do not
  abort the entire audit on a transient read failure.
- **SARIF schema validation fails.** Emit only the markdown
  report and log a warning naming the validation error. The
  markdown report remains the source of truth.
- **Provider library not recognised in Phase 3.4.** Pass 4
  emits no `runtime-bypass` findings for that provider. Document
  this in the report header so the reviewer knows runtime audit
  was skipped for unknown providers.