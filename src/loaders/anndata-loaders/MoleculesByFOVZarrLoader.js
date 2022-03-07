/* eslint-disable */
import { slice } from 'zarr';
import range from 'lodash/range';
import { polygon as turfPolygon, point as turfPoint } from '@turf/helpers';
import bboxPolygon from '@turf/bbox-polygon';
import booleanIntersects from '@turf/boolean-intersects';

import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';

/**
 * Loader for converting zarr into the cell json schema.
 */
export default class MoleculesByFOVZarrLoader extends AbstractTwoStepLoader {

  constructor(dataSource, params) {
    super(dataSource, params);
    this.getTileData = this.getTileData.bind(this);
  }


  /**
   * Class method for loading spatial cell centroids.
   * @returns {Promise} A promise for an array of tuples/triples for cell centroids.
   */
  loadSpatialByFOV(fov) {
    const spatial = 'uns/spatial';
    if (!this.spatial) {
      this.spatial = {};
    }
    if (this.spatial[fov]) {
      return this.spatial[fov];
    }
    this.spatial[fov] = this.dataSource.loadNumericSlice(
      spatial,
      [fov, slice(0, 4), slice(0, 3), slice(0, 100)],
      // TODO: [fov, null, null, null] or [fov, barcode_id, slice(0, max_barcodes_for_barcode_id), null]
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

  // TODO(merfish): load barcode names

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

  async getTileData(tile) {
    const { fov,  } = await this.molecules;
    const { x, y, z, bbox, signal } = tile;
    const { left, top, right, bottom } = bbox;

    const tilePolygon = bboxPolygon([left, top, right, bottom]);
    const intersectingFov = fov.map(fovObj => ({
      ...fovObj,
      intersectsTile: booleanIntersects(tilePolygon, fovObj.polygon),
    })).filter(fovObj => fovObj.intersectsTile);

    //console.log(intersectingFov);
    //console.log(JSON.stringify(tile));

    const intersectingPromises = intersectingFov.map(fovObj => {
      return this.loadSpatialByFOV(fovObj.id);
    });

    return Promise.all(intersectingPromises).then(intersectingData => {
      //console.log(intersectingData);
      const result = [];
      intersectingData.forEach((fovData, fovIndex) => {
        fovData.data.forEach((barcodeData, barcodeTypeIndex) => {
          range(fovData.shape[2]).forEach((moleculeIndex) => {
            result.push({
              barcodeIndex: barcodeTypeIndex,
              position: [barcodeData[0][moleculeIndex], barcodeData[1][moleculeIndex]],
            });
          })
        })
      });
      return result;
    });

    //console.log(await this.dataSource.loadNumericSlice('uns/spatial', [0, 0, slice(0, 100), null]))

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

        const fov = range(fovIds.data.length).map((i) => ({
          id: fovIds.data[i],
          polygon: bboxPolygon([ fovXStarts.data[i], fovYStarts.data[i], fovXEnds.data[i], fovYEnds.data[i] ]),
        }));

        const moleculesMetadata = {
          barcodeIndices,
          barcodeCounts,
          obsIndex,
          fov,
        };
        return moleculesMetadata;
      });
    }
    return Promise.resolve(new LoaderResult(await this.molecules, null));
  }
}
