/* eslint-disable func-names */
import { LoaderResult } from '@vitessce/vit-s';
import ObsEmbeddingAnndataLoader from './ObsEmbeddingAnndataLoader';
import AnnDataSource from '../AnnDataSource';

const createAnndataLoader = (url) => {
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
  const source = new AnnDataSource(config);
  return new ObsEmbeddingAnndataLoader(source, config);
};

const createMudataLoader = (url) => {
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
  const source = new AnnDataSource(config);
  return new ObsEmbeddingAnndataLoader(source, config);
};

describe('loaders/ObsEmbeddingAnndataLoader for AnnData', () => {
  it('load returns obsIndex and obsEmbedding', async () => {
    const loader = createAnndataLoader(
      'http://localhost:51204/@fixtures/zarr/anndata-0.7/anndata-dense.zarr',
    );
    const result = await loader.load();
    expect(result).toBeInstanceOf(LoaderResult);
    const payload = result.data;
    expect(Object.keys(payload)).toEqual(['obsIndex', 'obsEmbedding']);
    expect(payload.obsIndex).toEqual(['CTG', 'GCA', 'CTG']);
    expect(payload.obsEmbedding.shape).toEqual([2, 3]);
    expect(Array.from(payload.obsEmbedding.data[0])).toEqual([-1, 0, 1]);
    expect(Array.from(payload.obsEmbedding.data[1])).toEqual([-1, 0, 1]);
  });

  it('load returns obsIndex and obsEmbedding for MuData', async () => {
    const loader = createMudataLoader(
      'http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
    );
    const result = await loader.load();
    expect(result).toBeInstanceOf(LoaderResult);
    const payload = result.data;
    expect(Object.keys(payload)).toEqual(['obsIndex', 'obsEmbedding']);
    expect(payload.obsIndex).toEqual(['CTG', 'GCA', 'CTT']);
    expect(payload.obsEmbedding.shape).toEqual([2, 3]);
    expect(Array.from(payload.obsEmbedding.data[0])).toEqual([-1, 0, 1]);
    expect(Array.from(payload.obsEmbedding.data[1])).toEqual([-1, 0, 1]);
  });
});
