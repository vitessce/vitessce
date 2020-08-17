/* eslint-disable */
import cellSetsSchema from '../schemas/cell-sets.schema.json';
import JsonLoader from './JsonLoader';
import { initializeSets } from '../components/sets/reducer';
import { tryUpgradeTreeToLatestSchema } from '../components/sets/io';
import { AbstractLoaderError } from './errors';

export default class CellSetsJsonLoader extends JsonLoader {
  constructor(params) {
    super(params);

    this.schema = cellSetsSchema;
  }

  async load() {
    const payload = await super.load().catch((reason) => Promise.resolve(reason));
    if(payload instanceof AbstractLoaderError) {
        return Promise.reject(payload);
    }
    const { data: rawData, url } = payload;
    const upgradedData = tryUpgradeTreeToLatestSchema(rawData, 'cell');
    // Because sets require unique IDs before they can be referenced in other components,
    // it is nice to do that here so that all components keep these IDs in sync.
    const processedData = initializeSets(upgradedData);
    return Promise.resolve({ data: processedData, url });
  }
}
