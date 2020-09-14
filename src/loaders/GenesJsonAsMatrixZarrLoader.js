import genesSchema from '../schemas/genes.schema.json';
import JsonLoader from './JsonLoader';
import { AbstractLoaderError } from './errors';

export default class GenesJsonAsMatrixZarrLoader extends JsonLoader {
  constructor(params) {
    super(params);

    this.schema = genesSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const cols = Object.keys(data);
    const rows = (cols.length > 0 ? Object.keys(data[cols[0]].cells) : []);
    const attrs = { rows, cols };

    const normalizedFlatMatrix = rows
      .flatMap(cellId => cols.map(
        geneId => (data[geneId].cells[cellId] / data[geneId].max) * 255,
      ));
    // Need to wrap the NestedArray to mock the HTTPStore-based array
    // which returns promises.
    const arr = { data: Uint8Array.from(normalizedFlatMatrix) };
    return Promise.resolve({ data: [attrs, arr], url });
  }
}
