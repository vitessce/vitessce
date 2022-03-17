/* eslint-disable */
import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';
import DataSourceFetchError from '../errors/DataSourceFetchError';
import { InternMap } from 'internmap';

const EMBEDDING_SCALE_FACTOR = 5000;

const DTYPES = {
  COLUMN_NUMERIC: 'columnNumeric',
  COLUMN_STRING: 'columnString',
  EMBEDDING_NUMERIC: 'embeddingNumeric',
}

const HEADERS = {
  'Content-Type': 'application/json',
};

// Reference: https://github.com/github/fetch/issues/175#issuecomment-125779262
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests#example_using_a_timeout
function fetchLong(url, timeout) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = timeout; // time in milliseconds

    xhr.onload = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve({ status: xhr.responseText });
        } else {
          reject(xhr.statusText);
        }
      }
    };

    xhr.ontimeout = () => {
      reject("The request for " + url + " timed out.");
    };

    xhr.send(null);
  });
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

  anchorGetNoCache() {
    const { anchorApi } = this;
    const data = fetch(anchorApi, { method: 'GET' }).then((response) => {
      if (!response.ok) {
        return Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, response.headers));
      }
      return response.json();
    // eslint-disable-next-line no-console
    }).catch(() => Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, {})));
    return data;
  }

  modelGetNoCache() {
    const { modelApi } = this;
    const data = fetchLong(modelApi, 600000).catch((e) => {
      console.error(e);
      Promise.reject(new DataSourceFetchError('CellsZarrLoader', modelApi, {}));
    });
    return data;
  }

  anchorGet(iteration) {
    if (this.data.anchors.has(iteration)) {
      return this.data.anchors.get(iteration);
    }
    let result;
    if (!this.data.anchors.has(iteration)) {
      result = this.anchorGetNoCache();
    } else {
      result = Promise.resolve(null);
    }
    this.data.anchors.set(iteration, result);
    return result;
  }

  modelGet(iteration) {
    if (this.data.models.has(iteration)) {
      return this.data.models.get(iteration);
    }
    let result;
    if (!this.data.models.has(iteration)) {
      result = this.modelGetNoCache();
    } else {
      result = Promise.resolve(null);
    }
    this.data.models.set(iteration, result);
    return result;
  }

  /**
   * Confirm an anchor set.
   * @param {string} anchorId 
   * @returns 
   */
  anchorConfirm(anchorId) {
    const { anchorApi } = this;
    const body = {
      operation: 'confirm',
      anchor_id: anchorId,
    };
    const data = fetch(anchorApi, { method: 'PUT', headers: HEADERS, body: JSON.stringify(body) }).then((response) => {
      if (!response.ok) {
        return Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, {}));
      }
      return response.json();
    // eslint-disable-next-line no-console
    }).catch(() => Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, {})));
    return data;
  }

  anchorRefine(anchorId, anchorCells) {
    const { anchorApi } = this;
    const body = {
      operation: 'refine',
      anchor: {
        id: anchorId,
        cells: anchorCells,
      }
    };
    const data = fetch(anchorApi, { method: 'PUT', headers: HEADERS, body: JSON.stringify(body) }).then((response) => {
      if (!response.ok) {
        return Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, response.headers));
      }
      return response.json();
    // eslint-disable-next-line no-console
    }).catch(() => Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, {})));
    return data;
  }

  anchorAdd(anchorId, anchorCells) {
    const { anchorApi } = this;
    const body = {
      operation: 'add',
      anchor: {
        id: anchorId,
        cells: anchorCells,
      }
    };
    const data = fetch(anchorApi, { method: 'PUT', headers: HEADERS, body: JSON.stringify(body) }).then((response) => {
      if (!response.ok) {
        return Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, response.headers));
      }
      return response.json();
    // eslint-disable-next-line no-console
    }).catch(() => Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, {})));
    return data;
  }

  anchorDelete(anchorId) {
    const { anchorApi } = this;
    const body = {
      anchor_id: anchorId,
    };
    const data = fetch(anchorApi, { method: 'DELETE', headers: HEADERS, body: JSON.stringify(body) }).then((response) => {
      if (!response.ok) {
        return Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, response.headers));
      }
      return response.json();
    // eslint-disable-next-line no-console
    }).catch(() => Promise.reject(new DataSourceFetchError('CellsZarrLoader', anchorApi, {})));
    return data;
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

  loadStaticOrDynamic(path, dtype, dynamic, iteration) {
    if(dynamic) {
      return this.loadDynamic(path, dtype, iteration);
    } else {
      return this.loadStatic(path, dtype);
    }
  }

  /**
   * Class method for loading spatial cell centroids.
   * @returns {Promise} A promise for an array of tuples/triples for cell centroids.
   */
  loadExpressionMatrix() {
    const { expressionMatrix } = (this.options || {});
    const path = expressionMatrix.path;
    return this.loadStaticOrDynamic(path, DTYPES.MATRIX_NUMERIC, false, null);
  }

  loadAnchorMatrix(iteration) {
    const { anchorMatrix } = (this.options || {});
    const path = anchorMatrix.path;
    return this.loadStaticOrDynamic(path, DTYPES.MATRIX_NUMERIC, true, iteration);
  }

  loadFeature(key, dynamic, iteration) {
    const { features } = (this.options || {});
    const path = features[key].path;
    return this.loadStaticOrDynamic(path, DTYPES.COLUMN_STRING, dynamic, iteration);
  }

  loadAnchorCluster(iteration) {
    const { features } = (this.options || {});
    const { anchorCluster } = features;
    const path = anchorCluster.path;
    return this.loadStaticOrDynamic(path, DTYPES.COLUMN_NUMERIC, true, iteration);
  }

  loadAnchorDist(iteration) {
    const { features } = (this.options || {});
    const { anchorDist } = features;
    const path = anchorDist.path;
    return this.loadStaticOrDynamic(path, DTYPES.COLUMN_NUMERIC, true, iteration);
  }

  loadEmbedding(key, dynamic, iteration) {
    const { embeddings } = (this.options || {});
    const path = embeddings[key].path;
    return this.loadStaticOrDynamic(path, DTYPES.MATRIX_NUMERIC, dynamic, iteration);
  }
  
  loadDifferentialGenes(iteration) {
    const { differentialGenes } = (this.options || {});
    const { names, scores } = differentialGenes;
    return Promise.all([
      this.loadStaticOrDynamic(names.path, DTYPES.COLUMN_STRING, true, iteration),
      this.loadStaticOrDynamic(scores.path, DTYPES.COLUMN_NUMERIC, true, iteration),
    ]);
  }

  async loadIndices() {
    if (!this.cells) {
      this.indices = Promise.all([
        this.dataSource.loadObsIndex(),
        this.dataSource.loadVarIndex(),
      ]);
    }
    return Promise.resolve(new LoaderResult(await this.indices, null));
  }

  async load() {
    if (!this.cells) {
      this.cells = Promise.all([
        this.dataSource.loadObsIndex(),
      ]).then(([cellNames]) => {
        const cells = {};
        cellNames.forEach((name, i) => {
          cells[name] = {};
        });
        return cells;
      });
    }
    return Promise.resolve(new LoaderResult(await this.cells, null));
  }
}
