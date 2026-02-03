import {
  LoaderResult, AbstractTwoStepLoader,
} from '@vitessce/abstract';
import { UnknownSpatialDataFormatError } from '@vitessce/error';
import { isEqual } from 'lodash-es';
import { CoordinationLevel as CL } from '@vitessce/config';
import {
  coordinateTransformationsToMatrixForSpatialData,
} from '@vitessce/spatial-utils';


/**
   * Loader for embedding arrays located in anndata.zarr stores.
   */
export default class SpatialDataObsPointsLoader extends AbstractTwoStepLoader {
  async loadModelMatrix() {
    const { path, coordinateSystem = 'global' } = this.options;
    if (this.modelMatrix) {
      return this.modelMatrix;
    }
    // Load the transformations from the .zattrs for the shapes
    const zattrs = await this.dataSource.loadSpatialDataElementAttrs(path);

    // According to the design doc for Points as of July 18, 2025:
    // > The table MUST contains axis name to represent the axes.
    // > - If 2D, the axes should be ["x","y"].
    // > - If 3D, the axes should be ["x","y","z"].
    // > It MUST also contain coordinate transformations.

    const { axes, coordinateTransformations } = zattrs;

    if (!(isEqual(axes, ['x', 'y']) || isEqual(axes, ['x', 'y', 'z']))) {
      throw new Error('The axes must be ["x", "y"] for 2D or ["x", "y", "z"] for 3D.');
    }

    if (!coordinateTransformations) {
      throw new Error('The coordinate transformations metadata must be defined for point elements.');
    }

    this.modelMatrix = coordinateTransformationsToMatrixForSpatialData(
      { axes, coordinateTransformations },
      coordinateSystem,
    );
    return this.modelMatrix;
  }

  /**
     * Class method for loading embedding coordinates,
     * such as those from UMAP or t-SNE.
     * @returns {Promise} A promise for an array of columns.
     */
  async loadPoints() {
    const { path } = this.options;

    // TODO: if points are XYZ, and in 2D rendering mode,
    // pass in the current Z index and filter
    // (after coordinate transformation?)

    if (this.locations) {
      return this.locations;
    }
    let locations;
    const formatVersion = await this.dataSource.getPointsFormatVersion(path);
    if (formatVersion === '0.1') {
      locations = await this.dataSource.loadPoints(path);
    } else {
      throw new UnknownSpatialDataFormatError('Only points format version 0.1 is supported.');
    }
    this.locations = locations;
    return this.locations;
  }

  /**
     * Class method for loading the feature index column for points.
     * @returns {Promise} A promise for a column array of integers.
     */
  async loadPointsFeatureIndex() {
    const { path, featureIndexColumn } = this.options;

    if (this.locationsFeatureIndex) {
      return this.locationsFeatureIndex;
    }
    let locationsFeatureIndex;
    const formatVersion = await this.dataSource.getPointsFormatVersion(path);
    if (formatVersion === '0.1') {
      locationsFeatureIndex = await this.dataSource.loadPointsFeatureIndex(
        path, featureIndexColumn,
      );
    } else {
      throw new UnknownSpatialDataFormatError('Only points format version 0.1 is supported.');
    }
    this.locationsFeatureIndex = locationsFeatureIndex;
    return this.locationsFeatureIndex;
  }

  async loadPointsInRect(bounds, signal) {
    const { path, featureIndexColumn, mortonCodeColumn } = this.options;

    // TODO: if points are XYZ, and in 2D rendering mode,
    // pass in the current Z index and filter
    // (after coordinate transformation?)

    let locations;
    // TODO: cache the format version associated with this path.
    const formatVersion = await this.dataSource.getPointsFormatVersion(path);
    if (formatVersion === '0.1') {
      locations = await this.dataSource.loadPointsInRect(
        path, bounds, signal, featureIndexColumn, mortonCodeColumn,
      );
    } else {
      throw new UnknownSpatialDataFormatError('Only points format version 0.1 is supported.');
    }
    // TODO: cacheing?

    return locations;
  }

  async loadObsIndex() {
    const { tablePath, path } = this.options;
    if (tablePath) {
      return this.dataSource.loadObsIndex(tablePath);
    }
    const indexColumn = await this.dataSource.loadPointsIndex(path);
    if (indexColumn) {
      const obsIds = Array.from(indexColumn).map(i => String(i));
      return obsIds;
    }
    // TODO: if still no index column
    // (neither from AnnData.obs.index nor from parquet table index),
    // then create an index based on the row count?
    return null;
  }

  async supportsTiling() {
    const {
      path,
      featureIndexColumn: featureIndexColumnNameFromOptions,
      mortonCodeColumn,
    } = this.options;

    // Check for the presence of bounding_box metadata.
    const zattrs = await this.dataSource.loadSpatialDataElementAttrs(path);
    const { spatialdata_attrs: spatialDataAttrs } = zattrs;
    const { feature_key: featureKey } = spatialDataAttrs;

    const featureIndexColumnName = (
      featureIndexColumnNameFromOptions
      // Reference: https://github.com/vitessce/vitessce-python/blob/adb066c088307b658a45ca9cf2ab2d63effaa5ef/src/vitessce/data_utils/spatialdata_points_zorder.py#L458C15-L458C35
        ?? `${featureKey}_codes`
    );

    const [formatVersion, hasRequiredColumnsAndRowGroupSize] = await Promise.all([
      // Check the points format version.
      this.dataSource.getPointsFormatVersion(path),

      // Check the size of parquet row groups,
      // and for the presence of morton_code_2d and feature_index columns.
      this.dataSource.supportsLoadPointsInRect(
        path, featureIndexColumnName, mortonCodeColumn,
      ),
    ]);

    const isSupportedVersion = formatVersion === '0.1';
    const boundingBox = zattrs?.bounding_box;
    const hasBoundingBox2D = (
      typeof boundingBox?.x_max === 'number'
      && typeof boundingBox?.x_min === 'number'
      && typeof boundingBox?.y_max === 'number'
      && typeof boundingBox?.y_min === 'number'
    );

    return (
      isSupportedVersion
      && hasBoundingBox2D
      && hasRequiredColumnsAndRowGroupSize
    );
  }

  async load() {
    // We need these things regardless of tiling support.
    const [modelMatrix, supportsTiling] = await Promise.all([
      this.loadModelMatrix(),
      this.supportsTiling(),
    ]);

    const coordinationValues = {
      pointLayer: CL({
        obsType: 'point',
        obsColorEncoding: 'spatialLayerColor',
        spatialLayerColor: [255, 255, 255],
        spatialLayerVisible: true,
        spatialLayerOpacity: 0.1,
        // featureValueColormapRange: [0, 1],
        // obsHighlight: null,
        // obsSetColor: null,
        // obsSetSelection: null,
        // additionalObsSets: null,
      }),
    };

    // If tiling is not supported, we need to load all points and the obs index,
    // and the feature_index (or feature_type) column.
    let obsIndex = null;
    let obsPoints = null;
    let featureIndices = null;
    if (!supportsTiling) {
      // We need to load points in full.
      [obsIndex, obsPoints, featureIndices] = await Promise.all([
        this.loadObsIndex(),
        this.loadPoints(),
        this.loadPointsFeatureIndex(),
      ]);
    }

    return new LoaderResult(
      {
        // These will be null if tiling is supported.
        obsIndex,
        obsPoints,
        featureIndices,
        obsPointsModelMatrix: modelMatrix,

        // Return 'tiled' if the morton_code_2d column
        // and bounding_box metadata are present,
        // and the row group size is small enough.
        // Otherwise, return 'full'.
        obsPointsTilingType: (supportsTiling ? 'tiled' : 'full'),

        // TEMPORARY: probably makes more sense to pass the loader instance all the way down.
        // Caller can then decide whether to use loader.load vs. loader.loadPointsInRect.
        // May need another function such as loader.supportsPointInRect() true/false.
        loadPointsInRect: this.loadPointsInRect.bind(this),
      },
      null,
      coordinationValues,
    );
  }
}
