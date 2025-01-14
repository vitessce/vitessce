import { CoordinationLevel as CL } from '@vitessce/config';
import { AbstractLoaderError, LoaderResult } from '@vitessce/abstract';
import CsvLoader from './CsvLoader.js';

export default class ObsSpotsCsvLoader extends CsvLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsIndex: indexCol, obsSpots: [xCol, yCol] } = this.options;
    const obsIndex = data.map(d => String(d[indexCol]));
    const obsLocationsX = Float32Array.from(data.map(d => d[xCol]));
    const obsLocationsY = Float32Array.from(data.map(d => d[yCol]));
    const obsSpots = {
      data: [obsLocationsX, obsLocationsY],
      shape: [2, obsLocationsX.length],
    };
    this.cachedResult = { obsIndex, obsSpots };
    return this.cachedResult;
  }

  async load() {
    const payload = await this.getSourceData().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }

    const coordinationValues = {
      spotLayer: CL({
        obsType: 'spot',
        // obsColorEncoding: 'spatialLayerColor',
        // spatialLayerColor: [255, 255, 255],
        spatialLayerVisible: true,
        spatialLayerOpacity: 1.0,
        spatialSpotRadius: 10.0,
        // TODO: spatialSpotRadiusUnit: 'µm' or 'um'
        // after resolving https://github.com/vitessce/vitessce/issues/1760
        // featureValueColormapRange: [0, 1],
        // obsHighlight: null,
        // obsSetColor: null,
        // obsSetSelection: null,
        // additionalObsSets: null,
      }),
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
