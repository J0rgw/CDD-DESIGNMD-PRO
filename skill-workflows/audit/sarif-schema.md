# SARIF Subset Emitted by AUDIT

## Compatibility statement

This document declares the SARIF 2.1.0 subset that the AUDIT
workflow emits as `audit-report.sarif.json`. The full SARIF spec
is large (>200 fields); CDD-DesignMD-Pro implements only the
minimum required for three concrete consumers:

1. **GitHub PR Annotations** rendering findings inline on diffs
   without further configuration.
2. **IDE plugins** (VS Code SARIF Viewer, JetBrains SARIF support)
   that surface findings as squigglies and a problems panel.
3. **Programmatic post-processing** (filtering, aggregation,
   exporting to other tools) by tooling that reads SARIF.

Reference: <https://docs.oasis-open.org/sarif/sarif/v2.1.0/>

The emitted JSON is validated against
<https://json.schemastore.org/sarif-2.1.0.json> before write. A
schema validation failure causes AUDIT to drop the SARIF sidecar
and log a warning rather than failing the run; the markdown
report remains the source of truth.

## Mandatory fields emitted

Every `audit-report.sarif.json` contains:

- `$schema`: `https://json.schemastore.org/sarif-2.1.0.json`
- `version`: `"2.1.0"`
- `runs`: array with exactly one run per AUDIT invocation. Each
  run carries:
  - `tool.driver.name`: `"cdd-designmd-pro"`
  - `tool.driver.version`: read from `package.json#version`
  - `tool.driver.informationUri`:
    `"https://github.com/J0rgw/CDD-DESIGNMD-PRO"`
  - `results`: array of findings (may be empty for clean repos)

## Per-result fields emitted

Each entry in `results[]` carries:

- `ruleId`: stable string identifier — `antiPattern.id`,
  `invariant.id`, or one of the built-in ids
  (`tier-inversion-hard`, `tier-inversion-soft`,
  `runtime-bypass`, `orphan-token`).
- `level`: SARIF level mapping. AUDIT severity → SARIF level:
  - `error` → `"error"`
  - `warning` → `"warning"`
  - `info` → `"note"`
- `message.text`: human-readable one-line description.
- `locations[0].physicalLocation`:
  - `artifactLocation.uri`: path relative to the repo root.
  - `region.startLine`: 1-based line number.
  - `region.startColumn`: 1-based column number.
  - `region.snippet.text`: up to three lines of code context.

## Fields NOT emitted (deferred to v0.2+)

The following SARIF features are intentionally absent from the
v0.1.x subset:

- `tool.driver.rules`: full rule definitions with descriptions,
  helpUris, default configurations. Deferred until the rule set
  is stable.
- `taxonomies`: SARIF taxonomy support for cross-tool rule
  mapping (e.g. CWE references).
- `results[].fixes`: structured suggested-fix payloads. The
  REFACTOR workflow will own this surface.
- `artifacts.contents`: full file contents alongside snippets.
  The snippet inside `region.snippet.text` is sufficient for the
  three documented consumers.
- `codeFlows`: multi-step data-flow tracking. Out of scope for
  the regex-based detector in v0.1.x.

## Validation

The emitted JSON is validated against
<https://json.schemastore.org/sarif-2.1.0.json> before AUDIT
writes the sidecar. The validation runs in two contexts:

1. **At runtime**, inside AUDIT itself, before write. A
   validation failure drops the SARIF output (markdown only is
   emitted) and logs a warning naming the offending property
   path.
2. **In CI**, inside `tests/audit-workflow.test.ts`. Each
   `expected-output/audit-report.sarif.json` in
   `examples/audit/` is validated against the schema so that
   golden files cannot drift out of compliance.

## Example output

A minimal valid `audit-report.sarif.json` covering one error,
one warning, and one note:

```json
{
  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "cdd-designmd-pro",
          "version": "0.1.0",
          "informationUri": "https://github.com/J0rgw/CDD-DESIGNMD-PRO"
        }
      },
      "results": [
        {
          "ruleId": "status-color-immutable",
          "level": "error",
          "message": {
            "text": "Redeclaration of --status-critical violates the status-color-immutable invariant."
          },
          "locations": [
            {
              "physicalLocation": {
                "artifactLocation": { "uri": "src/styles/theme-override.css" },
                "region": {
                  "startLine": 12,
                  "startColumn": 3,
                  "snippet": {
                    "text": "  --status-critical: #c62828;\n"
                  }
                }
              }
            }
          ]
        },
        {
          "ruleId": "hardcoded-color-literal",
          "level": "warning",
          "message": {
            "text": "Literal hex color outside of token files. Replace with a token reference from colors.*."
          },
          "locations": [
            {
              "physicalLocation": {
                "artifactLocation": { "uri": "src/components/AlarmBanner.tsx" },
                "region": {
                  "startLine": 27,
                  "startColumn": 19,
                  "snippet": {
                    "text": "  background: '#16A34A';\n"
                  }
                }
              }
            }
          ]
        },
        {
          "ruleId": "orphan-token",
          "level": "note",
          "message": {
            "text": "Token colors.gray-300 is declared in DESIGN.md but never referenced in scanned code."
          },
          "locations": [
            {
              "physicalLocation": {
                "artifactLocation": { "uri": "DESIGN.md" },
                "region": {
                  "startLine": 14,
                  "startColumn": 3,
                  "snippet": {
                    "text": "  gray-300: \"#CBD5E1\"\n"
                  }
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```