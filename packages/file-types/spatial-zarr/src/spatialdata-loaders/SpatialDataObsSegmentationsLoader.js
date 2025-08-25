import {
  LoaderResult, AbstractTwoStepLoader,
} from '@vitessce/abstract';
import { CoordinationLevel as CL } from '@vitessce/config';
import {
  coordinateTransformationsToMatrixForSpatialData,
} from '@vitessce/spatial-utils';
import { math } from '@vitessce/gl';
import {
  OLD_SHAPES_DEFAULT_AXES,
  OLD_SHAPES_DEFAULT_COORDINATE_TRANSFORMATIONS,
} from './old-defaults.js';

function getGeometryPath(path) {
  return `${path}/geometry`;
}


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
  async loadPolygons() {
    const { path } = this.options;

    if (this.locations) {
      return this.locations;
    }
    if (!this.locations) {
      const modelMatrix = await this.loadModelMatrix();
      const { data: polygons } = await this.dataSource.loadPolygonShapes(getGeometryPath(path));

      // Apply transformation matrix to the coordinates
      const transformedCoords = polygons.map(polygon => polygon.map((coord) => {
        const transformed = new math.Vector2(coord[0], coord[1])
          .transformAsPoint(modelMatrix);
        return [transformed[0], transformed[1]];
      }));

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
    const [obsIndex, obsSegmentations] = await Promise.all([
      this.loadObsIndex(),
      this.loadPolygons(),
    ]);

    // This matches the logic in packages/file-types/json/src/json-loaders/ObsSegmentationsJson.js.
    const channelCoordination = [{
      // obsType: null,
      spatialChannelColor: [255, 255, 255],
      spatialChannelVisible: true,
      spatialChannelOpacity: 1.0,
      spatialChannelWindow: null,
      // featureType: 'feature',
      // featureValueType: 'value',
      obsColorEncoding: 'spatialChannelColor',
      spatialSegmentationFilled: true,
      spatialSegmentationStrokeWidth: 1.0,
      obsHighlight: null,
    }];

    const coordinationValues = {
      segmentationLayer: CL([
        {
          // TODO: more coordination values here?

          // obsColorEncoding: 'spatialLayerColor',
          // spatialLayerColor: [255, 255, 255],
          fileUid: this.coordinationValues?.fileUid || null,
          spatialLayerVisible: true,
          spatialLayerOpacity: 1.0,
          segmentationChannel: CL(channelCoordination),
          // featureValueColormapRange: [0, 1],
          // obsHighlight: null,
          // obsSetColor: null,
          // obsSetSelection: null,
          // additionalObsSets: null,
        },
      ]),
    };

    return new LoaderResult(
      { obsIndex, obsSegmentations, obsSegmentationsType: 'polygon' },
      null,
      coordinationValues,
    );
  }
}
