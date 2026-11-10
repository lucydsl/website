// Heading ids, heading anchor links and the `@[toc]` table of contents, as
// the site's markdown-it-toc-and-anchor setup rendered them:
//
//   <h2 id="nested-state"><a class="heading-anchor" href="language-overview/#nested-state">#</a> Nested state</h2>
//
// Links start from the page's path because every page has a <base href> at
// the site root. Ids are slugged with uslug, numbered from -2 on repeats.
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { HastPluginDefinition } from 'satteri';
import type { Element, ElementContent, Root, RootContent } from 'hast';
import uslug from 'uslug';

const pagesDir = fileURLToPath(new URL('../pages/', import.meta.url));
const TOC_MARKER = '@[toc]';

// "src/pages/docs/language.md" -> "docs/language/"
function pageFromBase(fileURL: URL | undefined): string {
  if (!fileURL) return '';
  const rel = path.relative(pagesDir, fileURLToPath(fileURL)).split(path.sep).join('/');
  const route = rel.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
  return route ? route + '/' : '';
}

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TocNode {
  heading?: Heading;
  nodes: TocNode[];
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderToc(headings: Heading[], page: string): string {
  const tree: TocNode = { nodes: [] };
  for (const heading of headings) {
    let parent = tree;
    for (let level = 1; level < heading.level; level++) {
      if (parent.nodes.length === 0) parent.nodes.push({ nodes: [] });
      parent = parent.nodes[parent.nodes.length - 1];
    }
    parent.nodes.push({ heading, nodes: [] });
  }
  const list = (nodes: TocNode[], className?: string): string =>
    `<ul${className ? ` class="${className}"` : ''}>\n` +
    nodes
      .map(({ heading, nodes }) => {
        const link = heading ? `<a href="${escapeHtml(page)}#${heading.id}">${escapeHtml(heading.text)}</a>` : '';
        return nodes.length ? `<li>${link}\n${list(nodes)}</li>\n` : `<li>${link}</li>\n`;
      })
      .join('') +
    '</ul>\n';
  return list(tree.nodes, 'toc');
}

function* walk(node: Root | Element): Generator<Element> {
  for (const child of node.children as RootContent[]) {
    if (child.type === 'element') {
      yield child;
      yield* walk(child);
    }
  }
}

function textOf(node: ElementContent): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(textOf).join('');
  return '';
}

export const tocAndAnchors: HastPluginDefinition = {
  name: 'toc-and-anchors',
  after(root, ctx) {
    const page = pageFromBase(ctx.fileURL);
    const seen = new Map<string, number>();
    const headings: Heading[] = [];
    let tocParagraph: Element | undefined;

    for (const node of walk(root as Root)) {
      if (node.tagName === 'p' && textOf(node) === TOC_MARKER) {
        tocParagraph = node;
        continue;
      }
      const match = /^h([1-6])$/.exec(node.tagName);
      if (!match) continue;

      // A heading that starts with a link takes its id from the link text.
      const [first] = node.children;
      const text = first?.type === 'element' && first.tagName === 'a' ? textOf(first) : node.children.map(textOf).join('');
      const slug = uslug(text);
      const count = (seen.get(slug) ?? 0) + 1;
      seen.set(slug, count);
      const id = count > 1 ? `${slug}-${count}` : slug;
      headings.push({ level: Number(match[1]), text: node.children.map(textOf).join(''), id });

      ctx.setProperty(node, 'id', id);
      ctx.prependChild(node, [
        {
          type: 'element',
          tagName: 'a',
          properties: { className: ['heading-anchor'], href: `${page}#${id}` },
          children: [{ type: 'text', value: '#' }],
        },
        { type: 'text', value: ' ' },
      ]);
    }

    if (tocParagraph) {
      ctx.setField(tocParagraph, 'children', [{ type: 'raw', value: renderToc(headings, page) }]);
    }
  },
};

// Astro's Prism highlighter adds data-language to each <pre>; the site's
// markup never had it.
export const dropDataLanguage: HastPluginDefinition = {
  name: 'drop-data-language',
  element: {
    filter: ['pre'],
    visit(node, ctx) {
      if (node.properties?.dataLanguage !== undefined) ctx.setProperty(node, 'dataLanguage', null);
    },
  },
};
