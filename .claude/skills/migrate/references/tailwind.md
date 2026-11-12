# Migrating from Tailwind

Tideway's token scales are the same scales Tailwind uses — identical spacing steps, color shades, type sizes, radii, and shadows. So most utilities map one-to-one to a token; the real work is regrouping utilities into BEM classes, not recomputing values.

## The conversion

For each element, collect its utility classes into a single BEM class named for the component part, and translate each utility to a declaration. Utilities applied conditionally (via framework logic, `clsx`, etc.) become **modifiers**. A repeated component becomes one **block**, reused.

## Utility → declaration

| Tailwind | Tideway declaration |
| :------- | :------------------ |
| `p-4` `px-4` `py-4` `pt-4`… | `padding: var(--space-4)` / `padding-inline` / `padding-block` / `padding-top`… |
| `m-4` `mx-auto` | `margin: var(--space-4)` / `margin-inline: auto` |
| `gap-6` | `gap: var(--space-6)` |
| `w-8` `h-8` | `width: var(--space-8)` / `height: var(--space-8)` |
| `w-full` | `width: 100%` |
| `bg-blue-500` | `background-color: var(--color-blue-500)` |
| `text-slate-700` | `color: var(--color-slate-700)` |
| `border-slate-200` | `border-color: var(--color-slate-200)` |
| `text-lg` | `font-size: var(--text-lg)` **plus** its paired line-height (see below) |
| `font-semibold` | `font-weight: var(--font-semibold)` |
| `rounded-lg` `rounded` `rounded-full` | `border-radius: var(--radius-lg)` / `var(--radius-base)` / `var(--radius-full)` |
| `shadow` `shadow-md` | `box-shadow: var(--shadow-base)` / `var(--shadow-md)` |
| `tracking-tight` | `letter-spacing: var(--tracking-tight)` |
| `leading-normal` | `line-height: var(--leading-normal)` |
| `font-mono` | `font-family: var(--font-mono)` |
| `max-w-lg` `max-w-prose` | `max-width: var(--container-lg)` / `var(--container-prose)` |
| `z-50` | `z-index: var(--z-50)` |
| `duration-200` `ease-out` | `transition-duration: var(--duration-200)` / `transition-timing-function: var(--ease-out)` |
| `blur-sm` `backdrop-blur-sm` | `filter: blur(var(--blur-sm))` / `backdrop-filter: blur(var(--blur-sm))` |
| `border-2` | `border-width: var(--border-2)` |

Layout and box utilities (`flex`, `grid`, `items-center`, `justify-between`, `relative`, `hidden`, `block`, `overflow-hidden`…) are just plain CSS properties — write the property directly inside the BEM class. No token is involved.

## Responsive and state variants

- **Breakpoints** — `sm:` `md:` `lg:` `xl:` `2xl:` become mobile-first `@media (min-width: …)` blocks at 640 / 768 / 1024 / 1280 / 1536px. Base (unprefixed) utilities are the mobile layer.
- **State** — `hover:` `focus:` `focus-visible:` `active:` `disabled:` become the matching pseudo-classes (`:hover`, `[disabled]`, …) on the BEM class.
- **`group-*` / peer state** — a parent's state driving a child's style is the one case that would need a descendant selector, which BEM forbids. Instead have the parent re-declare a custom property on its `:hover`/state, and let the child read it — flat selectors on both sides.

## Watch for

- **Paired line-height.** Tailwind's `text-*` sets font-size *and* a line-height. Tideway's `--text-*` is size only, so also set `line-height` — from the pairing in `tokens.md`'s font-size table, or a `--leading-*` token — or the vertical rhythm will shift.
- **Arbitrary values** — `p-[13px]`, `text-[#4a7fd6]`, `w-[327px]` are off-scale by definition. Snap to the nearest token; if the value is genuinely bespoke and load-bearing, keep it raw in the class and flag it for the user.
- **Opacity modifiers** — `bg-blue-500/50` becomes `color-mix(in oklch, var(--color-blue-500) 50%, transparent)`.
- **`space-x-*` / `space-y-*` / `divide-*`** — these rely on child selectors. Prefer `gap` on the flex/grid parent.
- **`@apply`** — inline the mapped declarations into the BEM class; there is no `@apply` in Tideway.
- **`!` important** (`!p-4` or `p-4!`) — drop it. Flat BEM specificity means you never need `!important`; if something depended on it, the cascade was the real bug.
- **`dark:`** — Tideway has no built-in dark-mode variant. Raise it with the user before inventing one; don't scatter ad-hoc dark overrides.
- **`container`** — map to a container block with an explicit `max-width`.

## Removing Tailwind

Once no markup references utilities:

1. Delete the `@tailwind` / `@import "tailwindcss"` directives (and any `@layer`/`@apply` usage).
2. Remove `tailwind.config.*` and the Tailwind PostCSS/Vite plugin.
3. Uninstall the packages.
4. Confirm `tokens.css` is imported first and the app still renders unchanged.
