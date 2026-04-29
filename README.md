# CDD-DesignMD-Pro

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![Status](https://img.shields.io/badge/status-alpha-orange.svg)](#status)
[![Spec](https://img.shields.io/badge/design.md-alpha-purple.svg)](https://github.com/google-labs-code/design.md)

A Claude Code skill that extends Google's [DESIGN.md](https://github.com/google-labs-code/design.md)
with the structure complex frontend systems actually need: multi-axis
theming, explicit token tiers, declared invariants, formal anti-pattern
catalogs, and runtime-injected tokens.

> Backward compatible: every artifact this skill emits is still a valid
> DESIGN.md per the upstream alpha schema.

## Three capabilities

- **BOOTSTRAP** — interview-driven creation of an initial `DESIGN.md`.
- **AUDIT** — scan a codebase for contract violations and anti-patterns.
- **REFACTOR** — bring code into conformance with the contract.

See [`SKILL.md`](./SKILL.md) for the full skill contract, including
explicit triggers and anti-triggers.

## Status

Alpha. SemVer pre-1.0 — breaking changes possible in any MINOR.
Currently tracking `@google/design.md` `0.1.x`.

## Local development

```sh
bun install
bun run lint
bun run test
bunx @google/design.md spec    # upstream linter, must be reachable
```

## License

Apache-2.0. See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE) for
attribution to Google's DESIGN.md.

## Maintainer

[J0rgw](https://github.com/J0rgw)
