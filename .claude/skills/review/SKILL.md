---
name: review
description: Review CSS against the Tideway conventions — off-scale values, inlined tokens, direct palette use instead of semantic roles, and BEM or selector violations. Use whenever the user wants to review, lint, audit, or check CSS for Tideway compliance, or asks whether some CSS follows Tideway / the tokens / BEM.
---

# Tideway: review

Review checks CSS against the Tideway conventions and reports where it drifts. It reads, it doesn't rewrite: findings go to the user, and fixes happen only on their go-ahead.

## Before you start

**Read the `style` skill.** It defines the conventions you are reviewing against. Read `../style/SKILL.md` and `../style/references/tokens.md` so you know the exact token scales, the semantic role layer, and the BEM and selector rules. Everything below assumes you already know them.

## Scope

By default, **review only what changed** — the staged and unstaged edits, not the whole codebase:

```
git diff HEAD
```

Review the CSS in that diff (and any new stylesheets in `git status`). Reviewing the whole codebase on every request buries the changes the user actually wants checked in a wall of pre-existing findings.

Widen to the whole codebase only when:

- The user asks for a full audit, or names a scope ("review `styles/`").
- There are no pending changes to review. In that case, say so and **ask before scanning everything** — a full review is a different, larger task the user may not want right now.

## What to check

Read each rule in the `style` skill and flag CSS that breaks it:

- **Off-scale values** — a `margin`, `color`, `font-size`, radius, or shadow that isn't one of the token scales. A hardcoded `13px`, `#4a7fd6`, `0.85rem`.
- **Inlined token values** — a raw value that equals a token (`padding: 1rem` where `--space-4` exists) instead of `var(--space-4)`. The link to the token is severed.
- **Direct palette use** — a component reading a `--color-*` primitive for color instead of a semantic role (`--surface`, `--text`, `--accent`, …). This is what breaks theming.
- **BEM violations** — names that aren't `block__element--modifier`; nested elements (`card__header__title`); a modifier used without its base class; a block styling another block's internals.
- **Selector violations** — more than one class per selector, IDs, bare element selectors outside a reset, chained classes to win specificity, descendant combinators, or `!important`.

## Reporting

1. **Group findings by file**, then by rule, so the scope is clear.
2. For each, quote the offending line and name the rule it breaks and the fix (which token, which role, which BEM form).
3. **Report before changing anything.** Apply fixes only on the user's go-ahead. A finding you're unsure about — a value that may be intentionally off-scale, a class that may be built dynamically — is worth raising as a question, not silently rewriting.

## Out of scope

Writing new CSS is the `style` skill. Converting an existing project onto Tideway is the `migrate` skill. Removing classes that are defined but never used is the `prune` skill.
