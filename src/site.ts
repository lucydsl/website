// Every page sets <base href> to the site root as a relative path ("./",
// "../", "../../"), so links and assets are written relative to the root
// and the site works from any directory.
export function baseUrl(pathname: string): string {
  const depth = pathname.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
}

// The page's own path from the <base>, for in-page links ("docs/language/").
export function fromBase(pathname: string): string {
  return pathname.slice(1);
}

// Each page is a state of the site, named the way a Lucy machine reports a
// nested state: a dotted path. "/docs/language/" -> "docs.language".
export function statePath(pathname: string): string {
  return pathname.split('/').filter(Boolean).join('.') || 'home';
}

// The pages that count as documentation, for the nav's "docs" state.
const docsPages = ['/docs/', '/language-overview/', '/prism/', '/vscode-extension/'];
export function isDocs(pathname: string): boolean {
  return docsPages.some((page) => pathname.startsWith(page));
}
