# Lucy website

The site at https://lucy.spooky.click/, built with [Astro](https://astro.build/).

- `src/pages/`: one file per page. Most are Markdown; the home page (`index.astro`) and the docs index (`docs/index.astro`) are hand-written.
- `src/layouts/`: `Site` (the document shell: head, header, footer), `Page` (content pages: a header with the page's state path, title and `lede` from the frontmatter, then the content) and `Language` (the language guide, with its contents from the `sections` frontmatter). Markdown pages start their sections at `##`; the layout writes the `h1` from `title`.
- `src/components/`: the header (`Nav`), footer, page header, the statechart contents list, `<base>`, stylesheets and icons.
- `src/examples/`: the machines on the home page and `lucyc`'s output for them, unedited (see its README).
- `src/markdown/toc-and-anchors.ts`: heading ids, `#` anchor links and the `@[toc]` table of contents.
- `src/prism.ts`: adds Lucy to Prism, which highlights code in Markdown and through `<Prism>` on the home page.
- `public/`: copied as is: `styles/`, `fonts/`, `images/` and `install.sh` (served at `/install.sh`).

## Design

"A statechart, printed at night." Every page is a state: the header starts at the initial dot (a statechart's initial pseudostate), a rail runs from it down the page with headings as nodes on it, and the footer ends at the final-state bullseye. Nav links are drawn as states, the current one filled; each page header reads its state path the way a Lucy machine reports a nested state (`'docs.language'`). Type is Cormorant Garamond (display), Spectral (text) and IBM Plex Mono (code and labels), self-hosted from Fontsource in `public/fonts/` (latin subsets, OFL). The palette is the site's old one, with ink as the page.

## Styles

The CSS in `public/styles/` follows [Tideway](https://tidewaystyle.com/) (its skills are in `.claude/skills/`): every value is a token from `tokens.css`, colour comes from the semantic roles there, and every class is flat BEM (`block__element--modifier`), one class per selector.

- `tokens.css`: Tideway's scales, plus the site's own palette and the few off-scale sizes its look depends on (named `--*-lucy-*`), the semantic roles, and the Dracula syntax roles. Loaded first.
- `base.css`: the reset and element defaults, the only bare element selectors.
- `fonts.css`: the `@font-face` rules.
- `main.css` (header, rail, page header, footer, and small shared blocks), `home.css`, `language.css`, `docs.css`: one BEM block per component.
- Two documented exceptions, for markup the site doesn't write: `prose.css` styles rendered Markdown (headings, anchors, inline code) under a `.prose` block, and `dracula-prism.css` styles Prism's generated `.token` classes (its block rules are wrapped in `:where()`, so a class passed to `<Prism class="...">` can restyle a block).

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
