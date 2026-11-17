import { createParser } from 'nuqs';

/**
 * Parse the value of the `feature` URL param,
 * formatted like `nodeType:label` (e.g., `gene:UMOD` or `pathway:Cell Cycle R-HSA-1640170`).
 * @param {string} value
 * @returns {{ label: string, nodeType: string } | null}
 */
export function parseBiomarkerParam(value) {
  // Split at the first colon, since the label may contain colons.
  const separatorIndex = value.indexOf(':');
  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    return null;
  }
  return {
    nodeType: value.slice(0, separatorIndex),
    label: value.slice(separatorIndex + 1),
  };
}

/**
 * Serialize a biomarker selection to the `feature` URL param format.
 * @param {{ label: string, nodeType: string }} value
 * @returns {string}
 */
export function serializeBiomarkerParam(value) {
  return `${value.nodeType}:${value.label}`;
}

export const parseAsBiomarker = createParser({
  parse: parseBiomarkerParam,
  serialize: serializeBiomarkerParam,
  eq: (a, b) => a.label === b.label && a.nodeType === b.nodeType,
});
