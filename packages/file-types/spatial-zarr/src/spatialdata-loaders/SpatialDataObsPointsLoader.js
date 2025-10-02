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

  async loadPointsInRect(bounds) {
    const { path } = this.options;

    // TODO: if points are XYZ, and in 2D rendering mode,
    // pass in the current Z index and filter
    // (after coordinate transformation?)

    let locations;
    // TODO: cache the format version associated with this path.
    const formatVersion = await this.dataSource.getPointsFormatVersion(path);
    if (formatVersion === '0.1') {
      locations = await this.dataSource.loadPointsInRect(path, bounds);
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

  async load() {
    
    const [/*obsIndex, obsPoints, */modelMatrix] = await Promise.all([
      /*this.loadObsIndex(), // TEMP
      this.loadPoints(),*/
      this.loadModelMatrix(),
    ]);
    // May require changing the obsPoints format (breaking change?)

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
    console.log(modelMatrix)

    return new LoaderResult(
      {
        obsIndex: ["1"], // TEMP
        obsPoints: { // TEMP
          shape: [2, 1],
          data: [[0], [0]],
        },
        obsPointsModelMatrix: modelMatrix,
        // TEMPORARY: probably makes more sense to pass the loader instance all the way down.
        // Caller can then decide whether to use loader.load vs. loader.loadPointsInRect.
        // May need another function such as loader.supportsPointInRect() true/false.
        loadPointsInRect: this.loadPointsInRect.bind(this)
      },
      null,
      coordinationValues,
    );
  }
}
