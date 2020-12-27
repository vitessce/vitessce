import { HTTPStore } from 'zarr';
import AbstractLoader from './AbstractLoader';

export default class GenomicProfilesZarrLoader extends AbstractLoader {
  constructor(params) {
    super(params);

    // TODO: Use this.requestInit to provide headers, tokens, etc.
    // eslint-disable-next-line no-unused-vars
    const { url, requestInit } = this;
    this.store = new HTTPStore(url);
  }

  loadAttrs() {
    const { store } = this;
    if (this.attrs) {
      return this.attrs;
    }
    this.attrs = store.getItem('.zattrs')
      .then((bytes) => {
        const decoder = new TextDecoder('utf-8');
        const json = JSON.parse(decoder.decode(bytes));
        return json;
      });
    return this.attrs;
  }

  load() {
    const { url } = this;
    return this.loadAttrs()
      .then(attrs => Promise.resolve({ data: attrs, url }));
  }
}
