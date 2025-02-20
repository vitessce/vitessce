/* eslint-disable func-names, camelcase */
import { describe, it, expect } from 'vitest';
import { LoaderResult } from '@vitessce/abstract';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import ObsEmbeddingAnndataLoader from './ObsEmbeddingAnndataLoader.js';
import AnnDataSource from '../AnnDataSource.js';
import MuDataSource from '../MuDataSource.js';
import anndata_0_7_DenseFixture from '../json-fixtures/anndata-0.7/anndata-dense.json';
import mudata_0_2_DenseFixture from '../json-fixtures/mudata-0.2/mudata-dense.json';
import mudata_0_2_DenseUpdatedFixture from '../json-fixtures/mudata-0.2/mudata-dense-updated.json';

const createAnndataLoader = (url, mapContents) => {
  const store = createStoreFromMapContents(mapContents);
  const config = {
    url,
    fileType: 'obsEmbedding.anndata.zarr',
    options: {
      path: 'obsm/X_umap',
    },
    coordinationValues: {
      embeddingType: 'UMAP',
    },
  };
  const source = new AnnDataSource({ ...config, store });
  return new ObsEmbeddingAnndataLoader(source, config);
};

const createMudataLoader = (url, mapContents) => {
  const store = createStoreFromMapContents(mapContents);
  const config = {
    url,
    fileType: 'obsEmbedding.mudata.zarr',
    options: {
      path: 'mod/rna/obsm/X_umap',
    },
    coordinationValues: {
      embeddingType: 'UMAP',
    },
  };
  const source = new MuDataSource({ ...config, store });
  return new ObsEmbeddingAnndataLoader(source, config);
};

describe('loaders/ObsEmbeddingAnndataLoader for AnnData', () => {
  it('load returns obsIndex and obsEmbedding', async () => {
    const loader = createAnndataLoader(
      '@fixtures/zarr/anndata-0.7/anndata-dense.zarr',
      anndata_0_7_DenseFixture,
    );
    const result = await loader.load();
    expect(result).toBeInstanceOf(LoaderResult);
    const payload = result.data;
    expect(Object.keys(payload)).toEqual(['obsIndex', 'obsEmbedding']);
    expect(payload.obsIndex).toEqual(['CTG', 'GCA', 'ACG']);
    expect(payload.obsEmbedding.shape).toEqual([2, 3]);
    expect(Array.from(payload.obsEmbedding.data[0])).toEqual([-1, 0, 1]);
    expect(Array.from(payload.obsEmbedding.data[1])).toEqual([-1, 0, 1]);
  });

  it('load returns obsIndex and obsEmbedding for MuData', async () => {
    const loader = createMudataLoader(
      '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
      mudata_0_2_DenseFixture,
    );
    const result = await loader.load();
    expect(result).toBeInstanceOf(LoaderResult);
    const payload = result.data;
    expect(Object.keys(payload)).toEqual(['obsIndex', 'obsEmbedding']);
    expect(payload.obsIndex).toEqual(['CTG', 'GCA', 'CTT', 'AAA']);
    expect(payload.obsEmbedding.shape).toEqual([2, 4]);
    expect(Array.from(payload.obsEmbedding.data[0])).toEqual([-1, 0, 1, 1]);
    expect(Array.from(payload.obsEmbedding.data[1])).toEqual([-1, 0, 1, 2]);
  });

  it('load returns obsIndex and obsEmbedding for updated MuData', async () => {
    const loader = createMudataLoader(
      '@fixtures/zarr/mudata-0.2/mudata-dense-updated.zarr',
      mudata_0_2_DenseUpdatedFixture,
    );
    const result = await loader.load();
    expect(result).toBeInstanceOf(LoaderResult);
    const payload = result.data;
    expect(Object.keys(payload)).toEqual(['obsIndex', 'obsEmbedding']);
    expect(payload.obsIndex).toEqual(['CTG', 'GCA', 'CTT', 'AAA']);
    expect(payload.obsEmbedding.shape).toEqual([2, 4]);
    expect(Array.from(payload.obsEmbedding.data[0])).toEqual([-1, 0, 1, 1]);
    expect(Array.from(payload.obsEmbedding.data[1])).toEqual([-1, 0, 1, 2]);
  });
});
