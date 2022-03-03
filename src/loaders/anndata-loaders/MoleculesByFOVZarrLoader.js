/* eslint-disable */
import { slice } from 'zarr';
import { polygon as turfPolygon, point as turfPoint } from '@turf/helpers';
import bboxPolygon from '@turf/bbox-polygon';
import booleanIntersects from '@turf/boolean-intersects';

import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';

/**
 * Loader for converting zarr into the cell json schema.
 */
export default class MoleculesByFOVZarrLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading spatial cell centroids.
   * @returns {Promise} A promise for an array of tuples/triples for cell centroids.
   */
  loadSpatialByFOV(fov) {
    const spatial = 'obsm/spatial';
    if (!this.spatial) {
      this.spatial = {};
    }
    if (this.spatial[fov]) {
      return this.spatial[fov];
    }
    this.spatial[fov] = this.dataSource.loadNumericSlice(
      spatial,
      [slice(null), slice(null), fov, slice(null)],
    );
    return this.spatial[fov];
  }

  /**
   * Class method for loading spatial cell polygons.
   * @returns {Promise} A promise for an array of arrays for cell polygons.
   */
  loadBarcodeCounts() {
    const barcodeByFovCounts = 'varm/counts';
    if (this.barcodeByFovCounts) {
      return this.barcodeByFovCounts;
    }
    if (!this.barcodeByFovCounts && barcodeByFovCounts) {
      this.barcodeByFovCounts = this.dataSource.loadNumeric(barcodeByFovCounts);
      return this.barcodeByFovCounts;
    }
    this.barcodeByFovCounts = Promise.resolve(null);
    return this.barcodeByFovCounts;
  }

  /**
   * Class method for loading factors, which are cell set ids.
   * @returns {Promise} A promise for an array of an array of strings of ids,
   * where subarray is a clustering/factor.
   */
  loadBarcodeIndices() {
    const barcodeIndex = 'var/barcode_id';
    if (barcodeIndex) {
      return this.dataSource.loadNumeric(barcodeIndex);
    }
    return Promise.resolve(null);
  }

  /**
   * Class method for loading factors, which are cell set ids.
   * @returns {Promise} A promise for an array of an array of strings of ids,
   * where subarray is a clustering/factor.
   */
  loadFovBounds() {
    const fov = 'uns/fov';
    const fovId = `${fov}/fov_id`;
    const fovXStart = `${fov}/x_start`;
    const fovXEnd = `${fov}/x_end`;
    const fovYStart = `${fov}/y_start`;
    const fovYEnd = `${fov}/y_end`;

    return [
      this.dataSource.loadNumeric(fovId),
      this.dataSource.loadNumeric(fovXStart),
      this.dataSource.loadNumeric(fovXEnd),
      this.dataSource.loadNumeric(fovYStart),
      this.dataSource.loadNumeric(fovYEnd),
    ];
  }

  getTileData(tile) {
    const { fov } = this.molecules || {};
    const { x, y, z, bbox, signal } = tile;
    const { left, top, right, bottom } = bbox;

    console.log(fov);
    console.log(JSON.stringify(tile));

    return Promise.resolve([]);
  }

  async load() {
    if (!this.molecules) {
      this.molecules = Promise.all([
        this.loadBarcodeIndices(),
        this.loadBarcodeCounts(),
        this.dataSource.loadObsIndex(),
        ...this.loadFovBounds(),
      ]).then(([barcodeIndices, barcodeCounts, obsIndex, fovIds, fovXStarts, fovXEnds, fovYStarts, fovYEnds]) => {
        const moleculesMetadata = {
          barcodeIndices,
          barcodeCounts,
          obsIndex,
          fov: fovIds.data.map((fovId, i) => ({
            id: fovId,
            polygon: bboxPolygon([ fovXStarts.data[i], fovYStarts.data[i], fovXEnds.data[i], fovYEnds.data[i] ]),
          })),
        };
        return moleculesMetadata;
      });
    }
    return Promise.resolve(new LoaderResult(await this.molecules, null));
  }
}
