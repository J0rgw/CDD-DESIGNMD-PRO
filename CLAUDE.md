# CLAUDE.md — instructions for Claude Code working in this repo

This file is meta: it tells you (Claude) how to work *on* the
`cdd-designmd-pro` skill itself. It is not the skill's runtime
instruction — that lives in `SKILL.md`.

## What this repo is

A public Claude Code skill, distributed under Apache-2.0, that extends
Google's DESIGN.md alpha. The repo is a TypeScript ESM project run with
Bun. Lint is biome, tests are vitest, commits are Conventional, version
is SemVer (currently `0.1.0`).

Compatibility we are bound to:

- `@google/design.md` — alpha, version range `0.1.x`
- declared in `package.json#designmd`
- if upstream breaks the schema, raise it as an explicit decision
  before changing extensions

## Read-before-edit map

Before modifying any file in the left column, read the file(s) on
the right. Do not edit blindly.

| Editing…                          | Read first                                   |
| --------------------------------- | -------------------------------------------- |
| `SKILL.md`                        | `NOTICE`, `docs/foundations/*.md`, this file |
| `docs/foundations/*.md`           | `SKILL.md`, sibling foundation files         |
| `package.json` (deps)             | upstream `@google/design.md` release notes   |
| `package.json` (`designmd` block) | `NOTICE`, upstream spec changelog            |
| `src/**`                          | the relevant `docs/foundations/*.md`         |
| `tests/**`                        | the `src/` it covers                         |
| `examples/**`                     | upstream `design.md spec` output             |
| `templates/**`                    | `SKILL.md` capability section it serves      |
| `.github/workflows/**`            | `package.json#scripts`                       |

## Conventions

- **Language:** all public-facing content (SKILL.md, README, docs,
  references, examples, commit messages, PR titles) is in **English**.
  Internal scratch / plans may be Spanish.
- **Style:** TypeScript strict (see `tsconfig.json`). Prefer named
  exports. No `any`. No non-null assertions.
- **Formatting:** biome decides. Do not hand-format.
- **Commits:** Conventional Commits. Allowed types: `feat`, `fix`,
  `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`,
  `ci`, `revert`.
- **Branches:** work on feature branches, PR into `main`. `main`
  must always pass CI.
- **Versioning:** SemVer. Pre-1.0 we may break in MINOR; document
  every break in the PR body.
- **Scope discipline:** every PR carries one of {feat, fix, docs,
  refactor, chore}. Do not bundle unrelated changes.

## Quality criteria (a change is "done" when…)

1. `bun run lint` is clean.
2. `bun run test` is green (or `passWithNoTests` is honestly applicable).
3. If the change touches DESIGN.md examples, `bunx @google/design.md spec`
   accepts every example file.
4. If the change touches `SKILL.md`, the `description` field still
   contains explicit triggers AND anti-triggers.
5. If the change adds a new extension key, `NOTICE` and
   `docs/foundations/` reflect it.
6. Commit message is Conventional and explains WHY, not just WHAT.

## Things to avoid

- **Don't fork upstream concepts.** If a name exists upstream, reuse
  it. Only invent new keys for genuinely new ideas.
- **Don't hand-roll markdown formatters.** biome handles code; DESIGN.md
  itself is validated by the upstream CLI.
- **Don't add deps casually.** Every dep is a future audit obligation
  for an Apache-2.0 redistribution. Justify in the PR.
- **Don't write content for foundation modules in scaffolding sessions.**
  Module bodies are filled in dedicated sessions — premature drafts
  get out of sync.
- **Don't install lefthook hooks silently.** `lefthook install` is a
  user-side opt-in; CI is the source of truth.

## When unsure

If a request is ambiguous (e.g., "add a section to DESIGN.md"), pick
the smallest reversible step and ask before expanding scope.

Reversible steps include: adding a placeholder file, drafting a
single section, proposing a schema in a comment block, opening a
draft PR.

Irreversible steps that need explicit confirmation: renaming
public files, changing the SKILL.md description (re-trains the
orchestrator), removing extension keys (breaks user contracts),
bumping major version.

Premature abstraction is the most common failure mode for this
kind of project.
