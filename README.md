# Lucy website

The site at https://lucy.spooky.click/, built with [Astro](https://astro.build/).

- `src/pages/`: one file per page. Most are Markdown; the home page is `index.astro`.
- `src/layouts/`: `Page` (most pages), `Install` and `Language` (the language guide, with its sidebar from the `sections` frontmatter).
- `src/components/`: the nav, footer, `<base>`, stylesheets and icons shared by the layouts.
- `src/markdown/toc-and-anchors.ts`: heading ids, `#` anchor links and the `@[toc]` table of contents.
- `src/prism.ts`: adds Lucy to Prism, which highlights code in Markdown and through `<Prism>` on the home page.
- `public/`: copied as is: `styles/`, `images/` and `install.sh` (served at `/install.sh`).

## Styles

The CSS in `public/styles/` follows [Tideway](https://tidewaystyle.com/) (its skills are in `.claude/skills/`): every value is a token from `tokens.css`, colour comes from the semantic roles there, and every class is flat BEM (`block__element--modifier`), one class per selector.

- `tokens.css`: Tideway's scales, plus the site's own palette and the few off-scale sizes its look depends on (named `--*-lucy-*`), the semantic roles, and the Dracula syntax roles. Loaded first.
- `base.css`: the reset and element defaults, the only bare element selectors.
- `main.css` (page column, nav, footer, inline code), `home.css`, `language.css`: one BEM block per component.
- Two documented exceptions, for markup the site doesn't write: `prose.css` styles rendered Markdown (headings, anchors, inline code) under a `.prose` block, and `dracula-prism.css` styles Prism's generated `.token` classes.

Breakpoints are Tideway's, mobile-first: `sm` 640px, `md` 768px, `lg` 1024px.

Pages link relative to a `<base href>` at the site root, so write links like `docs/language/`, not `/docs/language/`.

## Develop

Needs Node 24 (Volta picks it up from `package.json`).

```sh
npm install
npm run dev      # http://localhost:4321/
npm run build    # into dist/
npm run check    # astro check
```

## Deploy

The site is a static-assets Cloudflare Worker, `lucy-website`, on the custom domain lucy.spooky.click (see `wrangler.jsonc`). Workers Builds deploys every push to `main`: it runs `npm run build`, then `npx wrangler deploy`. Pull requests get a preview build (`npm run build`, then `npx wrangler preview`), linked from the PR. To deploy by hand, build, then run `npx wrangler deploy`.

Prism is pinned to 1.25.0 (with an npm override) because later versions tokenize JavaScript object keys and shell flags differently, which changes the colors of the code samples.
