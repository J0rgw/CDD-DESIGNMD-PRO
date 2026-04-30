# Bootstrap Workflow

## Purpose

BOOTSTRAP is the workflow that takes a project with no DESIGN.md (or a
partial one) and produces a complete DESIGN.md that is valid against
upstream `@google/design.md` and uses every CDD extension that
genuinely applies to the project. The skill drives the work through a
structured interview combined with automatic detection of project
state. Detection narrows the question set; the interview never decides
architectural questions on the user's behalf. The output is the
DESIGN.md plus a short summary of decisions and a list of questions
deliberately deferred for later sessions.

BOOTSTRAP is the only workflow that creates a DESIGN.md. AUDIT and
REFACTOR assume one exists.

## When to invoke

Trigger BOOTSTRAP when the user:

- Asks to "create / write / bootstrap a DESIGN.md", "design contract",
  "design system spec", or "tokens spec".
- Mentions wanting multi-theme, multi-brand, dark/light + density, or
  aesthetic / mode / branding orthogonality, and the project has no
  DESIGN.md yet.
- Has a token file (CSS variables, Tailwind config, Style Dictionary,
  Figma variables) and wants the contract written down.
- Has a partial DESIGN.md and wants it completed (BOOTSTRAP extends;
  it never overwrites).

Do NOT invoke BOOTSTRAP when:

- A complete DESIGN.md already exists at the agreed path. Use AUDIT or
  REFACTOR instead.
- The user only wants ad-hoc UI implementation with no system intent.
- The work is a one-off prototype the user has marked as throwaway.

## Inputs

The skill expects:

- **Project directory** — the working dir; required.
- **Partial DESIGN.md** — optional; at the repo root or an explicit
  path. If present, BOOTSTRAP extends it without overwriting.
- **Existing token assets** — optional; tailwind config, CSS custom
  property files, Style Dictionary configs, Figma variable exports.
  Detected automatically in Phase 1.
- **Brand assets** — optional; brand colors and fonts the user can
  paste during the interview.

## Phase 1 — Project state detection

Before asking any question, the skill scans the project and produces a
*signal object* that calibrates Phase 2. Detections are read-only.

Signals collected:

| Signal              | How detected                                                      | Used to calibrate                                       |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- |
| `hasDesignMd`       | Glob for `DESIGN.md` at root and one level deep                   | Skip BOOTSTRAP if complete; extend if partial           |
| `hasTokenAssets`    | Glob for `tailwind.config.{js,ts}`, `tokens.{css,json}`, `theme.{ts,js}` | Q3 (tier needs); skip Q7 if brand colors are derivable  |
| `multiThemeHints`   | Grep for `class="dark"`, `data-theme=`, `useTheme()`, `:root.dark` | Q2 (default to ≥ 2 axes if hits found)                  |
| `multiTenantHints`  | Grep for `tenant`, `workspace`, `org` in `routes/`, `types/`, schema files | Q4 (default to runtime if hits)                         |
| `stack`             | `package.json` dependencies (`react`, `vue`, `svelte`, `astro`)   | Q6 (pre-fill the answer)                                |
| `headlessLib`       | `package.json` for `@radix-ui/*`, `@headlessui/react`, `@mui/*`, `@chakra-ui/*` | Note in Phase 4 generation; affects component scaffolding |
| `existingComponents`| Count of `*.tsx`/`*.vue`/`*.svelte` files in `src/components/`    | Greenfield vs brownfield framing                        |

The signal object is shown to the user before Phase 2 starts so they
can correct misdetections.

## Phase 2 — Structured interview

The skill asks at most eight questions in a single block. Questions
are skipped or pre-filled when Phase 1 signals make the answer
obvious.

| #   | Question                                                                                                                                         | Asked when                          | Maps to                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------- |
| Q1  | Domain — does the project belong to a domain with a normative visual language? Options: `banking`, `healthcare`, `aviation`, `industrial-scada`, `energy`, `automotive`, `none/other`. | Always                              | Activates a domain preset in Phase 4 if banking, healthcare, or industrial-scada. |
| Q2  | Theme axes — how many orthogonal axes does the system need? Options: `mode-only`, `mode + density`, `mode + density + branding`, `custom`.        | Always; default biased by `multiThemeHints` and `multiTenantHints`. | `themingAxes` extension shape.                                         |
| Q3  | Tier needs — does the project want explicit primitive / semantic / component tiers, or a flat namespace?                                         | Always; pre-answered "yes" if `hasTokenAssets` shows ≥ 30 tokens. | `tokenTiers` extension on/off.                                         |
| Q4  | Runtime — do any tokens change between deploys (multi-tenant theme switcher, A/B visual testing, per-user personalization)?                       | Always; pre-answered "yes" if `multiTenantHints` ≥ 3.                | `runtime` extension on/off and `themingAxes.<axis>.runtime: true`.     |
| Q5  | Anti-pattern catalog — does the team run code review and is the project lifespan long enough to justify a formal catalog?                        | Always; recommended off for solo MVPs. | `antiPatterns` extension on/off.                                       |
| Q6  | Stack confirmation — confirm detected stack and choose token output format: `css-vars`, `tailwind`, `style-dictionary`, `dtcg-json`, `multiple`. | Always; stack pre-filled from `stack` signal. | Output format negotiation in Phase 4.                                  |
| Q7  | Brand identity — paste brand colors (`primary`, optional `accent`) and fonts. If none, the skill uses neutral defaults.                          | Always.                             | Populates `colors.brand-*` and `typography.*`.                         |
| Q8  | Output path — DESIGN.md at the repo root or a subpath?                                                                                           | Always; default root.               | File path for Phase 5.                                                 |

The skill never asks more than these eight in the base flow. If a
follow-up is genuinely required (e.g. ambiguous Q3 answer), it asks
that one question on its own and continues.

## Phase 3 — Detection-only proposals

Before generating anything, the skill summarizes its plan and asks
the user to confirm. Format:

```
Based on your answers I'll include:
  - themingAxes: <reasons>
  - tokenTiers:  <reasons>
  - invariants:  <domain preset name | custom | none — reason>
  - antiPatterns:<yes/no — reason>
  - runtime:     <yes/no — reason>

Token output format: <chosen format>
DESIGN.md path:     <chosen path>

Proceed? (yes / edit / cancel)
```

Phase 3 is the line that separates BOOTSTRAP from a black-box
generator. The user has veto power over each extension; `edit` returns
to Phase 2 with the relevant question highlighted.

## Phase 4 — Generation

With the plan confirmed, the skill assembles the DESIGN.md:

1. Apply the chosen extensions in the order: upstream sections,
   themingAxes, tokenTiers, invariants, antiPatterns, runtime.
2. If a domain preset was selected, merge its invariants list into
   the `invariants:` block. The preset's `references` are included
   verbatim as a YAML comment above the merged block.
3. Populate brand colors and fonts from Q7. Fill any gaps with
   neutral defaults (gray ramp, Inter / system-ui).
4. Generate the minimal plausible primitive token set for the chosen
   stack. For Tailwind, scaffold a 50–900 ramp; for CSS vars, scaffold
   a flat semantic set; etc.
5. Run `bunx @google/design.md lint <path>` against the draft. If the
   linter reports errors, the skill iterates *internally* (rewrite,
   re-lint) up to three times. After three failures, escalate to
   the user with the lint output.
6. Once lint is clean, the draft moves to Phase 5.

The skill never invents brand colors or fonts the user did not
provide; missing values stay neutral.

### Auto-generated primitives

BOOTSTRAP generates derived primitives automatically from user-
provided base values, to ensure components have full state coverage
without requiring the user to specify every variant.

Auto-generated derivations:

| Base token        | Auto-derived            | How               |
| ----------------- | ----------------------- | ----------------- |
| colors.primary    | colors.primary-hover    | darken by 8%      |
| colors.primary    | colors.primary-active   | darken by 12%     |
| colors.accent     | colors.accent-hover     | darken by 8%      |
| colors.surface-*  | colors.surface-*-hover  | darken/lighten 4% |

These derivations are conventions for typical hover/active state
feedback. The user may override any of them post-generation. If
the user's domain requires non-standard interaction states (e.g.
industrial SCADA where hover state is suppressed), Phase 5 handoff
flags this for review.

### Brand color contrast resolution

When the user provides a brand primary or accent that fails WCAG-AA
against white text (typical contrast threshold 4.5:1), BOOTSTRAP
defaults to dark text on that color, not white text.

Rationale: a skill named "auditor" cannot ship DESIGN.md outputs
that fail the upstream linter. Dark-on-bright passes AA reliably
for most brand hues; white-on-bright fails for any hue with
luminance above ~0.4.

This default is silent — BOOTSTRAP applies it without prompting.
If the user explicitly wants white text on bright brand, they
must darken the brand hex during interview Q7 or override the
generated text-on-primary token after generation.

This convention is consistent across:

- text-on-primary (paired with brand primary)
- text-on-accent (paired with brand accent)
- text-on-status-* (paired with status backgrounds, see also
  Decision 2 of session 2.5)

## Phase 5 — Handoff

The skill delivers:

- The DESIGN.md at the path agreed in Q8.
- A `bootstrap-summary.md` (sibling of DESIGN.md) listing every
  decision: signals detected, answers given, extensions included,
  preset applied, fallbacks used.
- A `questions-deferred.md` listing items the user explicitly
  deferred (e.g. "no aesthetic axis yet, revisit in 6 months",
  "no anti-pattern catalog yet, will add at team size > 3").
- A suggested next step, typically: "Run AUDIT to compare your
  current codebase against this contract."

The handoff is read-only on existing code. BOOTSTRAP never edits
source files outside the path agreed for the DESIGN.md and its two
sidecar docs.

## Boundaries

- BOOTSTRAP is READ + CREATE. It never modifies code, components,
  styles, or token files outside the DESIGN.md it generates.
- If a complete DESIGN.md exists, BOOTSTRAP refuses to overwrite. It
  offers to extend the partial document or hands off to AUDIT.
- The skill never fabricates brand identity. Missing colors stay
  neutral; missing fonts default to the platform stack.
- The skill never selects a domain preset on the user's behalf. Q1
  is never auto-answered, even if signals strongly suggest a domain.

## Failure modes and recovery

- **User abandons the interview mid-flow.** The skill writes the
  partial signal+answer state to `bootstrap-progress.md` in the
  project working dir and exits cleanly. Re-invoking BOOTSTRAP in
  the same project picks up from the last answered question.
- **Upstream lint cannot be made clean within three internal
  iterations.** The skill stops, writes the failing lint output to
  `bootstrap-lint-failure.md`, and asks the user how to proceed:
  fix manually, drop the offending extension, or escalate as a bug.
- **Phase 1 signals contradict Phase 2 answers** (e.g. signals show
  multi-tenancy but Q4 says no runtime). The skill flags the
  conflict and asks one disambiguating question before continuing.
- **An existing DESIGN.md fails upstream lint.** The skill reports
  the failures and offers a `repair` path before any extension work
  begins.
