import Ajv from 'ajv';
import { FileType } from '@vitessce/constants-internal';
import { AbstractTwoStepLoader, LoaderValidationError, AbstractLoaderError, LoaderResult } from '@vitessce/vit-s';

import cellsSchema from '../../schemas/cells.schema.json';
import moleculesSchema from '../../schemas/molecules.schema.json';
import neighborhoodsSchema from '../../schemas/neighborhoods.schema.json';
import rasterSchema from '../../schemas/raster.schema.json';
import obsSetsSchema from '../../schemas/obsSets.schema.json';

const fileTypeToSchema = {
  [FileType.CELLS_JSON]: cellsSchema,
  [FileType.MOLECULES_JSON]: moleculesSchema,
  [FileType.NEIGHBORHOODS_JSON]: neighborhoodsSchema,
  [FileType.RASTER_JSON]: rasterSchema,
  [FileType.CELL_SETS_JSON]: obsSetsSchema,
};

export default class JsonLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    const { fileType } = params;
    this.schema = fileTypeToSchema[fileType];
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
          return Promise.resolve(new LoaderResult(data, url));
        }
        return Promise.reject(new LoaderValidationError(type, fileType, url, reason));
      });
    return this.data;
  }

  validate(data) {
    const { schema } = this;
    if (!schema) {
      return [true, null];
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
