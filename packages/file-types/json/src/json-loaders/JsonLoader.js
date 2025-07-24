import { FileType } from '@vitessce/constants-internal';
import {
  JsonLoaderValidationError,
} from '@vitessce/error';
import {
  AbstractTwoStepLoader,
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

  async load() {
    const { url } = this;
    if (this.data) {
      return this.data;
    }
    this.data = await this.dataSource.loadJson();
    const [valid, reason] = this.validate(this.data);
    if (valid) {
      return new LoaderResult(this.data, url);
    }
    throw new JsonLoaderValidationError(reason);
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
