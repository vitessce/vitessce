import range from 'lodash/range';
import sum from 'lodash/sum';
import moleculesSchema from '../../schemas/molecules.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class MoleculesJsonAsObsLabelsLoader extends JsonLoader {
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
    const obsIndex = range(sum(Object.values(data).map(v => v.length))).map(i => String(i));
    let obsLabels = [];
    Object.entries(data).forEach(([gene, locations]) => {
      obsLabels = [
        ...obsLabels,
        ...range(locations.length).map(() => gene),
      ];
    });
    return Promise.resolve(new LoaderResult({ obsIndex, obsLabels }, url));
  }
}
