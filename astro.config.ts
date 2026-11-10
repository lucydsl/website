import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { dropDataLanguage, tocAndAnchors } from './src/markdown/toc-and-anchors.ts';
import './src/prism.ts';

export default defineConfig({
  site: 'https://lucy.spooky.click',
  trailingSlash: 'always',
  // Keep the whitespace between tags as written, like the Eleventy site.
  compressHTML: false,
  markdown: {
    syntaxHighlight: 'prism',
    processor: satteri({
      hastPlugins: [dropDataLanguage, tocAndAnchors],
      features: { gfm: false, smartPunctuation: false },
    }),
  },
});
