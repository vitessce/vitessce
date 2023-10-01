import type { ObsEmbeddingData } from '@vitessce/types';
import type { z, obsEmbeddingCsvSchema } from '@vitessce/schemas';
import CsvLoader from './CsvLoader.js';

export default class ObsEmbeddingCsvLoader extends CsvLoader<
  ObsEmbeddingData, z.infer<typeof obsEmbeddingCsvSchema>
> {
  cachedResult: ObsEmbeddingData | undefined;

  async loadFromCache() {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    if (!this.options) throw new Error('options not defined');
    const { obsIndex: indexCol, obsEmbedding: [xCol, yCol] } = this.options;
    const data = await this.dataSource.getData();
    const obsIndex = data.map((d: { [key: string]: any }) => String(d[indexCol]));
    const obsEmbeddingX = Float32Array.from(data.map((d: { [key: string]: any }) => d[xCol]));
    const obsEmbeddingY = Float32Array.from(data.map((d: { [key: string]: any }) => d[yCol]));
    const obsEmbedding = {
      data: [obsEmbeddingX, obsEmbeddingY],
      shape: [2, obsEmbeddingX.length],
    };
    this.cachedResult = { obsIndex, obsEmbedding };
    return this.cachedResult;
  }
}
