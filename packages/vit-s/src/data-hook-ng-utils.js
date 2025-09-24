export const DEFAULT_NG_PROPS = {
  layout: '3d',
  position: [0, 0, 0],
  projectionOrientation: [0, 0, 0, 1],
  projectionScale: 1024,
  crossSectionScale: 1,
};

function toPrecomputedSource(url) {
  if (!url) return undefined;
  return url.startsWith('precomputed://') ? url : `precomputed://${url}`;
}

const UNIT_TO_NM = {
  nm: 1,
  um: 1e3,
  µm: 1e3,
  mm: 1e6,
  cm: 1e7,
  m: 1e9,
};


function isInNanometerRange(value, unit, minNm = 1, maxNm = 100) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return false;

  const factor = unit && UNIT_TO_NM[unit];
  if (!factor) return false;

  const nm = n * factor;
  return nm >= minNm && nm <= maxNm;
}

/**
   * Normalize dimensionX/Y/Z to nanometers.
   * @param {object} opts
   * @returns {{ x:[number,'nm'], y:[number,'nm'], z:[number,'nm'] }}
   */
function normalizeDimensionsToNanometers(opts) {
  const { dimensionUnit, dimensionX, dimensionY, dimensionZ } = opts;

  if (!dimensionUnit || !dimensionX || !dimensionY || !dimensionZ) {
    console.warn('Missing dimension info');
  }
  const xNm = isInNanometerRange(dimensionX, dimensionUnit);
  const yNm = isInNanometerRange(dimensionY, dimensionUnit);
  const zNm = isInNanometerRange(dimensionZ, dimensionUnit);
  if (!xNm || !yNm || !zNm) {
    console.warn('Dimension was converted to nm units');
  }
  return {
    x: xNm ? [dimensionX, dimensionUnit] : [1, 'nm'],
    y: yNm ? [dimensionY, dimensionUnit] : [1, 'nm'],
    z: zNm ? [dimensionZ, dimensionUnit] : [1, 'nm'],
  };
}

export function extractDataTypeEntities(loaders, dataset, dataType) {
  const datasetEntry = loaders?.[dataset];
  const internMap = datasetEntry?.loaders?.[dataType];
  if (!internMap || typeof internMap.entries !== 'function') return [];

  return Array.from(internMap.entries()).map(([key, loader]) => {
    const url = loader?.url ?? loader?.dataSource?.url ?? undefined;
    const fileUid = key?.fileUid
        ?? loader?.coordinationValues?.fileUid
        ?? undefined;

    const { layout, position, projectionOrientation,
      projectionScale, crossSectionScale } = loader?.options ?? {};
    const isPrecomputed = loader?.fileType.includes('precomputed');
    if (!isPrecomputed) {
      console.warn('Filetype needs to be precomputed');
    }
    return {
      key,
      type: 'segmentation',
      fileUid,
      layout: layout ?? DEFAULT_NG_PROPS.layout,
      url,
      source: toPrecomputedSource(url),
      name: fileUid ?? key?.name ?? 'segmentation',
      // For precomputed: nm is the unit used
      dimensions: normalizeDimensionsToNanometers(loader?.options),
      // If not provided, no error, but difficult to see the data
      position: Array.isArray(position) && position.length === 3
        ? position : DEFAULT_NG_PROPS.position,
      // If not provided, will have a default orientation
      projectionOrientation: Array.isArray(projectionOrientation)
          && projectionOrientation.length === 4
        ? projectionOrientation : DEFAULT_NG_PROPS.projectionOrientation,
      projectionScale: Number.isFinite(projectionScale)
        ? projectionScale : DEFAULT_NG_PROPS.projectionScale,
      crossSectionScale: Number.isFinite(crossSectionScale)
        ? crossSectionScale : DEFAULT_NG_PROPS.crossSectionScale,
    };
  });
}
