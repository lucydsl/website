# Lucy website

The site at https://lucy.spooky.click/, built with [Astro](https://astro.build/).

- `src/pages/`: one file per page. Most are Markdown; the home page is `index.astro`.
- `src/layouts/`: `Page` (most pages), `Install` and `Language` (the language guide, with its sidebar from the `sections` frontmatter).
- `src/components/`: the nav, footer, `<base>`, stylesheets and icons shared by the layouts.
- `src/markdown/toc-and-anchors.ts`: heading ids, `#` anchor links and the `@[toc]` table of contents.
- `src/prism.ts`: adds Lucy to Prism, which highlights code in Markdown and through `<Prism>` on the home page.
- `public/`: copied as is: `styles/`, `images/` and `install.sh` (served at `/install.sh`).

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

The site is a static-assets Cloudflare Worker, `lucy-website`, on the custom domain lucy.spooky.click (see `wrangler.jsonc`). Workers Builds deploys every push to `main`: it runs `npm run build`, then `npx wrangler deploy`. To deploy by hand, build, then run `npx wrangler deploy`.

Prism is pinned to 1.25.0 (with an npm override) because later versions tokenize JavaScript object keys and shell flags differently, which changes the colors of the code samples.
