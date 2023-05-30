
export class ImageWrapper {
  constructor(name, channels, metadata, loaderCreator) {
    this.name = name;
    this.channels = channels;
    this.loaderCreator = loaderCreator;
    this.metadata = metadata;
    this.computedMetadata = null;
    this.loader = null;
    this.source = null;
  }

  setLoader(loader) {
    this.loader = loader;
  }

  setSource(source) {
    this.source = source;
  }

  setMetadata(metadata) {
    this.metadata = metadata;
  }

  setComputedMetadata(computedMetadata) {
    this.computedMetadata = computedMetadata;
  }
}
