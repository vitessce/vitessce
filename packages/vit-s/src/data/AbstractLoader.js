// @ts-check
import LoaderResult from './LoaderResult.js';

/** @import { LoaderParams } from '@vitessce/types' */

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class AbstractLoader {
  /**
   *
   * @param {LoaderParams} params
   */
  constructor({
    type,
    fileType,
    url,
    requestInit,
    options,
    coordinationValues,
  }) {
    this.fileType = fileType;
    this.type = type;
    this.url = url;
    this.requestInit = requestInit;
    this.options = options;
    this.coordinationValues = coordinationValues;
  }

  /**
   *
   * @returns {Promise<LoaderResult<any>>}
   */
  // eslint-disable-next-line class-methods-use-this
  async load() {
    return Promise.resolve(
      new LoaderResult(true, null),
    );
  }
}
