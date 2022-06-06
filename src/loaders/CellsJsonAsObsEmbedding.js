import cellsSchema from '../schemas/cells.schema.json';
import JsonLoader from './JsonLoader';
import { AbstractLoaderError } from './errors';
import LoaderResult from './LoaderResult';

export default class CellsJsonAsObsEmbeddingLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = cellsSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { embeddingType } = this.coordinationValues;
    const { data, url } = payload;
    const obsEmbeddingX = Object.values(data).map(cellObj => cellObj.mappings[embeddingType][0]);
    const obsEmbeddingY = Object.values(data).map(cellObj => cellObj.mappings[embeddingType][1]);
    return Promise.resolve(new LoaderResult([obsEmbeddingX, obsEmbeddingY], url));
  }
}
