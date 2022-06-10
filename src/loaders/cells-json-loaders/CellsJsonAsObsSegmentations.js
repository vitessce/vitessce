import cellsSchema from '../../schemas/cells.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class CellsJsonAsObsSegmentationsLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = cellsSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const cellObjs = Object.values(data);
    if (cellObjs.length > 0 && !Array.isArray(cellObjs[0].poly)) {
      // This cells.json file does not have segmentations.
      return Promise.resolve(new LoaderResult(null, url));
    }
    const cellPolygons = cellObjs.map(cellObj => cellObj.poly);
    return Promise.resolve(new LoaderResult({
      segmentationType: 'polygon',
      segmentations: cellPolygons,
    }, url));
  }
}
