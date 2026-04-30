# Domain Presets

A *domain preset* is a pre-built bundle of invariants for a specific
industry or product class. Presets are consumed by BOOTSTRAP: when the
user answers Q1 with a recognized domain, the matching preset's
`invariants:` block is merged into the generated DESIGN.md.

## How a preset is applied

During [Phase 4 of BOOTSTRAP](../bootstrap.md#phase-4--generation):

1. The user's Q1 answer selects a preset filename (e.g. `banking` →
   `banking.yml`).
2. The skill reads the preset and emits its `references` array as a
   YAML comment above the `invariants:` block in the generated
   DESIGN.md.
3. The preset's `invariants` array is merged into the DESIGN.md's
   `invariants:` block. If the user already declared invariants in a
   partial DESIGN.md, preset invariants are appended (no overwriting,
   no de-duplication beyond exact `id` matches).
4. The user can remove or edit any merged invariant after generation.
   Presets are starting points, not contracts.

## Preset shape

Every preset YAML file follows this structure:

```yaml
preset:
  name: <kebab-case domain identifier — must match the filename>
  description: |
    Multi-line summary of what the preset asserts and why.
  references:
    - <citation 1>
    - <citation 2>

invariants:
  - id: <kebab-case-id>
    description: <one or more sentences>
    scope: <free-form description of the tokens or components covered>
    enforcement: <manual | automated | ci-only>
    severity: <error | warning | info>
```

The shape is validated by `tests/bootstrap-workflow.test.ts`.

## Available presets

| File                    | Domain               | One-liner                                                          |
| ----------------------- | -------------------- | ------------------------------------------------------------------ |
| `banking.yml`           | Fintech / banking    | Currency display, destructive-action confirmation, AA contrast.    |
| `healthcare.yml`        | Clinical / medical   | Vital ranges, IEC 60601 alarm hierarchy, fatigue-resistant type.   |
| `industrial-scada.yml`  | Industrial / process | ISA-101 / ISA-18.2 status and alarm rules, branding exclusion.     |

## How to contribute a new preset

1. Open an issue using the
   `.github/ISSUE_TEMPLATE/extension-proposal.md` template (presets
   are extensions to BOOTSTRAP). State the domain, the regulations
   or conventions you are encoding, and links to authoritative
   sources.
2. Once accepted, open a PR that adds:
   - `skill-workflows/domain-presets/<domain>.yml` matching the shape
     above.
   - A row in the table in this README.
   - A test entry in `tests/bootstrap-workflow.test.ts` covering
     the new file.
3. Every invariant in a preset must cite a public-source rationale
   (regulation, standard, well-known UX guideline). "Internal
   convention" is not a sufficient citation.
4. Presets are versioned by the skill's SemVer. Breaking changes to
   a preset's invariant `id` set are MINOR-bump events pre-1.0.

## Status

Alpha. The current presets are starting points based on widely
referenced standards but have not yet been validated against
production deployments. Feedback from real-world users is the
primary driver for refinement; expect the invariant set to evolve
each minor version until 1.0.
