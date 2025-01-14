import {
  AbstractLoaderError,
} from '@vitessce/abstract';
import { CoordinationLevel as CL } from '@vitessce/config';
import SpatialDataImageLoader from './SpatialDataImageLoader.js';

export default class SpatialDataLabelsLoader extends SpatialDataImageLoader {
  async load() {
    const result = await super.load();
    if (result instanceof AbstractLoaderError) {
      return Promise.reject(result);
    }

    result.data = {
      obsSegmentations: result.data.image,
      obsSegmentationsType: 'bitmask',
    };

    const imageWrapper = result.data.obsSegmentations.instance;
    const channelObjects = imageWrapper.getChannelObjects();
    const channelCoordination = channelObjects.slice(0, 7).map((channelObj, i) => ({
      spatialTargetC: i,
      // obsType: channelObj.name,
      spatialChannelColor: (channelObj.defaultColor || channelObj.autoDefaultColor).slice(0, 3),
      spatialChannelVisible: true,
      spatialChannelOpacity: 1.0,
      spatialChannelWindow: channelObj.defaultWindow || null,
      // featureType: 'feature',
      // featureValueType: 'value',
      obsColorEncoding: 'spatialChannelColor',
      spatialSegmentationFilled: true,
      spatialSegmentationStrokeWidth: 1.0,
      obsHighlight: null,
    }));

    const coordinationValues = {
      spatialTargetZ: imageWrapper.getDefaultTargetZ(),
      spatialTargetT: imageWrapper.getDefaultTargetT(),
      segmentationLayer: CL([
        {
          fileUid: this.coordinationValues?.fileUid || null,
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          segmentationChannel: CL(channelCoordination),
        },
      ]),
    };

    result.coordinationValues = coordinationValues;

    return Promise.resolve(result);
  }
}
