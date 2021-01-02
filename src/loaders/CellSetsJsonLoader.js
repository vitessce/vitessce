import cellSetsSchema from '../schemas/cell-sets.schema.json';
import JsonLoader from './JsonLoader';
import { tryUpgradeTreeToLatestSchema } from '../components/sets/io';
import { AbstractLoaderError } from './errors';

export default class CellSetsJsonLoader extends JsonLoader {
  constructor(params) {
    super(params);

    this.schema = cellSetsSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data: rawData, url } = payload;
    const upgradedData = tryUpgradeTreeToLatestSchema(rawData, 'cell');
    return Promise.resolve({ data: upgradedData, url });
  }
}
