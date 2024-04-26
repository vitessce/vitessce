
export default class LoaderResult {
  /**
   * @param {*} data
   * @param {object[]|string|null} url Single URL or array of { url, name } objects.
   * @param {object} coordinationValues
   */
  constructor(data, url, coordinationValues = null) {
    this.data = data;
    this.url = url;
    this.coordinationValues = coordinationValues;
  }
}
