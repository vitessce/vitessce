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
    return this.loadAttrs()
      .then(attrs => Promise.resolve(new LoaderResult(
        attrs,
        url,
        null,
        requestInit,
      )));
  }
}
