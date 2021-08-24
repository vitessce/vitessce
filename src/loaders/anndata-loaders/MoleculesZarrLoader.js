/* eslint-disable */
import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';

/**
 * Loader for converting zarr into the cell json schema.
 */
export default class MoleculesZarrLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading spatial cell centroids.
   * @returns {Promise} A promise for an array of tuples/triples for cell centroids.
   */
  loadSpatial() {
    const { spatial } = (this.options || {});
    if (this.spatial) {
      return this.spatial;
    }
    if (!this.spatial && spatial) {
      this.spatial = this.dataSource.loadNumeric(spatial);
      return this.spatial;
    }
    this.spatial = Promise.resolve(null);
    return this.spatial;
  }

  /**
   * Class method for loading spatial cell polygons.
   * @returns {Promise} A promise for an array of arrays for cell polygons.
   */
  loadRgb() {
    const { rgb } = (this.options || {});
    if (this.rgb) {
      return this.rgb;
    }
    if (!this.rgb && rgb) {
      this.rgb = this.dataSource.loadNumeric(rgb);
      return this.rgb;
    }
    this.rgb = Promise.resolve(null);
    return this.rgb;
  }

  /**
   * Class method for loading factors, which are cell set ids.
   * @returns {Promise} A promise for an array of an array of strings of ids,
   * where subarray is a clustering/factor.
   */
  loadCellIds() {
    const { cellKey } = (this.options || {});
    if (cellKey) {
      return this.dataSource._loadObsVariable(cellKey);
    }
    return Promise.resolve(null);
  }

  /**
   * Class method for loading factors, which are cell set ids.
   * @returns {Promise} A promise for an array of an array of strings of ids,
   * where subarray is a clustering/factor.
   */
  loadGeneIds() {
    const { geneKey } = (this.options || {});
    if (geneKey) {
      return this.dataSource._loadObsVariable(geneKey);
    }
    return Promise.resolve(null);
  }

  async load() {
    if (!this.molecules) {
      this.molecules = Promise.all([
        //this.loadCellIds(),
        //this.loadGeneIds(),
        this.loadSpatial(),
        this.loadRgb(),
        this.dataSource.loadObsIndex(),
      ]).then(([spatial, rgb, moleculeNames]) => {
        const molecules = {};
        moleculeNames.forEach((name, i) => {
          molecules[name] = {};
          if (spatial) {
            molecules[name].spatial = spatial.data[i];
          }
          if (rgb) {
            molecules[name].rgb = rgb.data[i];
          }
          /*
          if (cellIds) {
            molecules[name].cellId = cellIds.data[i];
          }
          if (geneIds) {
            molecules[name].geneId = geneIds.data[i];
          }
          */
        });
        return molecules;
      });
    }
    return Promise.resolve(new LoaderResult(await this.molecules, null));
  }
}
