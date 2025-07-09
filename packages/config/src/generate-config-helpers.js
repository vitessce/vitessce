/* eslint-disable no-unused-vars */
export class AbstractAutoConfig {
  constructor(parsedStore) {
    const { url, fileType, zmetadata } = parsedStore;
    this.url = url;
    this.fileType = fileType;
    this.zmetadata = zmetadata;
  }

  // eslint-disable-next-line class-methods-use-this
  addFiles(vc, dataset) {
    throw new Error('The addFiles() method has not been implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  addViews(vc, layoutOption) {
    throw new Error('The addViews() method has not been implemented.');
  }
}
