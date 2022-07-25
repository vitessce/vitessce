import expect from 'expect';
import ObsEmbeddingAnndataLoader from './ObsEmbeddingAnndataLoader';
import { AnnDataSource } from '../../data-sources';
import LoaderResult from '../LoaderResult';

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
  it('load returns obsIndex and obsEmbedding', async () => {
    const loader = createMatrixLoader(
      'http://127.0.0.1:8080/anndata/anndata-dense.zarr',
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
