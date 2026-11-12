#!/usr/bin/env python3
"""Find CSS classes defined in a project but never referenced in its markup.

Usage:
    python find_unused.py [PROJECT_DIR]   # defaults to the current directory

Scans .css files for defined class selectors, then searches the project's
templates, markup, and scripts for each class. Prints classes with no
reference, split into two groups:

  * Unused — no reference found anywhere. Safe to remove.
  * Possibly dynamic — the class isn't referenced verbatim, but its name prefix
    (e.g. `card__`) appears in the source, a sign the full name may be built at
    runtime (`card__${part}`, clsx, string concat). Verify before removing.

Relies on Tideway's flat, single-class BEM selectors: each rule's selector is
one class, so a class name maps cleanly to a definition and to a search token.
"""
import os
import re
import sys

CSS_EXT = {".css"}
SRC_EXT = {
    ".html", ".htm", ".astro", ".jsx", ".tsx", ".js", ".ts", ".mjs",
    ".vue", ".svelte", ".php", ".erb", ".hbs", ".handlebars", ".md", ".mdx", ".twig",
}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".astro", ".next", "out", "vendor", ".svelte-kit"}

# A class name in a selector: `.name`, allowing BEM `__` and `--`.
CLASS_RE = re.compile(r"\.(-?[_a-zA-Z][\w-]*)")
# The text before each `{` — a selector or an at-rule prelude.
PRELUDE_RE = re.compile(r"([^{}]*)\{")
COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)


def walk(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            yield os.path.join(dirpath, name)


def read(path):
    try:
        with open(path, encoding="utf-8", errors="ignore") as fh:
            return fh.read()
    except OSError:
        return ""


def collect_defined(root):
    """Return {class_name: [(file, line), ...]} for every class in a selector."""
    defined = {}
    for path in walk(root):
        if os.path.splitext(path)[1] not in CSS_EXT:
            continue
        text = COMMENT_RE.sub("", read(path))
        for prelude_match in PRELUDE_RE.finditer(text):
            prelude = prelude_match.group(1)
            if prelude.lstrip().startswith("@"):
                continue  # at-rule (@media, @supports, …), not a selector
            base = prelude_match.start(1)
            for cm in CLASS_RE.finditer(prelude):
                name = cm.group(1)
                line = text.count("\n", 0, base + cm.start()) + 1
                defined.setdefault(name, []).append((path, line))
    return defined


def collect_source(root):
    return "\n".join(read(p) for p in walk(root) if os.path.splitext(p)[1] in SRC_EXT)


def prefix_of(cls):
    """The constructable prefix up to the last BEM separator, e.g. card__title -> card__."""
    idx = max(cls.rfind("__"), cls.rfind("--"))
    return cls[: idx + 2] if idx != -1 else None


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    defined = collect_defined(root)
    source = collect_source(root)

    safe, dynamic = [], []
    for cls, locs in sorted(defined.items()):
        token = re.compile(r"(?<![\w-])" + re.escape(cls) + r"(?![\w-])")
        if token.search(source):
            continue  # referenced verbatim somewhere
        prefix = prefix_of(cls)
        (dynamic if prefix and prefix in source else safe).append((cls, locs, prefix))

    print(f"Scanned {root}: {len(defined)} classes defined, "
          f"{len(safe) + len(dynamic)} with no verbatim reference.\n")

    print(f"Unused — safe to remove ({len(safe)}):")
    for cls, locs, _ in safe:
        print(f"  .{cls}  ({', '.join(f'{p}:{l}' for p, l in locs)})")
    if not safe:
        print("  (none)")

    print(f"\nPossibly dynamic — verify the construction site before removing ({len(dynamic)}):")
    for cls, locs, prefix in dynamic:
        print(f"  .{cls}  (prefix '{prefix}' appears in source; defined {', '.join(f'{p}:{l}' for p, l in locs)})")
    if not dynamic:
        print("  (none)")


if __name__ == "__main__":
    main()
