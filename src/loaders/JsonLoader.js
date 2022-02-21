/* eslint-disable */
import Ajv from 'ajv';
import AbstractTwoStepLoader from './AbstractTwoStepLoader';
import { LoaderValidationError, AbstractLoaderError } from './errors/index';
import LoaderResult from './LoaderResult';

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

export default class JsonLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    const { type } = params;
    this.schema = typeToSchema[type];
  }

  load() {
    const {
      url, type, fileType,
    } = this;
    if (this.data) {
      return this.data;
    }
    this.data = this.dataSource.data
      .then((data) => {
        if (data instanceof AbstractLoaderError) {
          return Promise.reject(data);
        }
        const [valid, reason] = this.validate(data);
        if (valid) {
          if (type === 'cells') {
            Object.keys(data).forEach(cellId => {
              Object.keys(data[cellId].mappings).forEach(mapping => {
                data[cellId].mappings[mapping] = [data[cellId].mappings[mapping][0]*100, data[cellId].mappings[mapping][1]*100]
              })
            });
          }
          return Promise.resolve(new LoaderResult(data, url));
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
