const path = require('path');
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const lucyPrism = require('@lucy/prism');
const markdownIt = require('markdown-it');
const markdownItTocAndAnchor = require('./markdownit-toc.js').default;

const PROD_SITE = 'https://example.com';

module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats(['md']);
  eleventyConfig.addPassthroughCopy('styles');
  eleventyConfig.addPassthroughCopy('images');

  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    init({ Prism }) {
      lucyPrism.lucy(Prism);
      lucyPrism.lucyTemplate(Prism);
    }
  });

  eleventyConfig.setLibrary('md', markdownIt({
    html: true
  }).use(markdownItTocAndAnchor, {
    anchorClassName: 'heading-anchor',
    tocClassName: 'toc'
  }));

  eleventyConfig.addFilter('bareUrl', url => {
    return url.substr(1);
  });

  eleventyConfig.addFilter('baseUrl', pathname => {
    const url = new URL(pathname, PROD_SITE);
    let rel = path.relative(url.pathname, '/') || '.';
    return rel + '/';
  });

  function* cleanupLanguageSections(sections) {
    for(let section of sections) {
      if(typeof section === 'string') {
        yield section;
        continue;
      }
      const key = Object.keys(section)[0];
      yield {
        items: section[key],
        title: key
      };
    }
  }

  eleventyConfig.addFilter('cleanupLanguageSections', sections => {
    return Array.from(cleanupLanguageSections(sections));
  });

  eleventyConfig.addFilter('debugger', value => {
    debugger;
  });

  eleventyConfig.addFilter('hashLink', (title, pageUrl) => {
    return pageUrl.substr(1) + '#' + title.toLowerCase().replace(/ /g, '-');
  });
};