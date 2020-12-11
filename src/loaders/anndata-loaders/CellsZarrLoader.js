import BaseCellsZarrLoader from './BaseCellsZarrLoader';

export default class CellsZarrLoader extends BaseCellsZarrLoader {
  loadXy() {
    const {
      options: { xy },
    } = this;
    if (this.xy) {
      return this.xy;
    }
    if (!this.xy && xy) {
      this.xy = this.loadNumeric(xy);
      return this.xy;
    }
    this.xy = Promise.resolve(null);
    return this.xy;
  }

  loadPoly() {
    const {
      options: { poly },
    } = this;
    if (this.poly) {
      return this.poly;
    }
    if (!this.poly && poly) {
      this.poly = this.loadNumeric(poly);
      return this.poly;
    }
    this.poly = Promise.resolve(null);
    return this.poly;
  }

  loadMappings() {
    const {
      options: { mappings },
    } = this;
    if (this.mappings) {
      return this.mappings;
    }
    if (!this.mappings && mappings) {
      this.mappings = Promise.all(
        Object.keys(mappings).map(async (coordinationName) => {
          const { key } = mappings[coordinationName];
          return { coordinationName, arr: await this.loadNumeric(key) };
        }),
      );
      return this.mappings;
    }
    this.mappings = Promise.resolve(null);
    return this.mappings;
  }

  async load() {
    const [mappings, xy, poly, cellNames] = await Promise.all(
      [this.loadMappings(), this.loadXy(), this.loadPoly(), this.loadCellNames()],
    );
    const cells = {};
    cellNames.forEach((name, i) => {
      cells[name] = {};
      if (mappings) {
        mappings.forEach(({ coordinationName, arr }) => {
          if (!cells[name].mappings) {
            cells[name].mappings = {};
          }
          const { dims } = this.options.mappings[coordinationName];
          cells[name].mappings[coordinationName] = dims.map(
            dim => arr.data[i][dim],
          );
        });
      }
      if (xy) {
        cells[name].xy = xy.data[i];
      }
      if (poly) {
        cells[name].poly = poly.data[i];
      }
    });
    return Promise.resolve({ data: cells, url: null });
  }
}
