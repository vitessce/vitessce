/* eslint-disable no-unused-vars */
import { AbstractAutoConfig } from './generate-config-helpers.js';

// TODO: split into an OME-TIFF and OME-Zarr class if needed.
export class OmeAutoConfig extends AbstractAutoConfig {
  addFiles(vc, dataset) {
    const { url, fileType } = this;
    dataset.addFile({
      url,
      fileType,
      // TODO: options?
      // TODO: coordination values?
    });
  }

  // eslint-disable-next-line class-methods-use-this
  addViews(vc, layoutOption) {
    // TODO
  }
}
