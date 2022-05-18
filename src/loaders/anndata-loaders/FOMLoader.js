import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';
import DataSourceFetchError from '../errors/DataSourceFetchError';
import { InternMap } from 'internmap';

const DTYPES = {
  COLUMN_NUMERIC: 'columnNumeric',
  COLUMN_STRING: 'columnString',
  EMBEDDING_NUMERIC: 'embeddingNumeric',
}


/**
 * Loader for converting zarr into the cell json schema.
 */
export default class CellsZarrLoader extends AbstractTwoStepLoader {

  constructor(dataSource, params) {
    super(dataSource, params);

    const { apiRoot } = this.options || {};
    this.anchorApi = `${apiRoot}/anchor`;
    this.modelApi = `${apiRoot}/model_update`;

    this.data = {
      static: {},
      dynamic: {},
      anchors: new InternMap([], JSON.stringify),
      models: new InternMap([], JSON.stringify),
    };
  }
  
  loadByDtype(path, dtype) {
    let result;
    if(dtype === DTYPES.COLUMN_NUMERIC) {
      result = this.dataSource.loadColumnNumeric(path);
    } else if(dtype === DTYPES.COLUMN_STRING) {
      result = this.dataSource.loadColumnString(path);
    } else if(dtype === DTYPES.EMBEDDING_NUMERIC) {
      result = this.dataSource.loadEmbeddingNumeric(path);
    } else {
      console.warn(dtype, "dtype not recognized");
    }
    return result;
  }

  loadStatic(path, dtype) {
    if (this.data.static[path]) {
      return this.data.static[path];
    }
    let result;
    if (!this.data.static[path] && path) {
      result = this.loadByDtype(path, dtype);
    } else {
      result = this.data.static[path] = Promise.resolve(null);
    }
    this.data.static[path] = result;
    return result;
  }

  loadDynamic(path, dtype, iteration) {
    if(!this.data.dynamic[path]) {
      this.data.dynamic[path] = new InternMap([], JSON.stringify);
    }
    if (this.data.dynamic[path].has(iteration)) {
      return this.data.dynamic[path].get(iteration);
    }
    let result;
    if (!this.data.dynamic[path].has(iteration) && path) {
      result = this.loadByDtype(path, dtype);
    } else {
      result = Promise.resolve(null);
    }
    this.data.dynamic[path].set(iteration, result);
    return result;
  }
}
