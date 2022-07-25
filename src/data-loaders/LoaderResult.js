

export default class LoaderResult {
  constructor(data, url, coordinationValues = null) {
    this.data = data;
    this.url = url;
    this.coordinationValues = coordinationValues;
  }
}
