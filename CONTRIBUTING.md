# Contributing to CDD-DesignMD-Pro

Thanks for your interest. This skill extends Google's `@google/design.md`
(alpha) and is distributed under Apache-2.0. Contributions of all sizes
are welcome — bug reports, doc fixes, new extensions, examples.

## Quick start

```bash
git clone https://github.com/J0rgw/CDD-DESIGNMD-PRO.git
cd CDD-DESIGNMD-PRO
bun install
bun run lint
bun run test
```

You need Bun `>=1.2.0` and Node `>=20.0.0` (see `package.json#engines`).

## How to file an issue

Use one of the templates under `.github/ISSUE_TEMPLATE/`:

- **Bug report** — something the skill does wrong, crashes, or
  misinterprets a valid `DESIGN.md`.
- **Feature request** — a capability you want the skill to gain.
- **Extension proposal** — a new YAML key under the skill's reserved
  extension namespace. These get extra scrutiny because they become
  part of the user-facing contract.

Search existing issues first. Include reproduction steps and the
`@google/design.md` version you're running against.

## How to submit a PR

1. Fork the repo and create a branch off `main`.
2. Make focused changes — one PR carries one of {feat, fix, docs,
   refactor, chore}. Don't bundle unrelated work.
3. Run `bun run lint` and `bun run test` until both are clean.
4. Write a Conventional Commit message (see below).
5. Open a PR against `main`. Link the issue it resolves, if any.
6. Fill in the PR template checklist honestly.

`main` must always pass CI. Pre-1.0 we may break in MINOR; document
every break in the PR body.

## Coding standards

- **TypeScript strict** — see `tsconfig.json`. No `any`. No non-null
  assertions. Prefer named exports.
- **Formatting** — biome decides. Don't hand-format. Run
  `bun run lint:fix` before pushing.
- **Tests** — vitest. New code paths need tests; bug fixes should
  ship with a regression test.
- **Language** — all public-facing content is in **English** (SKILL.md,
  README, docs, references, examples, commit messages, PR titles).

## Commit message format

We follow [Conventional Commits](https://www.conventionalcommits.org/).
Allowed types:

- `feat` — new user-facing capability
- `fix` — bug fix
- `docs` — documentation only
- `style` — formatting, no behavior change
- `refactor` — internal restructure, no behavior change
- `perf` — performance improvement
- `test` — adding or fixing tests
- `chore` — tooling, deps, repo maintenance
- `build` — build system or external deps
- `ci` — CI config
- `revert` — revert a prior commit

Explain WHY in the body, not just WHAT.

## Compatibility commitment with @google/design.md alpha

This skill tracks the upstream `@google/design.md` `alpha` channel,
currently version range `0.1.x` (declared in
`package.json#designmd.supportedVersion`). Every artifact this skill
emits must remain a valid DESIGN.md per upstream `spec`.

If upstream releases a breaking change, raise it as an explicit
decision in an issue before adapting extensions. We do not silently
fork upstream concepts.

## PRs that add new extensions

Any PR that introduces a new YAML key under the skill's extension
namespace **must** include:

- A foundation doc in `docs/foundations/<key>.md` describing the
  schema, motivation, and examples.
- An update to `NOTICE` listing the new key.
- An update to `SKILL.md`'s extensions table.
- At least one example in `examples/` exercising the new key.
- Tests covering schema validation and the BOOTSTRAP/AUDIT/REFACTOR
  paths that touch the key.

Extensions are user contracts. Removing them later breaks downstream
projects, so we add them deliberately.
