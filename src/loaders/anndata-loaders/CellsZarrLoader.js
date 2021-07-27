import AnnDataLoader from './AnnDataLoader';
import LoaderResult from '../LoaderResult';

/**
 * Loader for converting zarr into the cell json schema.
 */
export default class CellsZarrLoader extends AnnDataLoader {
  /**
   * Class method for loading spatial cell centroids.
   * @returns {Promise} A promise for an array of tuples/triples for cell centroids.
   */
  loadXy() {
    const { xy } = (this.options || {});
    if (this.xy) {
      return this.xy;
    }
    if (!this.xy && xy) {
      this.xy = this.dataSource.loadNumeric(xy);
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
    const { poly } = (this.options || {});
    if (this.poly) {
      return this.poly;
    }
    if (!this.poly && poly) {
      this.poly = this.dataSource.loadNumeric(poly);
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
    const { mappings } = (this.options || {});
    if (this.mappings) {
      return this.mappings;
    }
    if (!this.mappings && mappings) {
      this.mappings = Promise.all(
        Object.keys(mappings).map(async (coordinationName) => {
          const { key } = mappings[coordinationName];
          return { coordinationName, arr: await this.dataSource.loadNumeric(key) };
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
    const { factors } = (this.options || {});
    if (factors) {
      return this.dataSource.loadObsVariables(factors);
    }
    return Promise.resolve(null);
  }

  async load() {
    if (!this.cells) {
      this.cells = Promise.all([
        this.loadMappings(),
        this.loadXy(),
        this.loadPoly(),
        this.loadCellNames(),
        this.loadFactors(),
      ]).then(([mappings, xy, poly, cellNames, factors]) => {
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
        return cells;
      });
    }
    return Promise.resolve(new LoaderResult(await this.cells, null));
  }
}
