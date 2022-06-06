/* eslint-disable */
function expandCellsJson(fileDef) {
  const {
    url,
    requestInit,
    options,
    coordinationValues = {},
  } = fileDef;
  console.log("running expand function");
  const baseCoordinationValues = {
    obsType: coordinationValues.obsType || 'cell',
    featureType: coordinationValues.featureType || 'gene',
  };
  return [
    {
      fileType: 'obsIndex.cells.json',
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
    ...options.embeddingTypes.map(et => ({
      fileType: 'obsEmbedding.cells.json',
      url,
      requestInit,
      coordinationValues: {
        ...baseCoordinationValues,
        embeddingType: et,
      },
    })),
    {
      fileType: 'obsLocations.cells.json',
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
    {
      fileType: 'obsSegmentations.cells.json',
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
    // TODO: obsAnnotations for factors.json
  ];
}

/**
 * Built-in convenience file type
 * expansion functions.
 */
export const CONVENIENCE_FILE_TYPES = {
  'cells.json': expandCellsJson,
};
