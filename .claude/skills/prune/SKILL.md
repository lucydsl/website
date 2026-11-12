---
name: prune
description: Find and remove unused CSS in a Tideway project — classes defined in stylesheets but never referenced in markup. Use whenever the user wants to prune dead CSS, find unused styles or classes, clean up or slim a stylesheet, find orphaned BEM classes, or "tree-shake" hand-written CSS.
---

# Tideway: prune

Prune finds CSS classes a project defines but no longer uses, so hand-written stylesheets don't accumulate dead rules. Tideway's conventions make this reliable: every selector is a single flat class, so each rule maps to exactly one class name, and the distinctive BEM names are unambiguous to search for.

## Workflow

1. **Run the detector** from the project root:

   ```
   python scripts/find_unused.py <project-dir>
   ```

   It scans every `.css` file for defined classes, searches the project's markup and scripts for each, and prints two groups: **Unused** (no reference anywhere) and **Possibly dynamic** (see below).

2. **Report the findings to the user** before changing anything. Group by file so the scope is clear.

3. **Remove what's confirmed unused**, on the user's go-ahead. Because a block's CSS lives together, removing an unused element or modifier is a local deletion; an entire unused block is its whole section or file. Removal is safe to do under version control.

## The one thing to be careful about

A class can be referenced without its full name ever appearing in the source — when markup builds it at runtime: `` `card--${variant}` ``, `clsx("card", isOpen && "card--open")`, or other string construction. Such a class is live but looks unused to a text search.

The detector flags these as **Possibly dynamic**: the exact name isn't found, but its prefix (`card--`) does appear in the source. Never remove a class from this group on the report alone — open the construction site, confirm the full name can't be produced there, and only then treat it as dead. When unsure, keep it.

## Out of scope

Writing new CSS is the `style` skill. Converting an existing project onto Tideway is the `migrate` skill.
