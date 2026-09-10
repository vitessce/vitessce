/* eslint-disable no-console */
import { describe, it, expect } from 'vitest';
import * as setsUtils from '@vitessce/sets-utils';
import AnnDataSource from './AnnDataSource.js';
import ObsSetsAnndataLoader from './anndata-loaders/ObsSetsAnndataLoader.js';
import ObsEmbeddingAnndataLoader from './anndata-loaders/ObsEmbeddingAnndataLoader.js';

const URL_BASE = 'https://storage.googleapis.com/vitessce-demo-data/salcher-2022/salcher_2022_extended.h5ad.zarr';
const IS_NEW = typeof setsUtils.colorIndicesFromCodes === 'function';

const requests = [];
const realFetch = globalThis.fetch;

function stats(from) {
  const slice = requests.slice(from);
  const unique = new Set(slice).size;
  return { requests: slice.length, duplicates: slice.length - unique };
}

function bench(fn, iters = 3) {
  let best = Infinity;
  let out;
  for (let i = 0; i < iters; i += 1) {
    const t0 = performance.now();
    out = fn();
    best = Math.min(best, performance.now() - t0);
  }
  return { ms: Math.round(best), out };
}

function groupArray(group, key) {
  return typeof group?.get === 'function' ? group.get(key) : group?.[key];
}

function sumStratifyArraysCells(m) {
  let n = 0;
  m.forEach(bySample => bySample.forEach((group) => {
    n += groupArray(group, 'obsEmbeddingX').length;
  }));
  return n;
}

function sumExprValues(m) {
  let n = 0;
  m.forEach(bySample => bySample.forEach(byGene => byGene.forEach((vals) => { n += vals.length; })));
  return n;
}

describe('salcher-2022 benchmark', () => {
  it('measures load and interaction paths', async () => {
    globalThis.fetch = (url, opts) => { requests.push(String(url)); return realFetch(url, opts); };
    const results = { route: IS_NEW ? 'branch' : 'main' };

    const dataSource = new AnnDataSource({ url: URL_BASE, fileType: 'anndata.zarr' });

    // S1: obs sets load (obsIndex + tree + membership/columns), as the app loads it.
    let mark = requests.length;
    let t0 = performance.now();
    const obsSetsLoader = new ObsSetsAnndataLoader(dataSource, {
      url: URL_BASE,
      fileType: 'obsSets.anndata.zarr',
      options: { obsSets: [{ name: 'Cell Type', path: 'obs/cell_type' }] },
    });
    const obsSetsResult = await obsSetsLoader.load();
    results.s1_obsSetsLoad = { ms: Math.round(performance.now() - t0), ...stats(mark) };
    const { obsIndex, obsSets, obsSetsColumns } = obsSetsResult.data;
    const numObs = obsIndex.length;
    expect(numObs).toEqual(1283972);

    // Drain deferred idle work before timing S2. The branch schedules the
    // shared obsIndexMap build via whenIdle (requestIdleCallback in browsers);
    // in Node that falls back to setTimeout(0) and would otherwise be
    // misattributed to whatever awaits next. No-op on main.
    await new Promise((resolve) => { setTimeout(resolve, 2000); });

    // S2: embedding load (UMAP).
    mark = requests.length;
    t0 = performance.now();
    const embLoader = new ObsEmbeddingAnndataLoader(dataSource, {
      url: URL_BASE,
      fileType: 'obsEmbedding.anndata.zarr',
      options: { path: 'obsm/X_umap' },
    });
    const embResult = await embLoader.load();
    results.s2_embeddingLoad = { ms: Math.round(performance.now() - t0), ...stats(mark) };
    const { obsEmbedding } = embResult.data;

    const merged = setsUtils.mergeObsSets(obsSets, null);
    const setNames = obsSets.tree[0].children.map(c => c.name);
    const selectedPaths = setNames.map(n => ['Cell Type', n]);
    const setColor = selectedPaths.map((path, i) => (
      { path, color: [(i * 37) % 255, (i * 91) % 255, (i * 151) % 255] }
    ));
    results.numSets = setNames.length;

    const geneCol = new Float32Array(numObs);
    for (let i = 0; i < numObs; i += 1) geneCol[i] = ((i * 2654435761) % 97) / 7;

    // S3: color encoding with all sets selected (recomputed per selection/color change).
    if (IS_NEW && obsSetsColumns) {
      const r = bench(() => setsUtils.colorIndicesFromCodes({
        columns: obsSetsColumns.columns,
        obsIndex,
        selectedNamePaths: selectedPaths,
        cellSetColor: setColor,
        theme: 'dark',
      }));
      results.s3_colorEncoding = { ms: r.ms, route: 'colorIndicesFromCodes', ok: r.out !== null };
    } else {
      const r = bench(() => {
        const cellColors = setsUtils.getCellColors({
          cellSets: merged,
          cellSetSelection: selectedPaths,
          cellSetColor: setColor,
          obsIndex,
          theme: 'dark',
        });
        // The subscriber derives cellSelection from the map whenever it changes.
        return Array.from(cellColors.keys()).length;
      });
      results.s3_colorEncoding = { ms: r.ms, route: 'getCellColors+keys', ok: r.out === numObs };
    }

    // S4/S5: stratifyArrays for the contour layer.
    const arrays = () => ({
      obsEmbeddingX: obsEmbedding.data[0],
      obsEmbeddingY: obsEmbedding.data[1],
      featureValue: [geneCol],
    });
    const strat = cellSetSelection => (IS_NEW
      ? setsUtils.stratifyArrays(
        undefined, undefined, undefined, obsIndex, merged, cellSetSelection,
        arrays(), 'first', { obsSetsColumns },
      )
      : setsUtils.stratifyArrays(
        undefined, null, undefined, undefined, obsIndex, merged, cellSetSelection,
        arrays(), 'first',
      ));
    // The branch returns [map, cellCount]; main returns the bare map.
    const placed = out => (Array.isArray(out) ? out[1] : sumStratifyArraysCells(out));
    let r = bench(() => strat(null));
    results.s4_stratifyArrays_noSelection = { ms: r.ms, cellsPlaced: placed(r.out) };
    r = bench(() => strat(selectedPaths));
    results.s5_stratifyArrays_allSets = { ms: r.ms, cellsPlaced: placed(r.out) };

    // S6: stratifyExpressionData for violin/dot plots, all sets, one gene.
    r = bench(() => setsUtils.stratifyExpressionData(
      undefined, undefined, undefined, [geneCol], obsIndex, merged,
      ['gene'], selectedPaths, setColor, null, null,
      IS_NEW ? { obsSetsColumns } : undefined,
    ));
    results.s6_stratifyExpressionData_allSets = {
      ms: r.ms, values: sumExprValues(r.out[0]), exprMax: r.out[1],
    };

    console.log(`BENCH_RESULTS ${JSON.stringify(results, null, 2)}`);
    globalThis.fetch = realFetch;
    expect(true).toEqual(true);
  }, 900_000);
});
