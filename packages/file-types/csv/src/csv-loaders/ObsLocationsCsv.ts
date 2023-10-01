import type { ObsLocationsData } from '@vitessce/types';
import type { z, obsLocationsCsvSchema } from '@vitessce/schemas';
import CsvLoader from './CsvLoader.js';

export default class ObsLocationsCsvLoader extends CsvLoader<ObsLocationsData, z.infer<typeof obsLocationsCsvSchema>> {

  cachedResult: ObsLocationsData | undefined;

  async loadFromCache() {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    if(!this.options) throw new Error('options not defined');
    const { obsIndex: indexCol, obsLocations: [xCol, yCol] } = this.options;
    const data = await this.dataSource.getData();
    const obsIndex = data.map((d: { [key: string]: any }) => String(d[indexCol]));
    const obsLocationsX = Float32Array.from(data.map((d: { [key: string]: any }) => d[xCol]));
    const obsLocationsY = Float32Array.from(data.map((d: { [key: string]: any }) => d[yCol]));
    const obsLocations = {
      data: [obsLocationsX, obsLocationsY],
      shape: [2, obsLocationsX.length],
    };
    this.cachedResult = { obsIndex, obsLocations };
    return this.cachedResult;
  }
}
