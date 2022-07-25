import Ajv from 'ajv';
import { OptionsValidationError } from './errors';
import { emptySchema } from '../app/file-options-schemas';

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class AbstractLoader {
  constructor({
    type, fileType,
    url, requestInit,
    options, coordinationValues,
  }) {
    this.fileType = fileType;
    this.type = type;
    this.url = url;
    this.requestInit = requestInit;
    this.options = options;
    this.coordinationValues = coordinationValues;
    this.optionsSchema = emptySchema;
  }

  validateOptions() {
    const { optionsSchema, options } = this;
    const validate = new Ajv().compile(optionsSchema);
    const valid = validate(options || null);
    if (!valid) {
      return [false, validate.errors];
    }
    return [true, null];
  }

  load() {
    const {
      fileType, url, options,
    } = this;
    const [optionsAreValid, optionsFailureReason] = this.validateOptions();
    if (!optionsAreValid) {
      return Promise.reject(
        new OptionsValidationError(fileType, url, options, optionsFailureReason),
      );
    }
    return Promise.resolve(optionsAreValid);
  }
}
