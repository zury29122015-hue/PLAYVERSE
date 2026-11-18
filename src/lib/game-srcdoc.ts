/**
 * Loads a game's entry HTML (hosted on Vercel Blob) as text and injects a
 * <base> tag so its relative asset paths (css/js/images) keep resolving
 * against the Blob folder once the HTML is handed to an iframe via srcDoc
 * instead of navigated to directly.
 *
 * srcDoc is used instead of <iframe src="..."> because navigating straight
 * to the Blob URL hits two platform-level Vercel Blob response headers that
 * can't be overridden via the @vercel/blob SDK: `Content-Disposition:
 * attachment` (forces a download instead of a render) and a locked-down
 * `Content-Security-Policy: default-src 'none'` (blocks every script on the
 * page). fetch() + srcDoc never navigates to that URL, so neither header
 * ever applies — only the bytes are read.
 */
export async function loadGameSrcDoc(entryFileUrl: string): Promise<string> {
  const res = await fetch(entryFileUrl);
  if (!res.ok) throw new Error(`Failed to load game (${res.status})`);
  const html = await res.text();
  const baseHref = entryFileUrl.slice(0, entryFileUrl.lastIndexOf("/") + 1);
  const baseTag = `<base href="${baseHref}">`;

  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}${baseTag}`);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}<head>${baseTag}</head>`);
  return `${baseTag}${html}`;
}
