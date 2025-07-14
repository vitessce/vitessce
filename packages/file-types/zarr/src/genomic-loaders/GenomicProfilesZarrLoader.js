import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class GenomicProfilesZarrLoader extends AbstractTwoStepLoader {
  loadAttrs() {
    if (this.attrs) {
      return this.attrs;
    }
    this.attrs = this.dataSource.getJson('.zattrs');
    return this.attrs;
  }

  load() {
    const { url, requestInit } = this;
    const storeRoot = this.dataSource.getStoreRoot('/');
    return this.loadAttrs()
      .then(attrs => Promise.resolve(new LoaderResult(
        {
          genomicProfiles: {
            storeRoot,
            attrs,
          },
        },
        url,
        null,
        requestInit,
      )));
  }
}
