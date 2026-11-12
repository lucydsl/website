---
name: migrate
description: Migrate an existing project's styling onto Tideway — converting Tailwind, CSS Modules, styled-components, or plain CSS to Tideway's design tokens and strict BEM. Use whenever the user wants to move a codebase, page, or component to Tideway, replace an existing design system or CSS framework with Tideway, or asks to "migrate to Tideway" / "convert this to Tideway".
---

# Tideway: migrate

Migration converts an existing project's styles to Tideway — the same tokens and BEM the `style` skill produces from scratch — without changing how the UI looks. The visual output is the fixed point: the CSS underneath changes, the rendered result does not.

## Before you start

1. **Read the `style` skill.** It defines the target. Read `../style/SKILL.md` and `../style/references/tokens.md` so you know the exact token scales and BEM rules you are migrating *onto*. Everything here assumes you already know them.

2. **Identify the source system**, then read the matching reference for its specific mapping and pitfalls:
   - Tailwind → `references/tailwind.md`
   - If no reference exists for the source, follow the general workflow below and map values by hand.

## General workflow

Work incrementally — one component at a time, verifying the rendered result matches before moving on. A big-bang rewrite loses visual parity and is impossible to review.

1. **Inventory.** Find where styles live (utility classes in markup, CSS/SCSS files, CSS-in-JS) and list the components to convert.
2. **Stand up `tokens.css`.** Declare the Tideway custom properties the project needs, imported before any other stylesheet. Grow it as you go.
3. **Convert component by component.** For each, name a BEM block, translate its existing declarations to token references, and keep all of the block's CSS together. Place the result following the `style` skill's file-organization rule: if the source already scopes styles per component (CSS Modules, styled-components), keep that same one-file-per-component mapping (`Tabs.module.css` → `Tabs.css`); if the source has no file mapping to inherit (Tailwind classes in markup), decide the split fresh from the project's conventions rather than defaulting to one giant stylesheet.
4. **Snap to the scale.** Map each source value to the nearest token. When a value sits between two tokens, use the nearer one — the small visual shift is the point of adopting a fixed scale. When a value is genuinely off-scale and load-bearing (a specific brand color, a fixed layout width with no token), keep the raw value in the BEM class and flag it for the user rather than inventing a token silently.
5. **Verify parity.** Compare the rendered component before and after. Only then move on.
6. **Remove the old system.** Once nothing references it, delete the old framework's config, directives, and dependency. Leaving it installed reintroduces the collisions Tideway exists to prevent.

## Out of scope

Writing new components from scratch is the `style` skill. Reviewing converted CSS against the conventions is the `review` skill.
