import { NestedArray } from 'zarr';
import genesSchema from '../schemas/genes.schema.json';
import JsonLoader from './JsonLoader';

export default class GenesJsonAsMatrixZarrLoader extends JsonLoader {
  constructor(params) {
    super(params);

    this.schema = genesSchema;
  }

  load() {
    const jsonPromise = super.load();

    return new Promise((resolve, reject) => {
      jsonPromise.then((data) => {
        const cols = Object.keys(data);
        const rows = (cols.length > 0 ? Object.keys(data[cols[0]].cells) : []);
        const attrs = { rows, cols };
        const shape = [rows.length, cols.length];

        const normalizedFlatMatrix = rows
          .flatMap(cellId => cols.map(
            geneId => (data[geneId].cells[cellId] / data[geneId].max) * 255,
          ));

        const typedNormalizedFlatMatrix = Uint8Array.from(normalizedFlatMatrix);
        const arr = new NestedArray(typedNormalizedFlatMatrix, shape);
        // Need to wrap the NestedArray to mock the HTTPStore-based array
        // which returns promises.
        const arrWrapper = {
          get: (...args) => Promise.resolve(arr.get(...args)),
          getRaw: () => Promise.resolve({ data: typedNormalizedFlatMatrix }),
        };
        resolve([attrs, arrWrapper]);
      }).catch((reason) => {
        reject(reason);
      });
    });
  }
}
