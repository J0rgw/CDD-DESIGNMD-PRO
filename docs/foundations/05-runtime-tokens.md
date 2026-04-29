# Runtime Tokens

> Status: placeholder. Body to be written in a later session.

**Purpose** — Declare which tokens are injected at runtime (theme
switcher, tenant skin, telemetry-driven density) and bound their use.

## Planned table of contents

- Build-time vs runtime tokens (and why mixing them silently is a bug)
- Sources of runtime tokens (user prefs, tenant config, A/B, telemetry)
- Contract: how a runtime token must be declared, defaulted, fallen back
- DESIGN.md schema: the `runtime` extension
- SSR / hydration considerations
- Anti-patterns specific to runtime tokens
