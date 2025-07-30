import {
  LoaderResult, AbstractTwoStepLoader,
} from '@vitessce/abstract';
import { log } from '@vitessce/globals';
import { CoordinationLevel as CL } from '@vitessce/config';
import {
  coordinateTransformationsToMatrixForSpatialData,
} from '@vitessce/spatial-utils';
import { math } from '@vitessce/gl';
import {
  OLD_SHAPES_DEFAULT_AXES,
  OLD_SHAPES_DEFAULT_COORDINATE_TRANSFORMATIONS
} from './old-defaults.js';

function getCoordsPath(path) {
  return `${path}/coords`;
}

function getRadiusPath(path) {
  return `${path}/radius`;
}

function getGeometryPath(path) {
  return `${path}/geometry`;
}


/**
   * Loader for embedding arrays located in anndata.zarr stores.
   */
export default class SpatialDataObsSpotsLoader extends AbstractTwoStepLoader {
  async loadModelMatrix() {
    const { path, coordinateSystem = 'global' } = this.options;
    if (this.modelMatrix) {
      return this.modelMatrix;
    }
    // Load the transformations from the .zattrs for the shapes
    const zattrs = await this.dataSource.loadSpatialDataElementAttrs(path);

    // Convert the coordinate transformations to a modelMatrix.
    // For attrsVersion === "0.1", we can assume that there is always a
    // coordinate system which maps from the input "xy" to the specified
    // output coordinate system.

    // These should only not-be-present for very old objects
    // (zattrs.spatialdata_attrs.version == "0.1").
    const coordinateTransformations = (
      zattrs?.coordinateTransformations ?? OLD_SHAPES_DEFAULT_COORDINATE_TRANSFORMATIONS
    );
    const axes = zattrs?.axes ?? OLD_SHAPES_DEFAULT_AXES;
    
    this.modelMatrix = coordinateTransformationsToMatrixForSpatialData(
      { axes, coordinateTransformations },
      coordinateSystem,
    );
    return this.modelMatrix;
  }

  /**
     * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
     * @returns {Promise} A promise for an array of columns.
     */
  async loadSpots() {
    const { path } = this.options;

    if (this.locations) {
      return this.locations;
    }
    if (!this.locations) {
      const modelMatrix = await this.loadModelMatrix();

      let locations;
      const formatVersion = await this.dataSource.getShapesFormatVersion(path);
      // TODO: move versioned logic to the dataSource class?
      if (formatVersion === '0.1') {
        locations = await this.dataSource.loadNumericForDims(getCoordsPath(path), [0, 1]);
      } else if (formatVersion === '0.2') {
        locations = await this.dataSource.loadCircleShapes(getGeometryPath(path));
      }
      this.locations = locations;


      // Apply transformation matrix to the coordinates
      // TODO: instead of applying here, pass matrix all the way down to WebGL shader
      // (or DeckGL layer)
      for (let i = 0; i < this.locations.shape[1]; i++) {
        const xCoord = this.locations.data[0][i];
        const yCoord = this.locations.data[1][i];
        const transformed = new math.Vector2(xCoord, yCoord)
          .transformAsPoint(modelMatrix);
        // eslint-disable-next-line prefer-destructuring
        this.locations.data[0][i] = transformed[0];
        // eslint-disable-next-line prefer-destructuring
        this.locations.data[1][i] = transformed[1];
      }
      return this.locations;
    }
    this.locations = Promise.resolve(null);
    return this.locations;
  }

  async loadRadius() {
    const { path } = this.options;
    if (this.radius) {
      return this.radius;
    }
    if (!this.radius) {
      const modelMatrix = await this.loadModelMatrix();
      this.radius = await this.dataSource.loadNumeric(getRadiusPath(path));
      const scaleFactors = modelMatrix.getScale();
      const xScaleFactor = scaleFactors[0];
      const yScaleFactor = scaleFactors[1];
      if (xScaleFactor !== yScaleFactor) {
        log.warn('Using x-axis scale factor for transformation of obsSpots, but x and y scale factors are not equal');
      }
      // Apply the scale factor to the radius column
      for (let i = 0; i < this.radius.shape[0]; i++) {
        this.radius.data[i] *= xScaleFactor;
      }
      return this.radius;
    }
    this.radius = Promise.resolve(null);
    return this.radius;
  }

  async loadObsIndex() {
    const { tablePath, path } = this.options;
    if (tablePath) {
      return this.dataSource.loadObsIndex(tablePath);
    }
    const indexColumn = await this.dataSource.loadShapesIndex(path);
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
    const [obsIndex, obsSpots, obsRadius] = await Promise.all([
      this.loadObsIndex(),
      this.loadSpots(),
      this.loadRadius(),
    ]);
    const spatialSpotRadius = obsRadius?.data?.[0];
    console.log(spatialSpotRadius)

    const coordinationValues = {
      spotLayer: CL({
        obsType: 'spot',
        // obsColorEncoding: 'spatialLayerColor',
        // spatialLayerColor: [255, 255, 255],
        spatialLayerVisible: true,
        spatialLayerOpacity: 1.0,
        spatialSpotRadius,
        // TODO: spatialSpotRadiusUnit: 'µm' or 'um'
        // after resolving https://github.com/vitessce/vitessce/issues/1760
        // featureValueColormapRange: [0, 1],
        // obsHighlight: null,
        // obsSetColor: null,
        // obsSetSelection: null,
        // additionalObsSets: null,
      }),
    };
    return new LoaderResult(
      { obsIndex, obsSpots },
      null,
      coordinationValues,
    );
  }
}
