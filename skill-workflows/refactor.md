# Refactor Workflow

## Purpose

REFACTOR is the only CDD-DesignMD-Pro capability that modifies
source files. Every other capability is read-only: BOOTSTRAP
creates a fresh DESIGN.md, AUDIT reports drift. REFACTOR closes
the loop by editing the codebase to match the contract — and
because that mutation is the most consequential operation in the
workflow, it runs plan-first.

The plan is a persistable, reviewable artifact. Phase 1
(`refactor plan`) reads the audit findings and emits
`refactor-plan.md` describing every transformation it would make.
Phase 2 (`refactor apply`) takes that plan and executes it. The
two phases can run in the same session or weeks apart; the plan
can be reviewed in a PR, attached to a Linear ticket, or shared
across machines. Drift between plan and apply is detected via a
codebase hash captured at plan time.

REFACTOR never invents tokens. Every "After" excerpt in the plan
references a token already declared in DESIGN.md — if the desired
replacement does not exist in the contract, the finding is
deferred for manual review rather than auto-resolved with an
invented token.

## When to invoke

`refactor plan` — invoke when:

- An `audit-report.json` exists (or AUDIT is willing to run
  inline) and the team wants to review the proposed changes
  before any file is touched.
- The user wants to scope or filter changes via `--paths` (for
  example, "tokenize colors in `src/components/` only").
- A previous AUDIT run produced tokenizable findings and the
  team wants to roll the fixes into a single PR.

`refactor apply` — invoke when:

- A `refactor-plan.md` exists, has been reviewed, and the user
  explicitly approves applying it.
- The team wants a `--dry-run` preview that emits the diff
  without writing.

Do NOT invoke REFACTOR when:

- The DESIGN.md fails upstream lint. Run BOOTSTRAP or repair
  the contract first.
- All findings are `invariant-violation`. REFACTOR rejects those
  outright; route them to human review.
- The codebase has uncommitted changes that the user has not
  acknowledged. Apply changes onto a clean working tree so the
  diff is reviewable.

## Inputs

### For `refactor plan`

- `<design.md>` — required. Defaults to `./DESIGN.md`.
- `<audit-report>` — optional. Defaults to
  `./audit-report.json`. If absent, AUDIT runs automatically
  first and the resulting report is used.
- `--paths` — optional. Glob set that overrides the default
  scope inherited from `audit.additionalPaths` /
  `audit.excludePaths`.
- `--output` — optional. Defaults to `./refactor-plan.md`.

### For `refactor apply`

- `<plan.md>` — required. Output of `refactor plan`.
- `--dry-run` — optional. Compute the diff and the report but
  do not write source files. Useful for CI verification.
- `--strict` — optional. Treat warnings as errors during the
  re-audit phase, just like AUDIT's `--strict`.
- `--output-report` — optional. Defaults to
  `./refactor-report.md`.

## Phase 1 — Contract and finding loading

Before generating any transformation, REFACTOR loads the
contract and the audit findings:

1. Load DESIGN.md from the input path.
2. Run `bunx @google/design.md lint <path>`. Any error aborts
   with exit code 2 and the linter output.
3. Load `audit-report.json`. If absent, invoke AUDIT internally
   and use its output. The SARIF sidecar
   (`audit-report.sarif.json`) is preferred when both formats
   are present, because its structured `results[]` is easier to
   consume than the markdown report.
4. Build the contract context: tokens (names → values, paths →
   tier), themingAxes (paths under axis controls), invariants
   (id → enforcement → scope), antiPatterns (id → severity →
   detect), runtime (paths whose value comes from a provider).
5. If the contract or the report is malformed, abort with exit
   code 2 and a structured error naming the offending field.

## Phase 2 — Finding categorization

For each finding in the audit report, REFACTOR assigns one of
four categories. The category determines whether the finding
becomes a transformation in the plan, a deferred entry, or a
rejection.

- **`tokenizable`.** The transformation is deterministic: a
  literal value can be replaced with a token reference whose
  resolved value matches. Examples:
  - Hardcoded color literal (`#0EA5E9`) → token reference
    (`{colors.primary}`) when the literal exactly matches the
    token's value.
  - Hardcoded spacing literal (`16px`) → token reference
    (`{spacing.md}`).
  - Inline style attribute (`style={{ color: "#FFF" }}`) →
    CSS module class that references a semantic token.
  - Direct primitive use → semantic equivalent (tier promotion)
    when the semantic token resolves through the primitive.

- **`structural`.** The fix requires non-trivial syntactic
  change beyond literal replacement. Examples:
  - Component prop refactor (renaming `bg` → `background`).
  - JSX restructuring to add a status indicator slot.
  - Import path changes across modules.
  - Splitting a multi-purpose component into single-purpose
    siblings.

- **`invariant-violation`.** The finding is an invariant
  violation flagged by AUDIT Pass 2. REFACTOR rejects these
  outright — invariant violations require human judgment about
  whether the contract is wrong, the code is wrong, or both.
  Auto-resolving an invariant violation would either silence a
  legitimate alarm or rewrite code that the human authored
  knowing the violation existed.

- **`deferred`.** The finding is tokenizable in principle but
  the detector has low confidence in the specific match.
  Examples:
  - Match inside a string literal that may be sample data.
  - Match in a `*.test.tsx` or `*.stories.tsx` file (typically
    out of audit scope; included here only if the audit
    explicitly scoped them in).
  - Match in an ambiguous context where the same value could
    map to two tokens (e.g., a hex that matches both `primary`
    and `accent` in a system that happens to share a hue).

The category map flows into Phase 3.

## Phase 3 — Plan generation

REFACTOR builds `refactor-plan.md` per
`skill-workflows/refactor/plan-schema.md`. The structure has
three lists keyed off Phase 2 categories: transformations,
deferred items, and rejected items.

For each `tokenizable` finding the plan emits one transformation
with the following fields:

- File path (relative to repo root).
- Line and column (1-indexed).
- Category (`tokenizable`, `structural`, or `tier-promotion`
  for the primitive→semantic case).
- "Before" excerpt — the literal in the source file.
- "After" excerpt — the replacement, with the token reference
  in place.
- Rationale — one human-readable line.
- Token used — the contract path (e.g. `colors.primary`) the
  detector verified against DESIGN.md.

`structural` and `deferred` findings go in the "Deferred items"
list with a reason. `invariant-violation` findings go in the
"Rejected items" list with the invariant id and the reason.

Plan generation is idempotent: re-running `refactor plan`
against the same DESIGN.md, same audit report, and same codebase
produces a byte-identical plan modulo the `generated-at`
timestamp and `plan-id` UUID. This makes review diffs meaningful.

## Phase 4 — Plan validation

Before emitting the plan, REFACTOR validates:

1. Every "Token used" string resolves to a token defined in
   DESIGN.md. A plan that references an undefined token is a
   bug — abort with exit code 2.
2. No transformation crosses tier boundaries incorrectly. A
   `tier-promotion` may move primitive → semantic (correct
   direction); the inverse is rejected.
3. No transformation has DESIGN.md as its file path. The
   contract is read-only from REFACTOR's perspective.
4. Every transformation is reversible: the "Before" excerpt is
   captured verbatim so a future `refactor revert` can restore
   the original literal if needed. (The revert command is
   v0.3+ scope; the field is captured today for forward
   compatibility.)
5. The `target-codebase-hash` is computed from the SHA256 of
   each affected file at plan time, concatenated and hashed
   again. Stored in front matter for Phase 6 drift detection.

If any validation fails, abort with exit code 2 and a
structured error.

## Phase 5 — Plan emission

Write `refactor-plan.md` at the configured path (default
`./refactor-plan.md`). The file is read-only output — Phase 1
never modifies source files. The plan is the only artifact
produced.

If `--dry-run` was passed to `refactor plan` (rare but
supported), the plan is still written; only `refactor apply`
distinguishes dry-run from real-run.

`refactor plan` exits 0 on a successful plan write, regardless
of how many transformations the plan contains. Exit 2 is
reserved for contract / report errors.

## When `refactor apply` runs

The phases below execute under `refactor apply` only. They
assume a valid `refactor-plan.md` exists at the input path.

## Phase 6 — Plan re-validation

Before applying anything, REFACTOR re-validates the plan
against the current state of DESIGN.md and the codebase:

1. Re-load DESIGN.md, re-run upstream lint. Any error aborts
   with exit code 2.
2. Re-validate every "Token used" reference against the current
   DESIGN.md. If a token has been renamed or removed since the
   plan was generated, abort with exit code 2 naming the stale
   reference.
3. Re-compute the SHA256 of each file listed in the plan and
   compare against the plan's `target-codebase-hash`. A mismatch
   means the codebase has drifted since plan generation. Abort
   with exit code 2 and a suggestion: "re-run `refactor plan`
   against current state".
4. For each transformation, verify the "Before" excerpt is
   present at the declared file:line. If the line has been
   edited since plan generation but the hash check passed, this
   secondary check catches the discrepancy.

The drift detection is conservative on purpose: a plan that
passes all four checks is safe to apply blindly. A plan that
fails any check is rejected outright; REFACTOR does not attempt
to merge or rebase plans.

## Phase 7 — Transformation application

For each transformation in the validated plan:

1. Read the source file.
2. Apply the replacement literally: locate the "Before" excerpt
   at the declared line/column and substitute the "After"
   excerpt.
3. Write the file back if `--dry-run` was not passed.
4. Record the applied transformation in the in-memory log used
   by Phase 9.

Order matters when two transformations target the same file:
they are applied bottom-to-top by line number so that earlier
edits do not invalidate later line numbers. The plan validator
enforces that no two transformations on the same file overlap
in line range.

If a single file's write fails (disk full, permission denied),
REFACTOR rolls back any in-memory edits to that file and
continues with the rest of the plan. The failed file is
recorded as a `residual-write-failure` for the report.

## Phase 8 — Re-audit verification

Once all transformations are applied, REFACTOR runs AUDIT over
the modified codebase using the same DESIGN.md. The re-audit's
finding distribution determines the exit code:

- **Zero findings.** Complete success. Report records all
  transformations as applied, no residual.
- **Findings of severity below `audit.failOn`.** Partial
  success: residue exists but does not gate. Exit 0.
- **Findings of severity in `audit.failOn`.** Residual
  failure: at least one issue remained or was introduced. Exit
  1. Common causes: a deferred or rejected item the user
  expected REFACTOR to handle; an invariant that became newly
  violated by a transformation (rare — a sign of a contract
  bug).

The re-audit uses the same scope as the original audit unless
`--paths` overrode it.

## Phase 9 — Report emission

REFACTOR emits two artifacts:

- **`refactor-report.md`** — markdown report with these
  sections:
  - Header: timestamp, plan-id consumed, dry-run flag if set.
  - Summary: counts of applied transformations, deferred
    items, rejected items, residual findings.
  - Applied transformations: per-transformation block with
    file:line and the before/after excerpts (mirrors the plan
    for traceability).
  - Deferred items: forwarded from the plan with reasons.
  - Rejected items: forwarded from the plan with reasons.
  - Residual findings: from the Phase 8 re-audit, grouped by
    severity.
  - Suggested next steps: e.g., "address the 1 residual error
    by editing `src/styles/theme-override.css` manually".

- **`diff.patch`** — unified diff of all writes. Compatible
  with `git apply` and `patch -p0`. Generated even on dry-run
  so reviewers can preview the change set.

Both files are overwritten on every run. REFACTOR is stateless
between runs; the plan is the only persistent artifact.

## Boundaries

- `refactor plan` is READ-ONLY. It never modifies source files,
  the DESIGN.md, or any other repo content. The plan is the
  only artifact written.
- `refactor apply` modifies source files but NEVER DESIGN.md.
  The contract is upstream of REFACTOR.
- REFACTOR NEVER invents tokens. Every replacement must
  reference a token already declared in DESIGN.md. Findings
  whose ideal replacement is missing from the contract are
  deferred, not auto-resolved.
- REFACTOR NEVER applies transformations for `invariant-
  violation` findings. These require human review and possibly
  REFACTOR-resistant intervention (e.g., the contract is
  wrong, not the code).
- `refactor apply` requires a valid plan from `refactor plan`.
  Direct invocation without a plan is rejected with exit code
  2 and a suggestion to run `refactor plan` first.

## Known limitations (v0.1.x)

- **Regex-based detector limitations carry over.** The same
  false-positive surface as AUDIT (string literals, code
  comments) applies. The plan exposes its categorization, so a
  reviewer can demote a transformation to deferred by editing
  the plan before `refactor apply`.
- **Tier promotion requires value alignment.** A
  primitive→semantic transformation is only emitted when the
  semantic token resolves to a value matching (or
  superseding) the primitive's literal. Divergent cases are
  flagged as deferred rather than guessed.
- **Cross-file transformations are deferred.** Renaming an
  import that ripples through many modules is not automated in
  v0.1.x; the plan emits a single deferred entry naming the
  file pair so the reviewer can hand-edit.
- **No multi-edit-per-line support.** If a single line contains
  two literals to replace (e.g., `border: 1px solid #FFF;`
  with both `1px` and `#FFF` to tokenize), the plan emits two
  transformations and the apply phase serializes them. If the
  line restructure breaks the second match's column, the
  second transformation is recorded as `residual-line-shifted`
  and reported.
- **Plan format is markdown-with-front-matter.** A future v0.3+
  may add a JSON sidecar for richer programmatic consumption,
  similar to AUDIT's SARIF subset.

## Failure modes

- **Invalid plan front matter or missing required field.**
  Abort with exit code 2; the error names the field.
- **Source drift detected during apply** (Phase 6 hash
  mismatch). Abort with exit code 2 and the suggestion to
  re-run `refactor plan` against current state.
- **DESIGN.md modified between plan and apply.** Abort with
  exit code 2 and the offending token reference if a "Token
  used" no longer resolves.
- **A single file write fails.** That file is recorded as
  `residual-write-failure`, the rest of the plan continues,
  and the report flags the partial state explicitly.
- **Re-audit produces unexpected findings** (errors not
  present in the original audit). Report the residue, exit 1,
  and suggest reverting via `git restore` plus a fresh
  `refactor plan`. REFACTOR does not auto-revert.