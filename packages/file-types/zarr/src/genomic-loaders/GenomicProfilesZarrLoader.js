import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class GenomicProfilesZarrLoader extends AbstractTwoStepLoader {
  async loadAttrs() {
    if (this.attrs) {
      return this.attrs;
    }
    this.attrs = await this.dataSource.getJson('.zattrs');
    return this.attrs;
  }

  async load() {
    const { url, requestInit } = this;
    const storeRoot = this.dataSource.getStoreRoot('/');
    const attrs = await this.loadAttrs();
    return new LoaderResult(
      {
        genomicProfiles: {
          storeRoot,
          attrs,
        },
      },
      url,
      null,
      requestInit,
    );
  }
}
