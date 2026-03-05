import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class NgAnnotationPointsDataLoader extends AbstractTwoStepLoader {
  async load() {
    const { url } = this;

    // Note: tissue-map-tools creates an AnnotationProperty for every column in the sdata Points element dask dataframe.
    // This means that we will need to read the parquet metadata of the corresponding Points element to determine which annotation properties are available.
    // For the featureKey specifically, we can just use the spatialdata_attrs (we do not need to look in the parquet file for this).
    // This is relevant to the shader generation code in shader-utils.js,
    // e.g., we cannot just assume that 
    // Reference: https://github.com/hms-dbmi/tissue-map-tools/blob/6a904241436e946ffbadef24b780a33321754991/src/tissue_map_tools/converters.py#L295

    // Basically, for the neuroglancer file URL, we will require a corresponding spatialdata.zarr URL
    // and then read either its spatialdata_attrs or the parquet metadata.
    // Alternatively, we can force the user to specify via `option`s the name of the featureKey column.
    // This would probably be the easiest way forward for now,
    // as URL correspondences can get tricky.

    return new LoaderResult(
      {
        obsIndex: null,
        obsPoints: null,
        featureIds: null,
        obsPointsModelMatrix: null,
        obsPointsTilingType: 'neuroglancer',
      },
      url,
    );
  }
}
