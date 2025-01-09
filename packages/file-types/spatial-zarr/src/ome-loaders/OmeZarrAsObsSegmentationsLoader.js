import { CoordinationLevel as CL } from '@vitessce/config';
import { LoaderResult } from '@vitessce/abstract';
import OmeZarrLoader from './OmeZarrLoader.js';

export default class OmeZarrAsObsSegmentationsLoader extends OmeZarrLoader {
  async load() {
    const { obsTypesFromChannelNames } = this.options || {};
    const result = await super.load();

    const imageWrapper = result.data.image.instance;
    const channelObjects = imageWrapper.getChannelObjects();
    const channelCoordination = channelObjects.slice(0, 5).map((channelObj, i) => ({
      spatialTargetC: i,
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
      ...(obsTypesFromChannelNames ? { obsType: channelObj.name } : {}),
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

    return Promise.resolve(new LoaderResult(
      {
        obsSegmentationsType: 'bitmask',
        obsSegmentations: result.data.image,
      },
      result.url,
      coordinationValues,
    ));
  }
}
