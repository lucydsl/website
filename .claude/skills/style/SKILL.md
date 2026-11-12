---
name: style
description: Write CSS using the Tideway design system — fixed design tokens (colors, spacing, typography, breakpoints) and strict BEM class naming, in plain CSS with no framework. Use whenever writing or editing CSS in a project that uses Tideway, styling a new component or page, choosing colors/spacing/font sizes, or when the user mentions Tideway, design tokens, or BEM.
---

# Tideway: style

Tideway is a design system delivered as a convention: fixed design tokens plus strict BEM, written as plain CSS. There is no build step, library, or runtime — consistency comes entirely from following these rules, so follow them exactly.

## Core rules

1. **Default every value to the scale.** Colors, spacing, font sizes, line heights, radii, shadows, and breakpoints are all defined in `references/tokens.md`. Read it before writing any CSS. When a design calls for something between two tokens, use the nearer one. This is a strong convention, not a ban: if a value is genuinely off-scale, use the raw value rather than distorting the design to force-fit a token — but do that deliberately, not by defaulting to arbitrary values out of habit.

2. **Reference tokens as custom properties — don't inline their values.** Declare the tokens you use in the project's `tokens.css` and write `padding: var(--space-4)`, not `padding: 1rem`. An inlined value satisfies the scale today but severs the link to the token, so it can't be found, audited, or re-themed later.

3. **Reference color through semantic roles, not the palette directly.** The palette (`--color-blue-600`) is raw vocabulary — a primitive layer. Components should read color from a small set of semantic role tokens (`--surface`, `--text`, `--border`, `--accent`, …) that map to palette values, never from a `--color-*` token directly. This indirection helps theming: a project switches to dark mode or rebrands by redefining the role layer alone, without touching a single component — and because the switch lives in the token layer, it never leaks into your selectors. Non-color tokens (spacing, radius, type, breakpoints) don't vary by theme, so use those directly. See `references/theming.md` for the role set and how to wire dark mode.

4. **Every class is strict BEM** — `block__element--modifier`, no exceptions. One block per component, with all of its CSS kept together. Elements stay flat even when the DOM nests (`card__title`, never `card__header__title`). A modifier never appears alone in markup; it accompanies its base class (`class="card card--featured"`) and declares only what differs. Blocks never style other blocks' internals — if a nested component needs contextual adjustment, add an element class of the outer block alongside it, carrying layout only.

5. **Selectors stay flat.** One class per selector, specificity (0,1,0). No IDs, no styling bare element tags (outside a reset), no chaining classes to win specificity, no `!important` — ever. If you feel the need to chain or escalate, you need a modifier instead.

## Workflow

When asked to style something:

1. Read `references/tokens.md` if you haven't in this session.
2. Check whether the project already has Tideway CSS (look for a tokens stylesheet or BEM-named classes). Match existing block names and file organization.
3. If this is the project's first Tideway CSS, create a `tokens.css` declaring the custom properties for the tokens you use, and import it first.
4. Write component styles as one block per component.
5. Media queries use the breakpoint tokens, mobile-first (`min-width`).

## File organization

Tideway doesn't impose a file layout of its own — it follows whatever convention the project already has:

- **One component per file** (`Tabs.jsx`): give it a matching stylesheet (`Tabs.css`). Don't merge unrelated blocks into one file just because they're small.
- **Grouped components** (a project that already bundles related components into one file): it's fine to bundle their styles the same way, in one matching stylesheet.
- **Plain CSS, no component files to mirror**: organize by purpose (`theme.css` for tokens/roles, `layout.css`, `forms.css`) or, if the project has multiple pages, by page. Pick whichever the project already does; default to purpose-based for a new project.

Whatever the split, a block's rules stay together in one place — never spread one component's CSS across multiple files.

## Example

```css
.card {
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.card--featured {
  box-shadow: var(--shadow-lg);
}
```

```html
<article class="card card--featured">
  <h2 class="card__title">Tideway</h2>
</article>
```

## Out of scope

Reviewing existing CSS against these conventions is the `review` skill; finding unused classes is the `prune` skill.
