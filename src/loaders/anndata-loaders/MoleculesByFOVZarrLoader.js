/* eslint-disable */
import { slice } from 'zarr';
import range from 'lodash/range';
import bboxPolygon from '@turf/bbox-polygon';
import booleanIntersects from '@turf/boolean-intersects';
import { InternMap } from 'internmap';

import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';
import sum from 'lodash/sum';

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
  async loadSpatialByFOV(zSlice, fov) {
    const spatial = 'uns/spatial';
    const barcodes = 'uns/barcode';
    const key = [zSlice, fov];
    if (!this.spatial) {
      this.spatial = new InternMap([], JSON.stringify);
      this.barcodes = new InternMap([], JSON.stringify);
    }
    if (this.spatial.has(key)) {
      return [this.spatial.get(key), this.barcodes.get(key)];
    }
    // Get the max number of barcodes for this (z, fov) tuple.
    const { barcodeCounts } = await this.molecules;
    const maxBarcodesByFOV = barcodeCounts.data[zSlice][fov];
    const spatialResult = this.dataSource.loadNumericSlice(
      spatial,
      [zSlice, fov, slice(0, 2), slice(0, maxBarcodesByFOV)],
    );
    const barcodesResult = this.dataSource.loadNumericSlice(
      barcodes,
      [zSlice, fov, 0, slice(0, maxBarcodesByFOV)],
    );
    this.spatial.set(key, spatialResult);
    this.barcodes.set(key, barcodesResult);
    return [await spatialResult, await barcodesResult];
  }

  /**
   * Class method for loading spatial cell polygons.
   * @returns {Promise} A promise for an array of arrays for cell polygons.
   */
  loadBarcodeCounts() {
    const barcodeByFovCounts = 'uns/counts';
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

  async getTileData(tile, zSlice) {
    const { fov } = await this.molecules;
    const { x, y, z, bbox, signal } = tile;
    const { left, top, right, bottom } = bbox;

    const tilePolygon = bboxPolygon([left, top, right, bottom]);
    const intersectingFov = fov.map(fovObj => ({
      ...fovObj,
      intersectsTile: booleanIntersects(tilePolygon, fovObj.polygon),
    })).filter(fovObj => fovObj.intersectsTile);

    const intersectingPromises = intersectingFov.map(fovObj => {
      return this.loadSpatialByFOV(zSlice, fovObj.id);
    });

    return Promise.all(intersectingPromises).then(intersectingData => {
      const numBarcodes = sum(intersectingData.map(fovData => fovData?.[0].shape?.[1] || 0));
      if(numBarcodes === 0) {
        return {
          src: [],
          length: 0,
        };
      }
      const xVals = new Float32Array(numBarcodes);
      const yVals = new Float32Array(numBarcodes);
      const barcodeIndices = new Uint16Array(numBarcodes);

      let offset = 0;
      intersectingData.forEach((fovData) => {
        if(fovData && fovData.length === 2 && fovData[0].data && fovData[1].data && fovData[0].data.length === 2) {
          xVals.set(fovData[0].data[0], offset);
          yVals.set(fovData[0].data[1], offset);
          barcodeIndices.set(fovData[1].data, offset);

          offset += fovData[0].shape[1];
        }
      });

      // Reference: https://deck.gl/docs/developer-guide/performance#supply-binary-blobs-to-the-data-prop
      return {
        src: { xVals, yVals, barcodeIndices },
        zSlice: zSlice,
        length: numBarcodes,
      };
    });
  }

  async load() {
    if (!this.molecules) {
      this.molecules = Promise.all([
        this.loadBarcodeCounts(),
        ...this.loadFovBounds(),
      ]).then(([barcodeCounts, fovIds, fovXStarts, fovXEnds, fovYStarts, fovYEnds]) => {

        const fov = range(fovIds.data.length).map((i) => ({
          id: fovIds.data[i],
          polygon: bboxPolygon([ fovXStarts.data[i], fovYStarts.data[i], fovXEnds.data[i], fovYEnds.data[i] ]),
        }));

        const moleculesMetadata = {
          barcodeCounts,
          fov,
        };
        return moleculesMetadata;
      });
    }
    return Promise.resolve(new LoaderResult(await this.molecules, null));
  }
}
