export class AbstractAutoConfig {
  constructor(parsedStore) {
    const { url, fileType, zmetadata } = parsedStore;
    this.url = url;
    this.fileType = fileType;
    this.zmetadata = zmetadata;
  }
  addFiles(vc, dataset) { /* eslint-disable-line class-methods-use-this */
    throw new Error('The addFiles() method has not been implemented.');
  }

  addViews(vc, layoutOption) {
    throw new Error('The addViews() method has not been implemented.');
  }
}