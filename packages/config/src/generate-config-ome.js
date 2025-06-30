import { AbstractAutoConfig } from "./generate-config-helpers.js";

export class OmeZarrAutoConfig extends AbstractAutoConfig {
  addFiles(vc, dataset) {
    const { url, fileType } = this;
    dataset.addFile({
      url,
      fileType,
      // TODO: options?
      // TODO: coordination values?
    });
  }

  addViews(vc, layoutOption) {
    // TODO
  }
}

export class OmeTiffAutoConfig extends AbstractAutoConfig {
  addFiles(vc, dataset) {
    const { url, fileType } = this;
    dataset.addFile({
      url,
      fileType,
      // TODO: options?
      // TODO: coordination values?
    });
  }

  addViews(vc, layoutOption) {
    // TODO
  }
}

