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
  // Temporary, while @lucy/astro is a local file: link outside the site:
  // let the dev server serve its client entry. Remove once it's published.
  vite: {
    server: {
      fs: { allow: [searchForWorkspaceRoot(process.cwd()), '../../../lucy-astro-prototype/integration'] },
    },
  },
  markdown: {
    syntaxHighlight: 'prism',
    processor: satteri({
      hastPlugins: [dropDataLanguage, tocAndAnchors],
      features: { gfm: false, smartPunctuation: false },
    }),
  },
});
