// @ts-ignore
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable no-lonely-if */
/* eslint-disable import/no-unresolved */
import { tableFromIPC } from 'apache-arrow';
import { range } from 'lodash-es';
import { createGetRange } from '@vitessce/zarr-utils';
import { sdataMortonQueryRectAux } from './spatialdata-points-zorder.js';

/** @import { QueryClient } from '@tanstack/react-query' */


export async function getParquetModule() {
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

      let getter = path => store.get(path);
      if (rangeQuery !== undefined && store.getRange) {
        if (suffixLength !== undefined) {
          getter = path => store.getRange(path, {
            suffixLength,
          });
        } else {
          getter = path => store.getRange(path, {
            offset,
            length,
          });
        }
      }

      let parquetBytes;
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
      const store = ctx.meta?.store;
      const getRange = createGetRange(store);

      // Step 1: Fetch last 8 bytes to get footer length and magic number
      const TAIL_LENGTH = 8;
      // Case 1: single file.
      let partZeroPath = parquetPath;

      // TODO: use _loadParquetBytes here and below instead?
      let tailBytes = await getRange(`/${partZeroPath}`, {
        suffixLength: TAIL_LENGTH,
      });
      if (!tailBytes) {
        // Case 2: Rather than a single file, this may be a directory with multiple parts.
        partZeroPath = `${parquetPath}/part.${partIndex ?? 0}.parquet`;
        tailBytes = await getRange(`/${partZeroPath}`, {
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
      const footerBytes = await getRange(`/${partZeroPath}`, {
        suffixLength: footerLength + TAIL_LENGTH,
      });
      if (!footerBytes || footerBytes.length !== footerLength + TAIL_LENGTH) {
        throw new Error(`Failed to load parquet footer bytes for ${parquetPath}`);
      }
      // Step 4: Return the footer bytes
      return footerBytes;
    },
    meta: { queryClient, store },
  });
}

export async function _loadParquetMetadataByPart({ queryClient, store }, parquetPath) {
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_loadParquetMetadataByPart', parquetPath],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const queryClient = /** @type {QueryClient} */ (ctx.meta?.queryClient);
      const { readSchema, readMetadata } = await _getParquetModule({ queryClient });

      let partIndex = 0;
      let numParts;
      const allMetadata = [];
      do {
        try {
          // TODO: support multiple tries upon failure?
          // eslint-disable-next-line no-await-in-loop
          const schemaBytes = await _loadParquetSchemaBytes({ queryClient, store }, parquetPath, partIndex);
          if (schemaBytes) {
            const wasmSchema = readSchema(schemaBytes);
            /** @type {import('apache-arrow').Table} */
            const arrowTableForSchema = tableFromIPC(wasmSchema.intoIPCStream());
            const partMetadata = readMetadata(schemaBytes);
            const partInfo = {
              schema: arrowTableForSchema,
              schemaBytes,
              metadata: partMetadata,
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
      } while (numParts === undefined);

      // Accumulate metadata across all parts.
      const metadata = {
        numRows: 0,
        numRowGroups: 0,
        numRowsPerGroup: 0,
        schema: null,
      };
      if (allMetadata.length > 0) {
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


export async function _loadParquetRowGroupByGroupIndex({ queryClient, store }, parquetPath, rowGroupIndex) {
  return queryClient.fetchQuery({
    queryKey: ['SpatialDataTableSource', '_loadParquetRowGroupByGroupIndex', parquetPath, rowGroupIndex],
    staleTime: Infinity,
    queryFn: async (ctx) => {
      const queryClient = /** @type {QueryClient} */ (ctx.meta?.queryClient);
      const store = ctx.meta?.store;
      const { readParquetRowGroup } = await _getParquetModule({ queryClient });

      const allMetadata = await _loadParquetMetadataByPart({ queryClient, store }, parquetPath);
      if (rowGroupIndex < 0 || rowGroupIndex >= allMetadata.numRowGroups) {
        throw new Error(`Row group index ${rowGroupIndex} is out of bounds for parquet table with ${allMetadata.numRowGroups} row groups.`);
      }

      // Find the part index that contains this row group.
      // TODO: extract logic into utility functions for easier testing.
      let partIndex;
      let cumulativeRowGroups = 0;
      for (let i = 0; i < allMetadata.parts.length; i++) {
        const part = allMetadata.parts[i];
        const numRowGroupsInPart = part.metadata.numRowGroups();
        if (rowGroupIndex < cumulativeRowGroups + numRowGroupsInPart) {
          partIndex = i;
          break;
        }
        cumulativeRowGroups += numRowGroupsInPart;
      }
      if (partIndex === undefined) {
        throw new Error(`Failed to find part containing row group index ${rowGroupIndex}.`);
      }
      const partMetadata = allMetadata.parts[partIndex].metadata;
      const { schemaBytes } = allMetadata.parts[partIndex];

      const rowGroupIndexRelativeToPart = rowGroupIndex - cumulativeRowGroups;
      const rowGroupMetadata = partMetadata.rowGroup(rowGroupIndexRelativeToPart);
      const rowGroupFileOffset = rowGroupMetadata.fileOffset();
      const rowGroupCompressedSize = rowGroupMetadata.compressedSize();

      const rowGroupBytes = await _loadParquetBytes({ queryClient, store }, parquetPath, { offset: rowGroupFileOffset, length: rowGroupCompressedSize }, partIndex);
      const rowGroupIPC = readParquetRowGroup(schemaBytes, rowGroupBytes, rowGroupIndexRelativeToPart).intoIPCStream();
      const rowGroupTable = tableFromIPC(rowGroupIPC);
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
      if (!column) {
        throw new Error(`Column ${columnName} not found in row group ${rowGroupIndex} of parquet table at ${parquetPath}.`);
      }
      if (column.length === 0) {
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
    queryKey: ['SpatialDataTableSource', '_loadParquetRowGroupColumnExtent', parquetPath, columnName],
    exact: false,
  });

  const cachedRowGroupInfo = prevQueries.map((q) => {
    if (!(q.state.status === 'success' && !q.state.isInvalidated)) {
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
    queryKey: ['SpatialDataTableSource', '_loadParquetRowGroupColumnExtent', parquetPath, columnName],
    exact: false,
  });
  const cachedRowGroupInfo = prevQueries.map(q => ({
    queryKey: q.queryKey,
    index: q.queryKey[4],
    status: q.state.status,
    min: q.state.data?.min,
    max: q.state.data?.max,
  })).filter(v => v !== null).toSorted((a, b) => a.index - b.index);

  const cachedInRange = cachedRowGroupInfo.filter(c => c.index >= lo && c.index < hi);
  // We want to await any pending queries here before returning, to avoid accumulating many pending queries.
  // One of the pending queries may contain an answer that allows us to skip other queries.
  const pendingQueries = cachedInRange.filter(c => c.status !== 'success');
  if (pendingQueries.length === 0) {
    return cachedInRange;
  }
  const pendingPromises = pendingQueries.map(c => queryClient.ensureQueryData({
    queryKey: c.queryKey,
  }));
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
      const { numRowGroups } = allMetadata;

      let lo = 0;
      let hi = numRowGroups;
      while (lo < hi) {
        // The optimization: Can we do better than lo and hi?
        // Check cachedRowGroupInfo to determine whether a closer row group is already contained in the queryClient cache.
        // If so, use that row group rather than performing a naive binary search that ignores the cached row groups.
        // Here, we can check if there is a cached row group between lo and mid that is closer to the targetValue.

        // Check getQueryCache every iteration, in case it has changed while the loop was executing.
        // (Is this even possible though? E.g., due to the usage of Promise.all?)
        // eslint-disable-next-line no-await-in-loop
        const cachedInRange = await getCachedInRange(queryClient, parquetPath, columnName, lo, hi);
        // We want to find the first interval (from right) where targetValue >= c.max.
        // eslint-disable-next-line no-loop-func
        const betterLo = cachedInRange.slice().reverse().find(c => c.index > lo && targetValue >= c.max);
        if (betterLo) {
          // console.log('Found a better lo', lo, betterLo.index + 1, 'for', targetValue, 'from', cachedInRange);
          lo = Math.min(hi, betterLo.index + 1);
        }
        // We want to find the first interval (from left) where targetValue < c.min.
        const betterHi = cachedInRange.find(c => targetValue < c.min);
        if (betterHi) {
          // console.log('Found a better hi', hi, betterHi.index - 1, 'for', targetValue, 'from', cachedInRange);
          hi = Math.max(lo, betterHi.index - 1);
        }

        // Check if we can break early due to betterLo/betterHi.
        if (lo >= hi) {
          break;
        }

        const mid = Math.floor((lo + hi) / 2);
        // eslint-disable-next-line no-await-in-loop
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

export async function _rectToRowGroupIndices({ queryClient, store }, parquetPath, tileBbox, allPointsBbox, mortonCodeColumnName) {
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

      // if(mortonIntervals.length >= 10_000) {
      //  // Heuristic. This is too large.
      //  throw new Error('More than 10 thousand morton intervals. Skipping.');
      // }

      // console.log(mortonIntervals);


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
        // eslint-disable-next-line no-unused-vars
        const [startMin, startMax] = mortonIntervals[startIndex];
        // eslint-disable-next-line no-unused-vars
        const [endMin, endMax] = mortonIntervals[endIndex];
        // Check if the start and end intervals span multiple row groups.
        const [rowGroupIndexMin, rowGroupIndexMax] = await Promise.all([
          _bisectRowGroupsRight({ queryClient, store }, parquetPath, mortonCodeColumnName, startMin),
          _bisectRowGroupsRight({ queryClient, store }, parquetPath, mortonCodeColumnName, endMax),
        ]);
        // console.log('Between intervals ', startIndex, endIndex, ' rowGroupIndexMin/max: ', rowGroupIndexMin, rowGroupIndexMax);
        if (rowGroupIndexMin === rowGroupIndexMax) {
          // The intervals are contained within a single row group.
          return [false, [rowGroupIndexMin]];
        }
        if (rowGroupIndexMin + 1 === rowGroupIndexMax || rowGroupIndexMin - 1 === rowGroupIndexMax) {
          // The intervals span two contiguous row groups.
          return [false, [rowGroupIndexMin, rowGroupIndexMax]];
        }
        return [true, null];
      };

      // Begin dividing the intervals in half until we find all of the row groups they span.
      const intervalIndicesToCheck = [[0, mortonIntervals.length - 1]];
      while (intervalIndicesToCheck.length > 0) {
        const [startIndex, endIndex] = intervalIndicesToCheck.pop();
        // eslint-disable-next-line no-await-in-loop
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
            // eslint-disable-next-line no-await-in-loop
            const [rowGroupIndexMin, rowGroupIndexMax] = await Promise.all([
              _bisectRowGroupsRight({ queryClient, store }, parquetPath, mortonCodeColumnName, intervalMin),
              _bisectRowGroupsRight({ queryClient, store }, parquetPath, mortonCodeColumnName, intervalMax),
            ]);
            if (rowGroupIndexMin <= rowGroupIndexMax) {
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
