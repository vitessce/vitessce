import cellsSchema from '../../schemas/cells.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';
import { square } from '../../components/spatial/utils';
import { DEFAULT_CELLS_LAYER } from '../../components/spatial/constants';

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
    const obsIndex = Object.keys(data);
    const cellObjs = Object.values(data);
    if (cellObjs.length > 0 && !Array.isArray(cellObjs[0].poly) && !Array.isArray(cellObjs[0].xy)) {
      // This cells.json file does not have segmentations.
      return Promise.resolve(new LoaderResult(null, url));
    }
    let cellPolygons = [];
    if (!Array.isArray(cellObjs[0].poly) || !cellObjs[0].poly?.length) {
      // This cells.json file has xy positions but not segmentation polygons.
      const radius = 50; // TODO: determine better radius value.
      cellPolygons = cellObjs.map(cellObj => square(cellObj.xy[0], cellObj.xy[1], radius));
    } else {
      cellPolygons = cellObjs.map(cellObj => cellObj.poly);
    }
    const obsSegmentations = {
      data: cellPolygons,
    };
    const coordinationValues = {
      // TODO: do this for anndata segmentation loader
      spatialSegmentationLayer: DEFAULT_CELLS_LAYER,
    };
    return Promise.resolve(new LoaderResult({
      obsIndex,
      obsSegmentationsType: 'polygon',
      obsSegmentations,
    }, url, coordinationValues));
  }
}
