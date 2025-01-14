import { AbstractLoaderError, LoaderResult } from '@vitessce/abstract';
import { CoordinationLevel as CL } from '@vitessce/config';
import JsonLoader from './JsonLoader.js';

export default class ObsSegmentationsJsonLoader extends JsonLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const obsIndex = Object.keys(data);
    const obsPolygons = Object.values(data);
    const obsSegmentations = {
      data: obsPolygons,
      shape: [obsPolygons.length, obsPolygons[0].length],
    };
    this.cachedResult = { obsIndex, obsSegmentations, obsSegmentationsType: 'polygon' };
    return this.cachedResult;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
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

    const { data, url } = payload;
    const result = this.loadFromCache(data);
    return Promise.resolve(new LoaderResult(
      result,
      url,
      coordinationValues,
    ));
  }
}
