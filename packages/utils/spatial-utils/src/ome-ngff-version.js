// OME-NGFF v0.5 nests OME metadata under an `ome` key inside the
// Zarr store's root attributes. Earlier versions place the same keys
// (`multiscales`, `omero`, `channels_metadata`, `image-label`, ...)
// directly at the root. This helper normalizes v0.5 to the v0.4 shape
// by hoisting `ome`'s contents to the root. Root-level keys win on
// conflict, which preserves sibling namespaces like `spatialdata_attrs`.
export function flattenOmeAttrs(rootAttrs) {
  if (rootAttrs && typeof rootAttrs.ome === 'object' && rootAttrs.ome !== null) {
    return { ...rootAttrs.ome, ...rootAttrs };
  }
  return rootAttrs;
}

// Returns the OME-NGFF version string for the given (already-flattened)
// metadata, or null if not declared.
// - v0.5+: version is declared at `ome.version`, which appears at the
//   root after flattening.
// - v0.4 and earlier: version is declared per-multiscale.
export function getOmeNgffVersion(metadata) {
  if (!metadata) return null;
  if (typeof metadata.version === 'string') return metadata.version;
  const ms = Array.isArray(metadata.multiscales) ? metadata.multiscales[0] : null;
  if (ms && typeof ms.version === 'string') return ms.version;
  return null;
}
