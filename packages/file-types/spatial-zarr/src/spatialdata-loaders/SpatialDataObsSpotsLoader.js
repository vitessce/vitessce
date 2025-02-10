import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/abstract';
import { log } from '@vitessce/globals';
import { CoordinationLevel as CL } from '@vitessce/config';
import {
  normalizeCoordinateTransformations,
  coordinateTransformationsToMatrix,
} from '@vitessce/spatial-utils';
import { math } from '@vitessce/gl';

function getCoordsPath(path) {
  return `${path}/coords`;
}

function getRadiusPath(path) {
  return `${path}/radius`;
}

function getAttrsPath(path) {
  return `${path}/.zattrs`;
}

const DEFAULT_AXES = [
  {
    name: 'x',
    type: 'space',
    unit: 'unit',
  },
  {
    name: 'y',
    type: 'space',
    unit: 'unit',
  },
];
const DEFAULT_COORDINATE_TRANSFORMATIONS = [
  {
    input: {
      axes: [
        {
          name: 'x',
          type: 'space',
          unit: 'unit',
        },
        {
          name: 'y',
          type: 'space',
          unit: 'unit',
        },
      ],
      name: 'xy',
    },
    output: {
      axes: [
        {
          name: 'x',
          type: 'space',
          unit: 'unit',
        },
        {
          name: 'y',
          type: 'space',
          unit: 'unit',
        },
      ],
      name: 'global',
    },
    type: 'identity',
  },
];


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
    const zattrs = await this.dataSource.getJson(getAttrsPath(path));

    const {
      'encoding-type': encodingType,
      spatialdata_attrs: {
        geos = {},
        version: attrsVersion,
      },
    } = zattrs;
    const hasExpectedAttrs = (
      encodingType === 'ngff:shapes'
      && ((geos?.name === 'POINT'
      && geos?.type === 0
      && attrsVersion === '0.1') || attrsVersion === '0.2')
    );
    if (!hasExpectedAttrs) {
      throw new AbstractLoaderError(
        'Unexpected values for encoding-type or spatialdata_attrs for SpatialData shapes',
      );
    }
    // Convert the coordinate transformations to a modelMatrix.
    // For attrsVersion === "0.1", we can assume that there is always a
    // coordinate system which maps from the input "xy" to the specified
    // output coordinate system.

    // TODO: In a future version of the shapes transformation on-disk format,
    // the SpatialData team plans to relax this so that it will
    // become necessary to create a full tree
    // of coordinate transformations, and traverse the tree from
    // the node corresponding to the output coordinate system of interest
    // back to the root node, applying each transformation along the way.
    const coordinateTransformationsFromFile = (
      zattrs?.coordinateTransformations || DEFAULT_COORDINATE_TRANSFORMATIONS
    ).filter(({ input: { name: inputName }, output: { name: outputName } }) => (
      inputName === 'xy' && outputName === coordinateSystem
    ));
    const axes = zattrs?.axes || DEFAULT_AXES;
    // This new spec is very flexible,
    // so here we will attempt to convert it back to the old spec.
    // TODO: do the reverse, convert old spec to new spec
    const normCoordinateTransformationsFromFile = normalizeCoordinateTransformations(
      coordinateTransformationsFromFile, null,
    );
    const transformMatrixFromFile = coordinateTransformationsToMatrix(
      normCoordinateTransformationsFromFile, axes,
    );
    this.modelMatrix = transformMatrixFromFile;
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
      this.locations = await this.dataSource.loadNumericForDims(getCoordsPath(path), [0, 1]);

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

  async load() {
    const { path, tablePath } = this.options;
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }

    return Promise.all([
      this.dataSource.loadObsIndex(getCoordsPath(path), tablePath),
      this.loadSpots(),
      this.loadRadius(),
    ]).then(([obsIndex, obsSpots, obsRadius]) => {
      const spatialSpotRadius = obsRadius?.data?.[0];

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

      return Promise.resolve(new LoaderResult(
        { obsIndex, obsSpots },
        null,
        coordinationValues,
      ));
    });
  }
}
