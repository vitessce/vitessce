// @ts-check

/**
 * @template {any} LoaderDataType
 */
export default class LoaderResult {
  /**
   * @param {LoaderDataType} data
   * @param {object[]|string|null} url Single URL or array of { url, name } objects.
   * @param {object|null} coordinationValues
   * @param {RequestInit|null} requestInit
   */
  constructor(data, url, coordinationValues = null, requestInit = null) {
    this.data = data;
    this.url = url;
    this.coordinationValues = coordinationValues;
    this.requestInit = requestInit;
  }
}
