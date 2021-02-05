import BaseAnnDataLoader from './BaseAnnDataLoader';

/**
 * Loader for converting zarr into the cell json schema.
 */
export default class CellsZarrLoader extends BaseAnnDataLoader {
  /**
   * Class method for loading spatial cell centroids.
   * @returns {Promise} A promise for an array of tuples/triples for cell centroids.
   */
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

  /**
   * Class method for loading spatial cell polygons.
   * @returns {Promise} A promise for an array of arrays for cell polygons.
   */
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

  /**
   * Class method for loading various mappings, like UMAP or tSNE cooridnates.
   * @returns {Promise} A promise for an array of tuples of coordinates.
   */
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

  /**
   * Class method for loading factors, which are cell set ids.
   * @returns {Promise} A promise for an array of an array of strings of ids,
   * where subarray is a clustering/factor.
   */
  loadFactors() {
    const {
      options: { factors },
    } = this;
    if (factors) {
      return this.loadCellSetIds(factors);
    }
    return Promise.resolve(null);
  }

  async load() {
    const [mappings, xy, poly, cellNames, factors] = await Promise.all([
      this.loadMappings(),
      this.loadXy(),
      this.loadPoly(),
      this.loadCellNames(),
      this.loadFactors(),
    ]);
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
      if (factors) {
        const factorsObj = {};
        factors.forEach(
          // eslint-disable-next-line no-return-assign
          (factor, j) => (factorsObj[this.options.factors[j].split('/').slice(-1)] = factor[i]),
        );
        cells[name].factors = factorsObj;
      }
    });
    return Promise.resolve({ data: cells, url: null });
  }
}
