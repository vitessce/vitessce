import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/abstract';
import { isEqual } from 'lodash-es';
import { CoordinationLevel as CL } from '@vitessce/config';
import {
  normalizeCoordinateTransformations,
  coordinateTransformationsToMatrix,
  normalizeAxes,
} from '@vitessce/spatial-utils';
import { math } from '@vitessce/gl';

function getIndexPath(path) {
  // TODO: find the index column from the parquet pandas metadata?
  return `${path}/__null_dask_index__`;
}


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

    // We convert the axes to objects for compatibility with the
    // coordinateTransformationsToMatrix function.
    const normAxes = normalizeAxes(axes);

    // TODO: create a full tree
    // of coordinate transformations, and traverse the tree from
    // the node corresponding to the output coordinate system of interest
    // back to the root node, applying each transformation along the way.
    const coordinateTransformationsFromFile = (
      coordinateTransformations
    ).filter(({ input: { name: inputName }, output: { name: outputName } }) => (
      inputName === 'xyz' && outputName === coordinateSystem
    ));

    // This new spec is very flexible,
    // so here we will attempt to convert it back to the old spec.
    // TODO: do the reverse, convert old spec to new spec
    const normCoordinateTransformationsFromFile = normalizeCoordinateTransformations(
      coordinateTransformationsFromFile, null,
    );
    const transformMatrixFromFile = coordinateTransformationsToMatrix(
      normCoordinateTransformationsFromFile, normAxes,
    );
    this.modelMatrix = transformMatrixFromFile;
    return this.modelMatrix;
  }

  /**
     * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
     * @returns {Promise} A promise for an array of columns.
     */
  async loadPoints() {
    const { path } = this.options;

    // TODO: if points are XYZ, and in 2D rendering mode, pass in the current Z index and filter (after coordinate transformation?)

    if (this.locations) {
      return this.locations;
    }
    if (!this.locations) {
      const modelMatrix = await this.loadModelMatrix();

      let locations;
      const formatVersion = await this.dataSource.getPointsFormatVersion(path);
      if (formatVersion === '0.1') {
        locations = await this.dataSource.loadPoints(path);
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

  async loadObsIndex() {
    // TODO: remove this function and just use the one from the dataSource?
    // But why is the index column name always different?...

    const { path } = this.options;
    // TODO: will the label column of the parquet table always be numeric?
    const arr = await this.dataSource.loadNumeric(getIndexPath(path));
    const obsIds = Array.from(arr.data).map(i => String(i));
    return obsIds;
  }

  async load() {
    return Promise.all([
      this.loadObsIndex(),
      this.loadPoints(),
    ]).then(([obsIndex, obsPoints]) => {
      // TODO: get the genes / point-types here? May require changing the obsPoints format (breaking change?)

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

      return Promise.resolve(new LoaderResult(
        { obsIndex, obsPoints },
        null,
        coordinationValues,
      ));
    });
  }
}
