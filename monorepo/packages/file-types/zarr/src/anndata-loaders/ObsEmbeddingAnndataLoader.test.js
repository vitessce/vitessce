/* eslint-disable func-names */
import ObsEmbeddingAnndataLoader from './ObsEmbeddingAnndataLoader';
import AnnDataSource from '../AnnDataSource';
import { LoaderResult } from '@vitessce/vit-s';

const createMatrixLoader = (url) => {
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

describe('loaders/ObsEmbeddingAnndataLoader', () => {
  it('load returns obsIndex and obsEmbedding', async function () {
    const loader = createMatrixLoader(
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
});
