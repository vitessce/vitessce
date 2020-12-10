import BaseCellsZarrLoader from './BaseCellsZarrLoader';

export default class CellsZarrLoader extends BaseCellsZarrLoader {
  async load() {
    const {
      options: { xy, poly, mappings },
    } = this;
    if (!this.cellNames) {
      this.cellNames = await this.loadCellNames();
    }
    if (!this.xy && xy) {
      this.xy = await this.loadNumeric(xy);
    }
    if (!this.poly && poly) {
      this.poly = await this.loadNumeric(poly);
    }
    if (!this.mappings && mappings) {
      this.mappings = await Promise.all(Object.keys(mappings).map(async (coordinationName) => {
        const { key } = mappings[coordinationName];
        return { coordinationName, arr: await this.loadNumeric(key) };
      }));
    }
    const cells = {};
    this.cellNames.forEach((name, i) => {
      cells[name] = {};
      if (this.mappings) {
        this.mappings.forEach(({ coordinationName, arr }) => {
          if (!cells[name].mappings) {
            cells[name].mappings = {};
          }
          const { dims } = mappings[coordinationName];
          cells[name].mappings[coordinationName] = dims.map(
            dim => arr.data[i][dim],
          );
        });
      }
      if (this.xy) {
        cells[name].xy = this.xy.data[i];
      }
      if (this.poly) {
        cells[name].poly = this.poly.data[i];
      }
    });
    return { data: cells, url: null };
  }
}
