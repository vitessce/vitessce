import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';
import { dirname } from '../data-sources/utils';

/**
 * Loader for converting zarr into the cell json schema.
 */
export default class CellsZarrLoader extends AbstractTwoStepLoader {
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
      this.xy = [this.dataSource.loadObsIndex(dirname(xy)), this.dataSource.loadNumeric(xy)];
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
      this.poly = [this.dataSource.loadObsIndex(dirname(poly)), this.dataSource.loadNumeric(poly)];
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
          return {
            coordinationName,
            arr: [
              await this.dataSource.loadObsIndex(dirname(key)),
              await this.dataSource.loadNumeric(key),
            ],
          };
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
      return this.dataSource.loadObsColumns(factors);
    }
    return Promise.resolve(null);
  }

  async load() {
    if (!this.cells) {
      this.cells = Promise.all([
        this.dataSource.loadObsIndex(),
        this.loadMappings(),
        this.loadXy(),
        this.loadPoly(),
      ]).then(([cellNames, mappings, xyTuple, polyTuple]) => {
        const cells = {};
        cellNames.forEach((name) => {
          cells[name] = {};
          if (mappings) {
            if (!cells[name].mappings) {
              cells[name].mappings = {};
            }
            mappings.forEach(({ coordinationName, arr: arrTuple }) => {
              const [index, arr] = arrTuple;
              const mappingI = index.indexOf(name);
              if (mappingI >= 0) {
                const { dims } = this.options.mappings[coordinationName];
                cells[name].mappings[coordinationName] = dims.map(
                  dim => arr.data[mappingI][dim],
                );
              }
            });
          }
          if (xyTuple) {
            const [index, xy] = xyTuple;
            const xyI = index.indexOf(name);
            if (xyI >= 0) {
              cells[name].xy = xy.data[xyI];
            }
          }
          if (polyTuple) {
            const [index, poly] = polyTuple;
            const polyI = index.indexOf(name);
            if (polyI >= 0) {
              cells[name].poly = poly.data[polyI];
            }
          }
        });
        return cells;
      });
    }
    return Promise.resolve(new LoaderResult(await this.cells, null));
  }
}
