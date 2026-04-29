# Anti-Patterns

> Status: placeholder. Body to be written in a later session.

**Purpose** — Maintain a formal catalog of known violations of the
system, with detection signatures and remediation hints.

## Planned table of contents

- Catalog structure (id, name, signature, severity, fix)
- Categories
  - hardcoded literals where a token is required
  - cross-tier reference (component → primitive skipping semantic)
  - mode-specific styles outside declared axes
  - inline overrides of semantic tokens
  - runtime-only tokens used at build time (and vice versa)
- DESIGN.md schema: the `antiPatterns` extension
- Detection strategy notes (regex vs AST vs CSS parse)
- Authoring guidelines for new entries
