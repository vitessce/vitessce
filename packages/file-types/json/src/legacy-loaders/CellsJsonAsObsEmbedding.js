import { AbstractLoaderError, LoaderResult } from '@vitessce/abstract';
import { cellsSchema } from './schemas/cells.js';
import JsonLoader from '../json-loaders/JsonLoader.js';

export default class CellsJsonAsObsEmbeddingLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = cellsSchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { embeddingType } = this.coordinationValues;
    const cellObjs = Object.values(data);
    if (cellObjs.length > 0 && (
      !cellObjs[0].mappings
      || !Array.isArray(cellObjs[0].mappings[embeddingType])
    )) {
      // The cells file does not contain this embedding.
      this.cachedResult = null;
    } else {
      const obsIndex = Object.keys(data);
      const obsEmbeddingX = Float32Array.from(
        cellObjs.map(cellObj => cellObj.mappings[embeddingType][0]),
      );
      const obsEmbeddingY = Float32Array.from(
        cellObjs.map(cellObj => cellObj.mappings[embeddingType][1]),
      );
      const obsEmbedding = {
        data: [obsEmbeddingX, obsEmbeddingY],
        shape: [2, obsEmbeddingX.length],
      };
      this.cachedResult = { obsIndex, obsEmbedding };
    }
    return this.cachedResult;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const result = this.loadFromCache(data);
    return Promise.resolve(new LoaderResult(
      result,
      url,
    ));
  }
}
