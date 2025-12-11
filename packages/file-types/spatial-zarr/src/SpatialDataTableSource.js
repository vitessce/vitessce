// @ts-ignore
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable import/no-unresolved */
import { tableFromIPC } from 'apache-arrow';
import { AnnDataSource } from '@vitessce/zarr';
import { log } from '@vitessce/globals';
import { sdataMortonQueryRectAux } from './spatialdata-points-zorder.js';
import { range } from 'lodash-es';

/** @import { DataSourceParams } from '@vitessce/types' */
/** @import { QueryClient } from '@tanstack/react-query' */

// Note: This file also serves as the parent for
// SpatialDataPointsSource and SpatialDataShapesSource,
// because when a table annotates points and shapes, it can be helpful to
// have all of the required functionality to load the
// table data and the parquet data.

async function getParquetModule() {
  // Reference: https://observablehq.com/@kylebarron/geoparquet-on-the-web
  // TODO: host somewhere we control, like cdn.vitessce.io?
  // @ts-ignore
  const module = await import(/* webpackIgnore: true */ 'https://cdn.vitessce.io/parquet-wasm@2c23652/esm/parquet_wasm.js');
  await module.default();
  // We cannot use regulary dynamic import here because it breaks NextJS builds
  // due to pointing to a remote URL.
  // I could not figure out a NextJS webpack configuration to resolve it.
  // The following becomes inlined by Vite in library mode
  // eliminating the benefit of dynamic import.
  // Reference: https://github.com/vitejs/vite/issues/4454
  // const responsePromise = await fetch(
  //   new URL('parquet-wasm/esm/parquet_wasm_bg.wasm', import.meta.url).href
  // );
  // const responsePromise = await fetch('https://unpkg.com/parquet-wasm@0.6.1/esm/parquet_wasm_bg.wasm');
  // const wasmBuffer = await responsePromise.arrayBuffer();
  // module.initSync(wasmBuffer);
  // Another issue is that when we import parquet-wasm JS from node_modules,
  // running module.default there is a MIME type issue because the Vite dev
  // server does not serve the .wasm with a MIME type of application/wasm.
  // I can't seem to get a custom Vite plugin that sets the MIME type in
  // request headers to work.
  return {
    readParquet: module.readParquet,
    readSchema: module.readSchema,
    readMetadata: module.readMetadata, // Added in fork
    readParquetRowGroup: module.readParquetRowGroup, // Added in fork
  };
}

// Wrap getParquetModule in a react-query function.
async function _getParquetModule({ queryClient }) {
  return queryClient.fetchQuery({
    queryKey: ['parquetModule'],
    staleTime: Infinity,
    queryFn: getParquetModule,
    meta: { queryClient },
  });
}

// Utility functions for loading particular row groups, rows, row group extent, and binary searching.
async function _loadParquetBytes({ queryClient, store }, parquetPath, rangeQuery = undefined, partIndex = undefined) {
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_loadParquetBytes', parquetPath, rangeQuery, partIndex],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const store = ctx.meta?.store;
      const rangeQuery = ctx.queryKey[3];
      const { offset, length, suffixLength } = rangeQuery || {};

      let getter = (path) => store.get(path);
      if (rangeQuery !== undefined && store.getRange) {
        if(suffixLength !== undefined) {
          getter = (path) => store.getRange(path, {
            suffixLength
          });
        } else {
          getter = (path) => store.getRange(path, {
            offset,
            length
          });
        }
      }

      let parquetBytes = undefined;
      if (partIndex === undefined) {
        // Part index is necessarily undefined for single-file queries.
        parquetBytes = await getter(`/${parquetPath}`);
      }
      if (!parquetBytes) {
        // This may be a directory with multiple parts.
        const part0Path = `${parquetPath}/part.${partIndex ?? 0}.parquet`;
        parquetBytes = await getter(`/${part0Path}`);
      }
      return parquetBytes;
    },
    meta: { store },
  });

}

async function _loadParquetSchemaBytes({ queryClient, store }, parquetPath, partIndex = undefined) {
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_loadParquetSchemaBytes', parquetPath, partIndex],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const queryClient = /** @type {QueryClient} */ (ctx.meta?.queryClient);
      const store = ctx.meta?.store;


      if (store.getRange) {
        // Step 1: Fetch last 8 bytes to get footer length and magic number
        const TAIL_LENGTH = 8;
        // Case 1: single file.
        let partZeroPath = parquetPath;

        // TODO: use _loadParquetBytes here and below instead?
        let tailBytes = await store.getRange(`/${partZeroPath}`, {
          suffixLength: TAIL_LENGTH,
        });
        if (!tailBytes) {
          // Case 2: Rather than a single file, this may be a directory with multiple parts.
          partZeroPath = `${parquetPath}/part.${partIndex ?? 0}.parquet`;
          tailBytes = await store.getRange(`/${partZeroPath}`, {
            suffixLength: TAIL_LENGTH,
          });
        }

        if (!tailBytes || tailBytes.length < TAIL_LENGTH) {
          // TODO: throw custom error type to indicate no part was found to caller?
          throw new Error(`Failed to load parquet footerLength for ${partZeroPath}`);
        }

        // Step 2: Extract footer length and magic number
        // little-endian
        const footerLength = new DataView(tailBytes.buffer).getInt32(0, true);
        const magic = new TextDecoder().decode(tailBytes.slice(4, 8));

        if (magic !== 'PAR1') {
          throw new Error('Invalid Parquet file: missing PAR1 magic number');
        }

        // Step 3. Fetch the full footer bytes
        const footerBytes = await store.getRange(`/${partZeroPath}`, {
          suffixLength: footerLength + TAIL_LENGTH,
        });
        if (!footerBytes || footerBytes.length !== footerLength + TAIL_LENGTH) {
          throw new Error(`Failed to load parquet footer bytes for ${parquetPath}`);
        }
        // Step 4: Return the footer bytes
        return footerBytes;
      }
      // Store does not support getRange.
      return null;
    },
    meta: { queryClient, store },
  });
}

async function _loadParquetMetadataByPart({ queryClient, store }, parquetPath) {
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_loadParquetMetadataByPart', parquetPath],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const queryClient = /** @type {QueryClient} */ (ctx.meta?.queryClient);
      const { readSchema, readMetadata } = await _getParquetModule({ queryClient });

      let partIndex = 0;
      let numParts = undefined;
      const allMetadata = [];
      do {
        try {
          // TODO: support multiple tries upon failure?
          const schemaBytes = await _loadParquetSchemaBytes({ queryClient, store }, parquetPath, partIndex);
          if (schemaBytes) {
            const wasmSchema = readSchema(schemaBytes);
            /** @type {import('apache-arrow').Table} */
            const arrowTableForSchema = tableFromIPC(wasmSchema.intoIPCStream());
            const partMetadata = readMetadata(schemaBytes);
            const partInfo = {
              schema: arrowTableForSchema,
              schemaBytes,
              metadata: partMetadata
            };
            allMetadata.push(partInfo);
            partIndex += 1;
          }
        } catch (error) {
          if (error.message.includes('Failed to load parquet footerLength')) {
            // No more parts found.
            numParts = partIndex;
          }
        }
      } while(numParts === undefined);

      // Accumulate metadata across all parts.
      const metadata = {
        numRows: 0,
        numRowGroups: 0,
        numRowsPerGroup: 0,
        schema: null
      };
      if(allMetadata.length > 0) {
        const firstPart = allMetadata[0];
        metadata.numRows = allMetadata.reduce((sum, part) => sum + part.metadata.fileMetadata().numRows(), 0);
        metadata.numRowGroups = allMetadata.reduce((sum, part) => sum + part.metadata.numRowGroups(), 0);
        metadata.numRowsPerGroup = firstPart.metadata.rowGroup(0).numRows(); // TODO: try/catch in case no row groups?
        metadata.schema = firstPart.schema.schema;
      }

      const result = {
        ...metadata,
        // TODO: extract metadata per part and rowGroup into plain objects that match the hyparquet parquetMetadata() return value?
        // This will also make it easier to test.
        parts: allMetadata,
      };
      return result;
    },
    meta: { queryClient },
  });
}


async function _loadParquetRowGroupByGroupIndex({ queryClient, store }, parquetPath, rowGroupIndex) {
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_loadParquetRowGroupByGroupIndex', parquetPath, rowGroupIndex],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const queryClient = /** @type {QueryClient} */ (ctx.meta?.queryClient);
      const store = ctx.meta?.store;
      const { readParquetRowGroup } = await _getParquetModule({ queryClient });

      const allMetadata = await _loadParquetMetadataByPart({ queryClient, store }, parquetPath);
      if(rowGroupIndex < 0 || rowGroupIndex >= allMetadata.numRowGroups) {
        throw new Error(`Row group index ${rowGroupIndex} is out of bounds for parquet table with ${allMetadata.numRowGroups} row groups.`);
      }

      // Find the part index that contains this row group.
      // TODO: extract logic into utility functions for easier testing.
      let partIndex = undefined;
      let cumulativeRowGroups = 0;
      for(let i = 0; i < allMetadata.parts.length; i++) {
        const part = allMetadata.parts[i];
        const numRowGroupsInPart = part.metadata.numRowGroups();
        if(rowGroupIndex < cumulativeRowGroups + numRowGroupsInPart) {
          partIndex = i;
          break;
        }
        cumulativeRowGroups += numRowGroupsInPart;
      }
      if(partIndex === undefined) {
        throw new Error(`Failed to find part containing row group index ${rowGroupIndex}.`);
      }
      const partMetadata = allMetadata.parts[partIndex].metadata;
      const schemaBytes = allMetadata.parts[partIndex].schemaBytes;
      
      const rowGroupIndexRelativeToPart = rowGroupIndex - cumulativeRowGroups;
      const rowGroupMetadata = partMetadata.rowGroup(rowGroupIndexRelativeToPart);
      const rowGroupFileOffset = rowGroupMetadata.fileOffset();
      const rowGroupCompressedSize = rowGroupMetadata.compressedSize();

      const rowGroupBytes = await _loadParquetBytes({ queryClient, store }, parquetPath, { offset: rowGroupFileOffset, length: rowGroupCompressedSize }, partIndex);
      const rowGroupIPC = readParquetRowGroup(schemaBytes, rowGroupBytes, rowGroupIndexRelativeToPart).intoIPCStream();
      const rowGroupTable = tableFromIPC(rowGroupIPC);

      console.log('Loaded row group', rowGroupIndex);

      return rowGroupTable;
    },
    meta: { queryClient, store },
  });

}

async function _loadParquetRowGroupColumnExtent({ queryClient, store }, parquetPath, columnName, rowGroupIndex) {
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_loadParquetRowGroupColumnExtent', parquetPath, columnName, rowGroupIndex],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const queryClient = /** @type {QueryClient} */ (ctx.meta?.queryClient);
      const store = ctx.meta?.store;

      // Load the min/max extent (via first/last row) for a specific column in a specific row group.
      const rowGroupTable = await _loadParquetRowGroupByGroupIndex({ queryClient, store }, parquetPath, rowGroupIndex);
      const column = rowGroupTable.getChild(columnName);
      if(!column) {
        throw new Error(`Column ${columnName} not found in row group ${rowGroupIndex} of parquet table at ${parquetPath}.`);
      }
      if(column.length === 0) {
        return { min: null, max: null };
      }

      return { min: column.get(0), max: column.get(column.length - 1) };
    },
    meta: { queryClient, store },
  });
}

/*
async function _bisectRowGroupsLeft({ queryClient, store }, parquetPath, columnName, targetValue) {
  // Identify the row group index.
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_bisectRowGroupsLeft', parquetPath, columnName, targetValue],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const queryClient = ctx.meta?.queryClient;
      const store = ctx.meta?.store;
      const allMetadata = await _loadParquetMetadataByPart({ queryClient, store }, parquetPath);
      const numRowGroups = allMetadata.numRowGroups;
      let lo = 0;
      let hi = numRowGroups;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const { min: midVal } = await _loadParquetRowGroupColumnExtent({ queryClient, store }, parquetPath, columnName, mid);
        if (midVal === null || midVal < targetValue) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }
      return lo;
    },
    meta: { queryClient, store },
  });
}
*/

function getCachedInRangeSync(queryClient, parquetPath, columnName, lo, hi) {
  // The assumption here is that it is very cheap to check the cached
  // row group indices (and their min/max values), while loading a row group is expensive.
  const queryCache = queryClient.getQueryCache();
  const prevQueries = queryCache.findAll({
    // Note: Must (manually) keep in sync with queryKey used in _loadParquetRowGroupColumnExtent.
    queryKey: ['SpatialDataTableSource', '_loadParquetRowGroupColumnExtent', parquetPath, columnName /* wildcard for rowGroupIndex */],
    exact: false,
  });

  const cachedRowGroupInfo = prevQueries.map(q => {
    if(!(q.state.status === 'success' && !q.state.isInvalidated)) {
      return null;
    }
    return {
      queryKey: q.queryKey,
      index: q.queryKey[4],
      status: q.state.status,
      min: q.state.data?.min,
      max: q.state.data?.max,
    };
  }).filter(v => v !== null).toSorted((a, b) => a.index - b.index);

  return cachedRowGroupInfo.filter(c => c.index >= lo && c.index < hi);
}

async function getCachedInRange(queryClient, parquetPath, columnName, lo, hi) {
  // The assumption here is that it is very cheap to check the cached
  // row group indices (and their min/max values), while loading a row group is expensive.
  const queryCache = queryClient.getQueryCache();
  const prevQueries = queryCache.findAll({
    // Note: Must (manually) keep in sync with queryKey used in _loadParquetRowGroupColumnExtent.
    queryKey: ['SpatialDataTableSource', '_loadParquetRowGroupColumnExtent', parquetPath, columnName /* wildcard for rowGroupIndex */],
    exact: false,
  });
  const cachedRowGroupInfo = prevQueries.map(q => {
    return {
      queryKey: q.queryKey,
      index: q.queryKey[4],
      status: q.state.status,
      min: q.state.data?.min,
      max: q.state.data?.max,
    };
  }).filter(v => v !== null).toSorted((a, b) => a.index - b.index);

  const cachedInRange = cachedRowGroupInfo.filter(c => c.index >= lo && c.index < hi);
  // We want to await any pending queries here before returning, to avoid accumulating many pending queries.
  // One of the pending queries may contain an answer that allows us to skip other queries.
  const pendingQueries = cachedInRange.filter(c => c.status !== 'success');
  if (pendingQueries.length === 0) {
    return cachedInRange;
  }
  const pendingPromises = pendingQueries.map(c => {
    return queryClient.ensureQueryData({
      queryKey: c.queryKey,
    });
  });
  // console.log('Awaiting', pendingPromises.length, 'pending cached row group extent queries', pendingQueries);
  await Promise.all(pendingPromises);

  return getCachedInRangeSync(queryClient, parquetPath, columnName, lo, hi);
}

async function _bisectRowGroupsRight({ queryClient, store }, parquetPath, columnName, targetValue) {
  // Identify the row group index.
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_bisectRowGroupsRight', parquetPath, columnName, targetValue],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const queryClient = /** @type {QueryClient} */ (ctx.meta?.queryClient);
      const store = ctx.meta?.store;
      const allMetadata = await _loadParquetMetadataByPart({ queryClient, store }, parquetPath);
      const numRowGroups = allMetadata.numRowGroups;

      let lo = 0;
      let hi = numRowGroups;
      while (lo < hi) {
        // The optimization: Can we do better than lo and hi?
        // Check cachedRowGroupInfo to determine whether a closer row group is already contained in the queryClient cache.
        // If so, use that row group rather than performing a naive binary search that ignores the cached row groups.
        // Here, we can check if there is a cached row group between lo and mid that is closer to the targetValue.

        // Check getQueryCache every iteration, in case it has changed while the loop was executing.
        // (Is this even possible though? E.g., due to the usage of Promise.all?)
        const cachedInRange = await getCachedInRange(queryClient, parquetPath, columnName, lo, hi);
        // We want to find the first interval (from right) where targetValue >= c.max.
        const betterLo = cachedInRange.slice().reverse().find(c => c.index > lo && targetValue >= c.max);
        if (betterLo) {
          //console.log('Found a better lo', lo, betterLo.index + 1, 'for', targetValue, 'from', cachedInRange);
          lo = Math.min(hi, betterLo.index + 1);
        }
        // We want to find the first interval (from left) where targetValue < c.min.
        const betterHi = cachedInRange.find(c => targetValue < c.min);
        if (betterHi) {
          //console.log('Found a better hi', hi, betterHi.index - 1, 'for', targetValue, 'from', cachedInRange);
          hi = Math.max(lo, betterHi.index - 1);
        }

        // Check if we can break early due to betterLo/betterHi.
        if (lo >= hi) {
          break;
        }

        const mid = Math.floor((lo + hi) / 2);

        const { max: midVal } = await _loadParquetRowGroupColumnExtent({ queryClient, store }, parquetPath, columnName, mid);
        if (midVal === null || targetValue <= midVal) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }
      return lo;
    },
    meta: { queryClient, store },
  });
}

async function _rectToRowGroupIndices({ queryClient, store }, parquetPath, tileBbox, allPointsBbox) {
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_rectToRowGroupIndices', parquetPath, tileBbox, allPointsBbox],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const queryClient = /** @type {QueryClient} */ (ctx.meta?.queryClient);
      const store = ctx.meta?.store;

      const mortonIntervals = sdataMortonQueryRectAux(allPointsBbox, [
        [tileBbox.left, tileBbox.top], // TODO: is this backwards (bottom/top)?
        [tileBbox.right, tileBbox.bottom],
      ]);

      //if(mortonIntervals.length >= 10_000) {
      //  // Heuristic. This is too large.
      //  throw new Error('More than 10 thousand morton intervals. Skipping.');
      //}

      //console.log(mortonIntervals);


      // We need to convert morton intervals to a set of row groups.
      // Since the morton intervals are sorted and there can be thousands of intervals, we can binary search over them to find the minimal set of row groups.
      // Binary search over the list of morton intervals.
      // Note: we are not performing a binary search for each interval.
      let coveredRowGroupIndices = [];

      // Use recursion to search through half of the intervals.
      const intervalsSpanMultipleRowGroups = async (startIndex, endIndex) => {
        if (startIndex > endIndex) {
          return [false, null];
        }
        // It may be the case that the start and end intervals are the same.
        // We still need to check if they span multiple row groups.
        const [startMin, startMax] = mortonIntervals[startIndex];
        const [endMin, endMax] = mortonIntervals[endIndex];
        // Check if the start and end intervals span multiple row groups.
        const [rowGroupIndexMin, rowGroupIndexMax] = await Promise.all([
          _bisectRowGroupsRight({ queryClient, store }, parquetPath, 'morton_code_2d', startMin),
          _bisectRowGroupsRight({ queryClient, store }, parquetPath, 'morton_code_2d', endMax),
        ]);
        //console.log('Between intervals ', startIndex, endIndex, ' rowGroupIndexMin/max: ', rowGroupIndexMin, rowGroupIndexMax);
        if(rowGroupIndexMin === rowGroupIndexMax) {
          // The intervals are contained within a single row group.
          return [false, [rowGroupIndexMin]];
        }
        if(rowGroupIndexMin + 1 === rowGroupIndexMax || rowGroupIndexMin - 1 === rowGroupIndexMax) {
          // The intervals span two contiguous row groups.
          return [false, [rowGroupIndexMin, rowGroupIndexMax]];
        }
        return [true, null];
      };

      // Begin dividing the intervals in half until we find all of the row groups they span.
      let intervalIndicesToCheck = [[0, mortonIntervals.length - 1]];
      while (intervalIndicesToCheck.length > 0) {
        const [startIndex, endIndex] = intervalIndicesToCheck.pop();
        //console.log('Checking between ', startIndex, endIndex);
        const [spansMultipleRowGroups, rowGroupIndices] = await intervalsSpanMultipleRowGroups(startIndex, endIndex);
        if (!spansMultipleRowGroups) {
          if (rowGroupIndices !== null) {
            coveredRowGroupIndices = coveredRowGroupIndices.concat(rowGroupIndices);
          }
        } else {
          // This else is rarely, if ever, hit in practice.
          if (startIndex === endIndex) {
            // We have narrowed down to a single interval that spans multiple row groups.
            // We need to find the row groups that this interval spans.
            const [intervalMin, intervalMax] = mortonIntervals[startIndex];
            const[rowGroupIndexMin, rowGroupIndexMax] = await Promise.all([
              _bisectRowGroupsRight({ queryClient, store }, parquetPath, 'morton_code_2d', intervalMin),
              _bisectRowGroupsRight({ queryClient, store }, parquetPath, 'morton_code_2d', intervalMax),
            ]);
            if(rowGroupIndexMin <= rowGroupIndexMax) {
              coveredRowGroupIndices = coveredRowGroupIndices.concat(range(rowGroupIndexMin, rowGroupIndexMax + 1));
            } else {
              coveredRowGroupIndices = coveredRowGroupIndices.concat(range(rowGroupIndexMax, rowGroupIndexMin + 1));
            }
          } else {
            // Split the intervals in half and check each half.
            const midIndex = Math.floor((startIndex + endIndex) / 2);
            intervalIndicesToCheck.push([startIndex, midIndex]);
            intervalIndicesToCheck.push([midIndex + 1, endIndex]);
          }
        }
      }

      const uniqueCoveredRowGroupIndices = Array.from(new Set(coveredRowGroupIndices));
      return uniqueCoveredRowGroupIndices;
    },
    meta: { queryClient, store },
  });
}


/**
 * Get the name of the index column from an Apache Arrow table.
 * In the future, this may not be needed if more metadata is included in the Zarr Attributes.
 * Reference: https://github.com/scverse/spatialdata/issues/958
 * @param {import('apache-arrow').Table} arrowTable
 * @returns {string|null}
 */
function tableToIndexColumnName(arrowTable) {
  const pandasMetadata = arrowTable.schema.metadata.get('pandas');
  if (pandasMetadata) {
    const pandasMetadataJson = JSON.parse(pandasMetadata);
    if (
      Array.isArray(pandasMetadataJson.index_columns)
      && pandasMetadataJson.index_columns.length === 1
    ) {
      const result = pandasMetadataJson.index_columns?.[0];
      if (typeof result === 'string') {
        return result;
      }
      if (result?.kind === 'range') {
        // TODO: handle range indices downstream.
        return null;
      }
      throw new Error('Unexpected type in the pandas metadata index_columns array.');
    }
    throw new Error('Expected a single index column in the pandas metadata.');
  }
  return null;
}


// If the array path starts with table/something/rest
// capture table/something.
const pluralSubElementRegex = /^tables\/([^/]*)\/(.*)$/;
const singularSubElementRegex = /^table\/([^/]*)\/(.*)$/;

const pluralRegex = /^tables\/([^/]*)$/;
const singularRegex = /^table\/([^/]*)$/;

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getTableElementPath(arrPath) {
  if (arrPath) {
    // First try the plural "tables/{something}/{arr}"
    const pluralMatches = arrPath.match(pluralSubElementRegex);
    if (pluralMatches && pluralMatches.length === 3) {
      return `tables/${pluralMatches[1]}`;
    }
    // Then try the plural "tables/{something}"
    const pluralElementMatches = arrPath.match(pluralRegex);
    if (pluralElementMatches && pluralElementMatches.length === 2) {
      return `tables/${pluralElementMatches[1]}`;
    }
    // Then try the singular "table/{something}/{arr}"
    const singularMatches = arrPath.match(singularSubElementRegex);
    if (singularMatches && singularMatches.length === 3) {
      return `table/${singularMatches[1]}`;
    }
    // Finally try the singular "table/{something}"
    const singularElementMatches = arrPath.match(singularRegex);
    if (singularElementMatches && singularElementMatches.length === 2) {
      return `table/${singularElementMatches[1]}`;
    }
  }
  return ''; // TODO: throw an error?
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getObsPath(arrPath) {
  return `${getTableElementPath(arrPath)}/obs`;
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getVarPath(arrPath) {
  return `${getTableElementPath(arrPath)}/var`;
}

/**
 * This class is a parent class for tables, shapes, and points.
 * This is because these share functionality, for example:
 * - both shapes (the latest version) and points use parquet-based formats.
 * - both shapes (a previous version) and tables use zarr-based formats.
 * - logic for manipulating spatialdata element paths is shared across all elements.
 */
export default class SpatialDataTableSource extends AnnDataSource {
  /**
   *
   * @param {DataSourceParams & { queryClient: QueryClient }} params
   */
  constructor(params) {
    super(params);

    const { queryClient } = params;
    this.queryClient = queryClient;

    // Non-table-specific properties
    this.parquetModulePromise = getParquetModule();

    this.rootAttrs = null;
    /**
     * This is a map of element paths to their attributes.
     * @type {{ [k: string]: any }}
     */
    this.elementAttrs = {};

    // TODO: change to column-specific storage?
    /** @type {{ [k: string]: Uint8Array }} */
    this.parquetTableBytes = {};
    /** @type {{ [k: string]: boolean }} */
    this.parquetTableIsDirectory = {};


    // Table-specific properties
    /** @type {{ [k: string]: Promise<string[]> }} */
    this.obsIndices = {};
    /** @type {{ [k: string]: Promise<string[]> }} */
    this.varIndices = {};
    /** @type {{ [k: string]: string[] }} */
    this.varAliases = {};
  }

  // NON-TABLE-SPECIFIC METHODS

  // TODO: implement a method to load the root zmetadata?
  // This could help to determine which table annotates which elements,
  // without the need to provide the tablePath in the options.

  /**
   * This function loads the attrs for the root spatialdata object.
   * This is not the same as the attrs for a specific element.
   * @returns
   */
  async loadSpatialDataObjectAttrs() {
    if (this.rootAttrs) {
      return this.rootAttrs;
    }
    // Load the root attrs.
    const rootAttrs = await this.getJson('.zattrs');
    const { spatialdata_attrs } = rootAttrs;
    const {
      spatialdata_software_version: softwareVersion,
      version: formatVersion,
    } = spatialdata_attrs;
    this.rootAttrs = { softwareVersion, formatVersion };
    return this.rootAttrs;
  }

  /**
   * Get the attrs for a specific element
   * (e.g., "shapes/{element_name}" or "tables/{element_name}").
   * @param {string} elementPath
   * @returns
   */
  async loadSpatialDataElementAttrs(elementPath) {
    if (this.elementAttrs[elementPath]) {
      return this.elementAttrs[elementPath];
    }
    // TODO: normalize the elementPath to always end without a slash?
    // TODO: ensure that elementPath is a valid spatial element path?
    const v0_4_0_attrs = await this.getJson(`${elementPath}/.zattrs`);

    let result = v0_4_0_attrs;
    if (v0_4_0_attrs['encoding-type'] === 'anndata') {
      const attrsKeys = Object.keys(v0_4_0_attrs);
      if (
        ['instance_key', 'region', 'region_key']
          .every(k => attrsKeys.includes(k))
      ) {
        // TODO: assert things about "spatialdata-encoding-type" and "version" values?
        // TODO: first check the "spatialdata_software_version" metadata in
        // the root of the spatialdata object? (i.e., sdata.zarr/.zattrs)
        result = v0_4_0_attrs;
      } else {
        // Prior to v0.4.0 of the spatialdata package, the spatialdata_attrs
        // lived within their own dictionary within "uns".
        const pre_v0_4_0_attrs = await this._loadDict(
          `${elementPath}/uns/spatialdata_attrs`,
          ['instance_key', 'region', 'region_key'],
        );
        result = pre_v0_4_0_attrs;
      }
    }
    this.elementAttrs[elementPath] = result;
    return this.elementAttrs[elementPath];
  }

  /**
   *
   * @param {string} parquetPath The path to the parquet file or directory,
   * relative to the store root.
   * @returns {Promise<Uint8Array|undefined>} The parquet file bytes.
   */
  async loadParquetBytes(parquetPath, offset = undefined, length = undefined, partIndex = undefined) {
    const { store } = this.storeRoot;

    let getter = (path) => store.get(path);
    if (offset !== undefined && length !== undefined && store.getRange) {
      getter = (path) => store.getRange(path, {
        offset,
        length
      });
    }

    let parquetBytes = await getter(`/${parquetPath}`);
    if(!parquetBytes) {
      // We have not yet determined if this is a directory or a single file.

      // This may be a directory with multiple parts.
      const part0Path = `${parquetPath}/part.${partIndex ?? 0}.parquet`;
      parquetBytes = await getter(`/${part0Path}`);
    }

    return parquetBytes;
  }

  /**
   * Try to load only the schema bytes of a parquet file.
   * This is useful for getting the index column name without
   * loading the full table.
   * This will only work if the store supports getRange,
   * for example FetchStore.
   * Reference: https://github.com/manzt/zarrita.js/blob/c0dd684dc4da79a6f42ab2a591246947bde8d143/packages/%40zarrita-storage/src/fetch.ts#L87
   * In the future, this may not be needed if more metadata is
   * included in the Zarr Attributes.
   * Reference: https://github.com/scverse/spatialdata/issues/958
   * @param {string} parquetPath The path to the parquet file or directory,
   * relative to the store root.
   * @returns {Promise<Uint8Array|null>} The parquet file bytes,
   * or null if the store does not support getRange.
   */
  async loadParquetSchemaBytes(parquetPath, partIndex = undefined) {
    const { store } = this.storeRoot;

    if (store.getRange) {
      // Step 1: Fetch last 8 bytes to get footer length and magic number
      const TAIL_LENGTH = 8;
      let partZeroPath = parquetPath;
      // Case 1: Parquet file (or still unknown if file vs. directory).
      let tailBytes = await store.getRange(`/${partZeroPath}`, {
        suffixLength: TAIL_LENGTH,
      });
      // We already know this is a directory, so we skip the single-file path altogether.
      // Case 2: Rather than a single file, this may be a directory with multiple parts.
      partZeroPath = `${parquetPath}/part.${partIndex ?? 0}.parquet`;
      tailBytes = await store.getRange(`/${partZeroPath}`, {
        suffixLength: TAIL_LENGTH,
      });

      if (!tailBytes || tailBytes.length < TAIL_LENGTH) {
        // TODO: throw custom error type to indicate no part was found to caller?
        throw new Error(`Failed to load parquet footerLength for ${parquetPath}`);
      }
      // Step 2: Extract footer length and magic number
      // little-endian
      const footerLength = new DataView(
        tailBytes.buffer,
        // It is possible that tailBytes is a subarray,
        // e.g., if the ArrayBuffer was created inside
        // FlatFileSystemStore.getRange.
        tailBytes.byteOffset,
        tailBytes.byteLength,
      ).getInt32(0, true);
      const magic = new TextDecoder().decode(tailBytes.slice(4, 8));

      if (magic !== 'PAR1') {
        throw new Error('Invalid Parquet file: missing PAR1 magic number');
      }

      // Step 3. Fetch the full footer bytes
      const footerBytes = await store.getRange(`/${partZeroPath}`, {
        suffixLength: footerLength + TAIL_LENGTH,
      });
      if (!footerBytes || footerBytes.length !== footerLength + TAIL_LENGTH) {
        throw new Error(`Failed to load parquet footer bytes for ${parquetPath}`);
      }

      // Step 4: Return the footer bytes
      return footerBytes;
    }
    // Store does not support getRange.
    return null;
  }

  /**
   * Get the index column from a parquet table.
   * @param {string} parquetPath A path to a parquet file (or directory).
   * @returns {Promise<import('apache-arrow').Vector|null>} A promise for a column, or null.
   */
  async loadParquetTableIndex(parquetPath) {
    const columns = /** @type {string[]} */ ([]);
    const arrowTable = await this.loadParquetTable(parquetPath, columns);
    const indexColumnName = tableToIndexColumnName(arrowTable);
    if (!indexColumnName) {
      return null;
    }
    return arrowTable.getChild(indexColumnName);
  }

  /**
   * TODO: change implementation so that subsets of
   * columns can be loaded if the whole table is not needed.
   * Will first need to load the table schema.
   * @param {string} parquetPath A path to a parquet file (or directory).
   * @param {string[]|undefined} columns An optional list of column names to load.
   * @returns
   */
  async loadParquetTable(parquetPath, columns = undefined) {
    const { readParquet, readSchema } = await this.parquetModulePromise;

    const options = {
      columns,
    };

    let indexColumnName;

    if (columns) {
      // If columns are specified, we also want to ensure that the index column is included.
      // Otherwise, the user wants the full table anyway.

      // We first try to load the schema bytes to determine the index column name.
      // Perhaps in the future SpatialData can store the index column name
      // in the .zattrs so that we do not need to load the schema first,
      // since only certain stores such as FetchStores support getRange.
      // Reference: https://github.com/scverse/spatialdata/issues/958
      try {
        const schemaBytes = await this.loadParquetSchemaBytes(parquetPath);
        if (schemaBytes) {
          const wasmSchema = readSchema(schemaBytes);
          /** @type {import('apache-arrow').Table} */
          const arrowTableForSchema = tableFromIPC(wasmSchema.intoIPCStream());
          indexColumnName = tableToIndexColumnName(arrowTableForSchema);
        }
      } catch (/** @type {any} */ e) {
        // If we fail to load the schema bytes, we can proceed to try to load the full table bytes,
        // for instance if range requests are not supported but the full table can be loaded.
        log.warn(`Failed to load parquet schema bytes for ${parquetPath}: ${e.message}`);
      }
    }
    // Load the full table bytes.

    // TODO: can we avoid loading the full table bytes
    // if we only need a subset of columns?
    // For example, if the store supports
    // getRange like above to get the schema bytes.
    // See https://github.com/kylebarron/parquet-wasm/issues/758
    let parquetBytes = await this.loadParquetBytes(parquetPath);
    if (!parquetBytes) {
      throw new Error('Failed to load parquet data from store.');
    }
    if (!ArrayBuffer.isView(parquetBytes)) {
      // This is required because in vitessce-python the
      // experimental.invoke store wrapper can return an ArrayBuffer,
      // but readParquet expects a Uint8Array.
      parquetBytes = new Uint8Array(parquetBytes);
    }

    if (columns && !indexColumnName) {
      // The user requested specific columns, but we did not load the schema bytes
      // to successfully get the index column name.
      // Here we try again to get the index column name, but this
      // time from the full table bytes (rather than only the schema-bytes).
      const wasmSchema = readSchema(parquetBytes);
      /** @type {import('apache-arrow').Table} */
      const arrowTableForSchema = tableFromIPC(wasmSchema.intoIPCStream());
      indexColumnName = tableToIndexColumnName(arrowTableForSchema);
    }

    if (options.columns && indexColumnName) {
      options.columns = [...options.columns, indexColumnName];
    }

    const wasmTable = readParquet(parquetBytes, options);
    /** @type {import('apache-arrow').Table} */
    const arrowTable = tableFromIPC(wasmTable.intoIPCStream());
    return arrowTable;
  }

  // TABLE-SPECIFIC METHODS

  /**
   * Class method for loading the obs index.
   * @param {string|undefined} path
   * @returns {Promise<string[]>} An promise for a zarr array containing the indices.
   */
  async loadObsIndex(path = undefined) {
    const obsPath = getObsPath(path);
    const { _index } = await this.getJson(`${obsPath}/.zattrs`);
    let indexPath;
    if (_index) {
      indexPath = `${obsPath}/${_index}`;
    }

    const {
      instance_key: instanceKey,
      // TODO: filter table index by region and element type.
      // region_key: regionKey,
      // region,
    } = await this.loadSpatialDataElementAttrs(getTableElementPath(path));

    if (instanceKey !== undefined && instanceKey !== null) {
      // Use a specific instanceKey column for the index if
      // defined according to spatialdata_attrs metadata.
      indexPath = `${obsPath}/${instanceKey}`;
    }

    if (indexPath && indexPath in this.obsIndices) {
      return this.obsIndices[indexPath];
    }
    if (!indexPath) {
      throw new Error(`No index path found for obs index at ${path}`);
    }
    this.obsIndices[indexPath] = this._loadColumn(indexPath);
    return this.obsIndices[indexPath];
  }

  /**
   * Class method for loading the var index.
   * @param {string|undefined} path
   * @returns {Promise<string[]>} An promise for a zarr array containing the indices.
   */
  loadVarIndex(path = undefined) {
    const varPath = getVarPath(path);
    if (varPath in this.varIndices) {
      return this.varIndices[varPath];
    }
    this.varIndices[varPath] = this.getJson(`${varPath}/.zattrs`)
      .then(({ _index }) => this.getFlatArrDecompressed(`${varPath}/${_index}`));
    return this.varIndices[varPath];
  }

  /**
   * Class method for loading the var alias.
   * @param {string} varPath
   * @param {string} matrixPath
   * @returns {Promise<string[]>} An promise for a zarr array containing the aliased names.
   */
  async loadVarAlias(varPath, matrixPath) {
    if (varPath in this.varAliases) {
      return this.varAliases[varPath];
    }
    const [varAliasData] = await this.loadVarColumns([varPath]);
    this.varAliases[varPath] = /** @type {string[]} */ (varAliasData);
    const index = await this.loadVarIndex(matrixPath);
    this.varAliases[varPath] = this.varAliases[varPath].map(
      (val, ind) => (val ? val.concat(` (${index[ind]})`) : index[ind]),
    );
    return this.varAliases[varPath];
  }



  /**
   * Load point data using a tiled approach.
   * @param {string} parquetPath A path to a parquet file (or directory).
   * @param {{ left: number, top: number, right: number, bottom: number }} tileBbox
   * @param {{ x_min: number, y_min: number, x_max: number, y_max: number }} allPointsBbox
   * @param {string[]|undefined} columns An optional list of column names to load.
   * @returns
   */
  async loadParquetTableInRect(parquetPath, tileBbox, allPointsBbox, signal) {
    const { queryClient } = this;
    const { store } = this.storeRoot;

    // TODO: load only the columns we need (x, y, feature_index) rather than the full table.

    // Subdivide tileBbox into rectangles of a fixed size.
    const TILE_SIZE = 256; // 512 x 512.
    
    // If tileBbox is larger than TILE_SIZE, we need to subdivide it.
    let tileBboxes = [];
    if (tileBbox.right - tileBbox.left > TILE_SIZE || tileBbox.bottom - tileBbox.top > TILE_SIZE) {
      const xSteps = Math.ceil((tileBbox.right - tileBbox.left) / TILE_SIZE);
      const ySteps = Math.ceil((tileBbox.bottom - tileBbox.top) / TILE_SIZE);
      const xStepSize = (tileBbox.right - tileBbox.left) / xSteps;
      const yStepSize = (tileBbox.bottom - tileBbox.top) / ySteps;
      for (let i = 0; i < xSteps; i++) {
        for (let j = 0; j < ySteps; j++) {
          const subTileBbox = {
            left: tileBbox.left + i * xStepSize,
            right: Math.min(tileBbox.left + (i + 1) * xStepSize, tileBbox.right),
            top: tileBbox.top + j * yStepSize,
            bottom: Math.min(tileBbox.top + (j + 1) * yStepSize, tileBbox.bottom),
          };
          tileBboxes.push(subTileBbox);
        }
      }
    } else {
      tileBboxes = [tileBbox];
    }

    console.log('Starting query for tileBboxes', tileBboxes);

    // TODO: pass signal to react-query functions to allow aborting requests.

    const rowGroupIndicesPerTile = await Promise.all(tileBboxes.map(async (subTileBbox) => {
      return _rectToRowGroupIndices({ queryClient, store }, parquetPath, subTileBbox, allPointsBbox);
    }));
    // Combine the row group indices from all tiles, and remove duplicates.
    const uniqueCoveredRowGroupIndices = Array.from(new Set(rowGroupIndicesPerTile.flat())).toSorted((a, b) => a - b);
    console.log('Unique covered row group indices:', uniqueCoveredRowGroupIndices);

    const allMetadata = await _loadParquetMetadataByPart({ queryClient, store }, parquetPath);

    // Now we can load the row groups and concatenate them into typed arrays.
    // We already know the size of the final arrays based on the number of rows in each row group.
    const numRowsPerGroup = allMetadata.numRowsPerGroup;
    const numRowGroups = uniqueCoveredRowGroupIndices.length;
    const totalNumRows = numRowsPerGroup * numRowGroups;

    const xArr = new Float32Array(totalNumRows);
    const yArr = new Float32Array(totalNumRows);
    const featureIndexArr = new Uint32Array(totalNumRows);
    
    const rowGroupTables = await Promise.all(uniqueCoveredRowGroupIndices.map(async (rowGroupIndex) => {
      return _loadParquetRowGroupByGroupIndex({ queryClient, store }, parquetPath, rowGroupIndex);
    }));
    
    let rowOffset = 0;
    rowGroupTables.forEach((table) => {
      const xColumn = table.getChild('x');
      const yColumn = table.getChild('y');
      // TODO: get the feature index column name from the zattrs metadata
      const featureIndexColumn = table.getChild('feature_index');
      if(!xColumn || !yColumn || !featureIndexColumn) {
        throw new Error(`Missing required column in parquet table at ${parquetPath}. Required columns: x, y, feature_index`);
      }
      // Set the values in the typed arrays.
      xArr.set(xColumn.toArray(), rowOffset);
      yArr.set(yColumn.toArray(), rowOffset);
      featureIndexArr.set(featureIndexColumn.toArray(), rowOffset);
      rowOffset += numRowsPerGroup;
    });
    
    return {
      data: {
        x: xArr,
        y: yArr,
        featureIndices: featureIndexArr,
      },
      shape: [3, totalNumRows],
    };
  }
}
