import { FileType } from './constants';

export function expandCellSetsJson(fileDef) {
  const {
    url,
    requestInit,
    coordinationValues = {},
  } = fileDef;
  const baseCoordinationValues = {
    obsType: coordinationValues.obsType || 'cell',
  };
  return [
    {
      fileType: FileType.OBS_SETS_CELL_SETS_JSON,
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
  ];
}

/**
 * Built-in convenience file type
 * expansion functions.
 */
export const CONVENIENCE_FILE_TYPES = {
  // [FileType.CELL_SETS_JSON]: expandCellSetsJson,
};
