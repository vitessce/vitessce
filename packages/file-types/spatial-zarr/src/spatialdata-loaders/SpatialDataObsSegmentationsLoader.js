import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/abstract';
import { log } from '@vitessce/globals';
import { CoordinationLevel as CL } from '@vitessce/config';
import {
  normalizeAxes,
  normalizeCoordinateTransformations,
  coordinateTransformationsToMatrix,
} from '@vitessce/spatial-utils';
import { math } from '@vitessce/gl';

function getGeometryPath(path) {
  return `${path}/geometry`;
}

function getIndexPath(path) {
  return `${path}/label`;
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
export default class SpatialDataObsSegmentationsLoader extends AbstractTwoStepLoader {
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
      zattrs?.coordinateTransformations ?? DEFAULT_COORDINATE_TRANSFORMATIONS
    ).filter(({ input: { name: inputName }, output: { name: outputName } }) => (
      inputName === 'xy' && outputName === coordinateSystem
    ));
    const axes = zattrs?.axes ?? DEFAULT_AXES;
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
  async loadPolygons() {
    const { path } = this.options;

    if (this.locations) {
      return this.locations;
    }
    if (!this.locations) {
      const modelMatrix = await this.loadModelMatrix();
      const { data: polygons } = await this.dataSource.loadPolygonShapes(getGeometryPath(path));

      // Apply transformation matrix to the coordinates
      const transformedCoords = polygons.map((polygon) => {
        return polygon.map((coord) => {
          const transformed = new math.Vector2(coord[0], coord[1])
            .transformAsPoint(modelMatrix);
          return [transformed[0], transformed[1]];
        });
      });

      this.locations = {
        // This is a ragged array, so the second dimension is not fixed
        shape: [polygons.length, null],
        data: transformedCoords,
      };
      
      return this.locations;
    }
    this.locations = Promise.resolve(null);
    return this.locations;
  }

  async loadObsIndex() {
    const { path } = this.options;
    // TODO: will the label column of the parquet table always be numeric?
    const arr = await this.dataSource.loadNumeric(getIndexPath(path));
    const obsIds = arr.data.map(i => String(i));
    return obsIds;
  }

  async load() {
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }

    return Promise.all([
      this.loadObsIndex(),
      this.loadPolygons(),
    ]).then(([obsIndex, obsSegmentations]) => {

      const coordinationValues = {
        segmentationLayer: CL({
          // TODO: more coordination values here?
          
          // obsColorEncoding: 'spatialLayerColor',
          // spatialLayerColor: [255, 255, 255],
          spatialLayerVisible: true,
          spatialLayerOpacity: 1.0,
          // featureValueColormapRange: [0, 1],
          // obsHighlight: null,
          // obsSetColor: null,
          // obsSetSelection: null,
          // additionalObsSets: null,
        }),
      };

      return Promise.resolve(new LoaderResult(
        { obsIndex, obsSegmentations, obsSegmentationsType: 'polygon' },
        null,
        coordinationValues,
      ));
    });
  }
}
