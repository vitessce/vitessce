/**
 * Fetch the JSON `info` file of a Neuroglancer precomputed source.
 * Failures are non-fatal: the info is only used for auxiliary purposes
 * (e.g., deriving an initial camera position), so we return null.
 * @param {string} url The base URL of the precomputed source.
 * @param {RequestInit|undefined} requestInit
 * @returns {Promise<object|null>}
 */
export async function fetchNeuroglancerInfo(url, requestInit) {
  if (!url) return null;
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/info`, requestInit);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn(`[neuroglancer-loaders] failed to fetch info for ${url}:`, e);
    return null;
  }
}
