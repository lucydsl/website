# Examples

The Lucy machines shown on the home page, and what the compiler makes of
them. The `.js` files are `lucyc` output, unedited; regenerate them with a
`bin/lucyc` built from liblucy's main branch:

```sh
for f in src/examples/*.lucy; do lucyc "$f" > "${f%.lucy}.js"; done
```

The home page draws `toggle.lucy` as a diagram too (in `src/pages/index.astro`);
if the machine changes, redraw it.
