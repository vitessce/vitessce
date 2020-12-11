import { HTTPStore, openArray } from 'zarr';

import AbstractLoader from '../AbstractLoader';

export default class BaseCellsZarrLoader extends AbstractLoader {
  constructor(params) {
    super(params);

    // TODO: Use this.requestInit to provide headers, tokens, etc.
    // eslint-disable-next-line no-unused-vars
    const { url, requestInit } = this;
    this.store = new HTTPStore(url);
  }

  async loadCellSetIds() {
    const { url, options } = this;
    if (this.cellSets) {
      return this.cellSets;
    }
    this.cellSets = Promise.all(
      options.map(async ({ set_name: setName }) => {
        const res = await fetch(
          `${this.url}/${setName.replace('.', '/')}/.zattrs`,
        );
        const { categories } = await res.json();
        const categoriesValuesArr = await openArray({
          store: `${url}/obs/${categories}`,
          mode: 'r',
        });
        const categoriesBuffer = await categoriesValuesArr.compressor.decode(
          new Uint8Array(await categoriesValuesArr.store.getItem('0')),
        );
        const categoriesValues = new TextDecoder()
          .decode(categoriesBuffer)
          // eslint-disable-next-line no-control-regex
          .replace(/[\u0000-\u001c]/g, ',')
          .split(',')
          .filter(Boolean);
        /* eslint-disable */
        console.log(categoriesValues); // eslint-disable-line
        const cellSetsArr = await openArray({
          store: `${url}/${setName.replace(".", "/")}`,
          mode: "r",
        });
        const cellSetsValues = await cellSetsArr.get();
        const { data } = cellSetsValues;
        const mappedCellSetValues = new Array(...data).map(
          (i) => categoriesValues[i]
        );
        return mappedCellSetValues;
      })
    );
    return this.cellSets;
  }

  loadNumeric(path) {
    const { store } = this;
    return openArray({
      store,
      path: path.replace("obsm.", "obsm.X_").replace(".", "/"),
      mode: "r",
    }).then(
      (arr) =>
        new Promise((resolve) => {
          arr.get().then(resolve);
        })
    );
  }

  async loadCellNames() {
    if (this.cellNames) {
      return this.cellNames;
    }
    const res = await fetch(`${this.url}/obs/.zattrs`);
    const { _index } = await res.json();
    this.cellNames = openArray({
      store: `${this.url}/obs/${_index}`,
      mode: "r",
    }).then((z) =>
      z.store
        .getItem("0")
        .then((buf) => new Uint8Array(buf))
        .then((cbytes) => z.compressor.decode(cbytes))
        // eslint-disable-next-line no-control-regex
        .then((dbytes) =>
          new TextDecoder()
            .decode(dbytes)
            .replace(/[\u0000-\u001c]/g, ",")
            .split(",")
            .filter(Boolean)
            .filter((i) => !Number(i))
            .filter((i) => i.length > 2)
        )
    );
    return this.cellNames;
  }

  async loadGeneNames() {
    if (this.geneNames) {
      return this.geneNames;
    }
    const res = await fetch(`${this.url}/var/.zattrs`);
    const { _index } = await res.json();
    this.geneNames = openArray({
      store: `${this.url}/var/${_index}`,
      mode: "r",
    }).then((z) =>
      z.store
        .getItem("0")
        .then((buf) => new Uint8Array(buf))
        .then((cbytes) => z.compressor.decode(cbytes))
        // eslint-disable-next-line no-control-regex
        .then((dbytes) =>
          new TextDecoder()
            .decode(dbytes)
            .replace(/[\u0000-\u001c]/g, ",")
            .split(",")
            .filter(Boolean)
            .filter((i) => !Number(i))
            .filter((i) => i.length > 2)
        )
    );
    return this.geneNames;
  }
}
