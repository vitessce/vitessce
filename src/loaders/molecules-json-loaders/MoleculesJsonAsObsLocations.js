import range from 'lodash/range';
import sum from 'lodash/sum';
import moleculesSchema from '../../schemas/molecules.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class MoleculesJsonAsObsLocationsLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = moleculesSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const moleculesValues = Object.values(data);
    const obsIndex = range(sum(moleculesValues.map(v => v.length))).map(i => String(i));
    let obsLocationsX = [];
    let obsLocationsY = [];
    moleculesValues.forEach((locations) => {
      obsLocationsX = [
        ...obsLocationsX,
        ...locations.map(l => l[0]),
      ];
      obsLocationsY = [
        ...obsLocationsY,
        ...locations.map(l => l[1]),
      ];
    });
    const obsLocations = {
      data: [obsLocationsX, obsLocationsY],
      shape: [2, obsLocationsX.length],
    };
    return Promise.resolve(new LoaderResult({ obsIndex, obsLocations }, url));
  }
}
