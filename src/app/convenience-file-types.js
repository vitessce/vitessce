import { FileType } from './constants';

export function expandRasterJson(fileDef) {
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
      fileType: FileType.IMAGE_RASTER_JSON,
      url,
      requestInit,
      coordinationValues,
    },
    {
      fileType: FileType.OBS_SEGMENTATIONS_RASTER_JSON,
      url,
      requestInit,
      coordinationValues: baseCoordinationValues,
    },
  ];
}

export function expandRasterOmeZarr(fileDef) {
  const {
    url,
    requestInit,
    coordinationValues = {},
  } = fileDef;
  return [
    {
      fileType: FileType.IMAGE_OME_ZARR,
      url,
      requestInit,
      coordinationValues,
    },
  ];
}

/**
 * Built-in convenience file type
 * expansion functions.
 */
export const CONVENIENCE_FILE_TYPES = {
  // [FileType.RASTER_JSON]: expandRasterJson,
  // [FileType.RASTER_OME_ZARR]: expandRasterOmeZarr,
};
