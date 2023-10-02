import type { ObsPointsData } from '@vitessce/types';
import type { z, obsPointsCsvSchema } from '@vitessce/schemas';
import CsvLoader from './CsvLoader.js';

export default class ObsPointsCsvLoader extends CsvLoader<
  ObsPointsData, z.infer<typeof obsPointsCsvSchema>
> {
  cachedResult: ObsPointsData | undefined;

  async loadFromCache() {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    if (!this.options) throw new Error('options not defined');
    const { obsIndex: indexCol, obsPoints: [xCol, yCol] } = this.options;
    const data = await this.dataSource.getData();
    const obsIndex = data.map((d: { [key: string]: any }) => String(d[indexCol]));
    const obsLocationsX = Float32Array.from(data.map((d: { [key: string]: any }) => d[xCol]));
    const obsLocationsY = Float32Array.from(data.map((d: { [key: string]: any }) => d[yCol]));
    const obsPoints = {
      data: [obsLocationsX, obsLocationsY],
      shape: [2, obsLocationsX.length],
    };
    this.cachedResult = { obsIndex, obsPoints };
    return this.cachedResult;
  }
}
