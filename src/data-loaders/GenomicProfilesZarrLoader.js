import AbstractTwoStepLoader from './AbstractTwoStepLoader';
import LoaderResult from './LoaderResult';

export default class GenomicProfilesZarrLoader extends AbstractTwoStepLoader {
  loadAttrs() {
    if (this.attrs) {
      return this.attrs;
    }
    this.attrs = this.dataSource.getJson('.zattrs');
    return this.attrs;
  }

  load() {
    const { url } = this;
    return this.loadAttrs()
      .then(attrs => Promise.resolve(new LoaderResult(attrs, url)));
  }
}
