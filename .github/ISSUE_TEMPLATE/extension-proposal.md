---
name: Extension proposal
about: Propose a new YAML key under the skill's extension namespace
title: "[ext] "
labels: extension-proposal
---

## Extension name

<!-- Proposed YAML key, e.g. `themingAxes`, `tokenTiers`, `runtime`. -->

## Problem it solves

<!-- What can users not express today that this would let them express? -->

## Proposed schema

```yaml
# Paste a YAML block sketching the shape of the new key.
extensionName:
  field: value
```

## Example of usage

<!--
A realistic DESIGN.md fragment using the new key. Bonus: a
corresponding source-code snippet showing how AUDIT or REFACTOR
would interact with it.
-->

```markdown
<!-- DESIGN.md fragment -->
```

## Impact on upstream compatibility

<!--
Does the proposed key collide with any existing or planned
`@google/design.md` field? How do we ensure the document still
validates against upstream `spec`?
-->

## Deprecation strategy if upstream later claims the key

<!--
Per SKILL.md "Boundaries": if upstream later defines this key,
we namespace under `cddPro:`. Describe the migration path you'd
expect for users who already adopted the extension.
-->
