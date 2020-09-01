import Ajv from 'ajv';
import AbstractLoader from './AbstractLoader';
import { LoaderFetchError, LoaderValidationError, AbstractLoaderError } from './errors/index';

import cellsSchema from '../schemas/cells.schema.json';
import moleculesSchema from '../schemas/molecules.schema.json';
import neighborhoodsSchema from '../schemas/neighborhoods.schema.json';
import rasterSchema from '../schemas/raster.schema.json';
import cellSetsSchema from '../schemas/cell-sets.schema.json';

const typeToSchema = {
  cells: cellsSchema,
  molecules: moleculesSchema,
  neighborhoods: neighborhoodsSchema,
  raster: rasterSchema,
  'cell-sets': cellSetsSchema,
};

export default class JsonLoader extends AbstractLoader {
  constructor(params) {
    super(params);

    const { type } = params;
    this.schema = typeToSchema[type];
  }

  load() {
    const {
      url, requestInit, type, fileType,
    } = this;
    if (this.data) {
      return this.data;
    }
    this.data = fetch(url, requestInit)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(new LoaderFetchError(type, fileType, url, response.headers));
      })
      .catch(reason => Promise.resolve(reason))
      .then((data) => {
        if (data instanceof AbstractLoaderError) {
          return Promise.reject(data);
        }
        const [valid, reason] = this.validate(data);
        if (valid) {
          return Promise.resolve({ data, url });
        }
        return Promise.reject(new LoaderValidationError(type, fileType, url, reason));
      });
    return this.data;
  }

  validate(data) {
    const { schema, type } = this;
    if (!schema) {
      throw Error(`No schema for ${type}`);
    }
    const validate = new Ajv().compile(schema);
    const valid = validate(data);
    let failureReason;
    if (!valid) {
      failureReason = validate.errors;
    }
    return [valid, failureReason];
  }
}
