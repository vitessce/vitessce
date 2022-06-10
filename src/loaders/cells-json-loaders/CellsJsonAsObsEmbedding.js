import cellsSchema from '../../schemas/cells.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

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
    const cellObjs = Object.values(data);
    if (cellObjs.length > 0 && (
      !cellObjs[0].mappings
      || !Array.isArray(cellObjs[0].mappings[embeddingType])
    )) {
      // The cells file does not contain this embedding.
      return Promise.resolve(new LoaderResult(null, url));
    }
    const obsEmbeddingX = cellObjs.map(cellObj => cellObj.mappings[embeddingType][0]);
    const obsEmbeddingY = cellObjs.map(cellObj => cellObj.mappings[embeddingType][1]);
    return Promise.resolve(new LoaderResult([obsEmbeddingX, obsEmbeddingY], url));
  }
}
