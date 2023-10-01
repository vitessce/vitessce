import type { ObsSpotsData } from '@vitessce/types';
import type { z, obsSpotsCsvSchema } from '@vitessce/schemas';
import CsvLoader from './CsvLoader.js';

export default class ObsSpotsCsvLoader extends CsvLoader<ObsSpotsData, z.infer<typeof obsSpotsCsvSchema>> {
  cachedResult: ObsSpotsData | undefined;

  async loadFromCache() {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    if (!this.options) throw new Error('options not defined');
    const { obsIndex: indexCol, obsSpots: [xCol, yCol] } = this.options;
    const data = await this.dataSource.getData();
    const obsIndex = data.map((d: { [key: string]: any }) => String(d[indexCol]));
    const obsLocationsX = Float32Array.from(data.map((d: { [key: string]: any }) => d[xCol]));
    const obsLocationsY = Float32Array.from(data.map((d: { [key: string]: any }) => d[yCol]));
    const obsSpots = {
      data: [obsLocationsX, obsLocationsY],
      shape: [2, obsLocationsX.length],
    };
    this.cachedResult = { obsIndex, obsSpots };
    return this.cachedResult;
  }
}
