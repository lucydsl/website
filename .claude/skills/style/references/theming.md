# Tideway theming

Theming — dark mode, a rebrand, per-section skins — works because color is referenced through a **semantic role layer**, never the palette directly. This file defines the roles and the dark-mode mechanism.

## Two tiers of tokens

- **Primitives** — the palette (`--color-blue-600`) and the other scales in `tokens.md`. A fixed vocabulary. Never referenced for color inside a component.
- **Semantic roles** — a small set of named roles that *map to* primitives. Components read color only from these. Redefining the mapping re-themes everything at once.

Declare the roles once, after the palette. This is the recommended baseline set; extend it per project, but keep names role-based (what it's *for*), never value-based (`--blue`, `--dark-bg`).

| Role | Purpose |
| :--- | :------ |
| `--surface` | page background |
| `--surface-subtle` | muted section background |
| `--surface-raised` | cards and raised panels |
| `--surface-hover` | hover fill |
| `--text` | primary text |
| `--text-muted` | secondary text |
| `--text-subtle` | tertiary / captions |
| `--border` | default borders |
| `--border-strong` | emphasized borders |
| `--accent` | brand color for icons, accents |
| `--accent-strong` | accent hover / emphasis |
| `--accent-text` | accent-colored text and links |
| `--accent-surface` | tinted accent background |
| `--accent-fill` | solid accent (button) background |
| `--accent-fill-hover` | solid accent hover |
| `--on-accent` | text on a solid accent fill |

## Dark mode

Use the browser-native pairing: `color-scheme` plus `light-dark()`. One declaration per role holds both themes, native controls (form fields, scrollbars) theme automatically, and the switch stays entirely in the token layer.

```css
:root {
  color-scheme: light dark;                 /* follow the OS by default */
}
:root[data-theme="light"] { color-scheme: light; }  /* manual override */
:root[data-theme="dark"]  { color-scheme: dark; }

:root {
  --surface: var(--color-white);                                    /* fallback: light only */
  --surface: light-dark(var(--color-white), var(--color-slate-950));/* both, where supported */
  --text: var(--color-slate-900);
  --text: light-dark(var(--color-slate-900), var(--color-slate-50));
  --border: var(--color-slate-200);
  --border: light-dark(var(--color-slate-200), var(--color-slate-800));
  /* …one pair per role… */
}
```

Two details make this robust:

- **The plain first line is a fallback.** An unsupported `light-dark()` invalidates its declaration, so the preceding light-only line keeps pre-2024 browsers on a working light theme while everyone else gets both. `light-dark()` is ~95% supported.
- **Add `<meta name="color-scheme" content="light dark">`** in `<head>`, before any stylesheet, so the browser paints the right background immediately and avoids a flash.

`light-dark()` only takes `<color>` values — which covers the color components inside shadows and gradients too. For a rare non-color theme difference, override that one role in a `@media (prefers-color-scheme: dark)` or `:root[data-theme="dark"]` block instead.

## Manual toggle (optional)

Auto mode above is pure CSS. A toggle that *remembers* the user's choice needs a little JavaScript — only to persist the choice and set `data-theme` on `<html>` before paint. It is optional and never a dependency of the styling; add it only with the user's go-ahead. `scripts/theme-toggle.js` provides it.
