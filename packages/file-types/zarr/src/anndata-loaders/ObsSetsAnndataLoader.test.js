/* eslint-disable func-names, camelcase */
import { describe, it, expect } from 'vitest';
import { LoaderResult } from '@vitessce/abstract';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import ObsSetsAnndataLoader from './ObsSetsAnndataLoader.js';
import AnnDataSource from '../AnnDataSource.js';
import anndata_0_7_DenseFixture from '../json-fixtures/anndata-0.7/anndata-dense.json';
import anndata_0_8_DenseFixture from '../json-fixtures/anndata-0.8/anndata-dense.json';
import anndata_0_12_DenseFixture from '../json-fixtures/anndata-0.12/anndata-dense.json';

const createLoader = (version, fixture, obsSets) => {
  const store = createStoreFromMapContents(fixture);
  const config = {
    url: `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
    fileType: 'obsSets.anndata.zarr',
    options: { obsSets },
  };
  const source = new AnnDataSource({ ...config, store });
  return { loader: new ObsSetsAnndataLoader(source, config), source };
};

const LEIDEN_OPTIONS = [{ name: 'Leiden', path: 'obs/leiden' }];

describe('loaders/ObsSetsAnndataLoader', () => {
  Object.entries({
    0.7: anndata_0_7_DenseFixture,
    0.8: anndata_0_8_DenseFixture,
    0.12: anndata_0_12_DenseFixture,
  }).forEach(([version, fixture]) => {
    describe(`AnnData v${version}`, () => {
      it('codes route produces the same tree and membership as the string route', async () => {
        const { loader: codesLoader } = createLoader(version, fixture, LEIDEN_OPTIONS);
        const { loader: stringLoader, source: stringSource } = createLoader(
          version, fixture, LEIDEN_OPTIONS,
        );
        // Force the reference loader onto the string-based route.
        stringSource.loadObsColumnCodes = null;

        const codesResult = await codesLoader.load();
        const stringResult = await stringLoader.load();
        expect(codesResult).toBeInstanceOf(LoaderResult);

        // The tree must be byte-identical between routes.
        expect(codesResult.data.obsSets).toEqual(stringResult.data.obsSets);
        expect(codesResult.data.obsIndex).toEqual(stringResult.data.obsIndex);
        // Membership answers must agree for every observation.
        codesResult.data.obsIndex.forEach((obsId) => {
          expect(codesResult.data.obsSetsMembership.get(obsId))
            .toEqual(stringResult.data.obsSetsMembership.get(obsId));
        });
        // Initial coordination values (auto selections/colors) must agree.
        expect(codesResult.coordinationValues).toEqual(stringResult.coordinationValues);

        // Only the codes route carries raw columns for the view fast path.
        expect(codesResult.data.obsSetsColumns).toBeDefined();
        expect(stringResult.data.obsSetsColumns).toEqual(undefined);
        const { obsIndex, columns } = codesResult.data.obsSetsColumns;
        expect(columns.length).toEqual(1);
        expect(columns[0].path).toEqual(['Leiden']);
        expect(Array.from(columns[0].codes).length).toEqual(obsIndex.length);
      });
    });
  });

  it('falls back to the string route when a scorePath is present', async () => {
    const { loader } = createLoader('0.8', anndata_0_8_DenseFixture, [
      { name: 'Leiden', path: 'obs/leiden', scorePath: 'obs/leiden' },
    ]);
    const result = await loader.load();
    expect(result.data.obsSetsColumns).toEqual(undefined);
    expect(result.data.obsSets.tree.length).toEqual(1);
  });

  it('falls back to the string route for multi-level path arrays', async () => {
    const { loader } = createLoader('0.8', anndata_0_8_DenseFixture, [
      { name: 'Leiden', path: ['obs/leiden'] },
    ]);
    const result = await loader.load();
    expect(result.data.obsSetsColumns).toEqual(undefined);
    expect(result.data.obsSets.tree.length).toEqual(1);
  });

  it('falls back to the string route for non-categorical columns', async () => {
    const { loader } = createLoader('0.8', anndata_0_8_DenseFixture, [
      { name: 'Index', path: 'obs/_index' },
    ]);
    const result = await loader.load();
    expect(result.data.obsSetsColumns).toEqual(undefined);
    expect(result.data.obsSets.tree.length).toEqual(1);
  });
});
