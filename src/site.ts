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
