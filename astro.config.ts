import { defineConfig } from 'astro/config';
import { searchForWorkspaceRoot } from 'vite';
import { satteri } from '@astrojs/markdown-satteri';
import lucy from '@lucy/astro';
import { dropDataLanguage, tocAndAnchors } from './src/markdown/toc-and-anchors.ts';
import './src/prism.ts';

export default defineConfig({
  site: 'https://lucy.spooky.click',
  trailingSlash: 'always',
  // Keep the whitespace between tags as written, like the Eleventy site.
  compressHTML: false,
  // Machines with views as components (the demos), hydrated in the browser.
  integrations: [lucy({ hydrate: true })],
  // Temporary, while @lucy/astro and @lucy/prism are local file: links
  // outside the site: let the dev server serve the renderer's client entry,
  // and load the Prism plugin (CommonJS) with Node, as it would be from
  // node_modules. Remove once they're published.
  vite: {
    server: {
      fs: { allow: [searchForWorkspaceRoot(process.cwd()), '../astro'] },
    },
    ssr: { external: ['@lucy/prism'] },
  },
  markdown: {
    syntaxHighlight: 'prism',
    processor: satteri({
      hastPlugins: [dropDataLanguage, tocAndAnchors],
      features: { gfm: false, smartPunctuation: false },
    }),
  },
});
