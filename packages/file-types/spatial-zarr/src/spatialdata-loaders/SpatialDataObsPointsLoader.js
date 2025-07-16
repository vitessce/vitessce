import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/abstract';
import { log } from '@vitessce/globals';
import { CoordinationLevel as CL } from '@vitessce/config';
import {
  normalizeCoordinateTransformations,
  coordinateTransformationsToMatrix,
  normalizeAxes,
} from '@vitessce/spatial-utils';
import { math } from '@vitessce/gl';


function getGeometryPath(path) {
  return `${path}/geometry`;
}

function getIndexPath(path) {
  // TODO: find the index column from the parquet pandas metadata?
  return `${path}/__null_dask_index__`;
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
   {
    name: 'z',
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
        {
          name: 'z',
          type: 'space',
          unit: 'unit',
        },
      ],
      name: 'xyz',
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
        {
          name: 'z',
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
export default class SpatialDataObsPointsLoader extends AbstractTwoStepLoader {
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
        version: attrsVersion,
      },
    } = zattrs;
    const hasExpectedAttrs = (encodingType === 'ngff:points' && attrsVersion === '0.1');
    if (!hasExpectedAttrs) {
      throw new AbstractLoaderError(
        'Unexpected values for encoding-type or spatialdata_attrs for SpatialData shapes',
      );
    }
    // Convert the coordinate transformations to a modelMatrix.
    // For attrsVersion === "0.1", we can assume that there is always a
    // coordinate system which maps from the input "xyz" to the specified
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
      inputName === 'xyz' && outputName === coordinateSystem
    ));
    const axes = zattrs?.axes || DEFAULT_AXES;
    const normAxes = normalizeAxes(axes);

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
      const { formatVersion } = await this.dataSource.getEncodingTypeAndFormatVersion(path);
      if (formatVersion === '0.1') {
        locations = await this.dataSource.loadPoints(getGeometryPath(path));
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
    const { path } = this.options;
    // TODO: will the label column of the parquet table always be numeric?
    const arr = await this.dataSource.loadNumeric(getIndexPath(path));
    const obsIds = Array.from(arr.data, String);
    return obsIds;
  }

  async load() {
    const { path, tablePath } = this.options;
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }

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
