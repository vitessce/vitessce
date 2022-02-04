import JsonLoader from './JsonLoader';
import { AbstractLoaderError } from './errors';
import LoaderResult from './LoaderResult';

export default class MoleculesJsonLoader extends JsonLoader {
  async load() {
    const { url } = this;
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data: moleculeTypes } = payload;

    const molecules = {};

    Object.entries(moleculeTypes).forEach(([moleculeType, moleculeCoords], i) => {
      moleculeCoords.forEach((moleculeCoord, j) => {
        molecules[`${moleculeType}__${i}__${j}`] = {
          spatial: moleculeCoord,
          geneIndex: i,
        };
      });
    });

    return Promise.resolve(new LoaderResult(
      molecules,
      url,
    ));
  }
}
