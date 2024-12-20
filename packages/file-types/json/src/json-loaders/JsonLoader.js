import { FileType } from '@vitessce/constants-internal';
import {
  AbstractTwoStepLoader,
  LoaderValidationError,
  AbstractLoaderError,
  LoaderResult,
} from '@vitessce/abstract';

import { obsSetsSchema, rasterJsonSchema as rasterSchema } from '@vitessce/schemas';
import { cellsSchema } from '../legacy-loaders/schemas/cells.js';
import { moleculesSchema } from '../legacy-loaders/schemas/molecules.js';
import { neighborhoodsSchema } from '../legacy-loaders/schemas/neighborhoods.js';

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
    const result = schema.safeParse(data);
    const valid = result.success;
    let failureReason;
    if (!valid) {
      failureReason = result.error.message;
    }
    return [valid, failureReason];
  }
}
