import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/abstract';
import { DEFAULT_CELLS_LAYER } from '@vitessce/constants-internal';
import { CoordinationLevel as CL } from '@vitessce/config';


/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsSegmentationsAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise} A promise for an array of columns.
   */
  async loadSegmentations() {
    const { path } = this.options;
    if (this.segmentations) {
      return this.segmentations;
    }
    if (!this.segmentations) {
      const arr = await this.dataSource.loadNumeric(path);
      // Zarrita returns a strided array; here
      // we convert it to a nested array of polygons and polygon vertices.
      // TODO: use the strided format directly, since more efficient
      // to pass to DeckGL.
      const { stride, shape, data } = arr;
      const result = [];
      let i = 0;
      for (let polyI = 0; polyI < shape[0]; polyI++) {
        const poly = [];
        for (let vertexI = 0; vertexI < shape[1]; vertexI++) {
          i = polyI * stride[0] + vertexI * stride[1];
          poly.push([data[i], data[i + 1]]);
        }
        result.push(poly);
      }
      this.segmentations = {
        ...arr,
        // Bug introduced from DeckGL v8.6.x to v8.8.x:
        // Polygon vertices cannot be passed via Uint32Arrays, which is how they load via Zarr.
        // For now, a workaround is to cast each vertex to a plain Array.
        data: result,
      };
      return this.segmentations;
    }
    this.segmentations = Promise.resolve(null);
    return this.segmentations;
  }

  async load() {
    const { path } = this.options;
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }

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
      // Old
      spatialSegmentationLayer: DEFAULT_CELLS_LAYER,
      // New
      // spatialTargetZ: imageWrapper.getDefaultTargetZ(),
      // spatialTargetT: imageWrapper.getDefaultTargetT(),
      segmentationLayer: CL([
        {
          fileUid: this.coordinationValues?.fileUid || null,
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          segmentationChannel: CL(channelCoordination),
        },
      ]),
    };

    return Promise.all([
      this.dataSource.loadObsIndex(path),
      this.loadSegmentations(),
    ]).then(([obsIndex, obsSegmentations]) => Promise.resolve(new LoaderResult(
      {
        obsIndex,
        obsSegmentations,
        obsSegmentationsType: 'polygon',
      },
      null,
      coordinationValues,
    )));
  }
}
