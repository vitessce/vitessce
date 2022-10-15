import {
  FileType,
  FILE_TYPE_DATA_TYPE_MAPPING,
} from '@vitessce/constants-internal';
import { JOINT_FILE_TYPES, expandAnndataZarr } from './joint-file-types';


describe('src/app/joint-file-types.js', () => {
  describe('FileType-to-DataType mappings', () => {
    it('every file type is mapped to either a data type or a joint file type expansion function', () => {
      const fileTypes = Object.values(FileType).sort();
      const mappedFileTypes = [
        ...Object.keys(FILE_TYPE_DATA_TYPE_MAPPING),
        ...Object.keys(JOINT_FILE_TYPES),
      ].sort();
      expect(fileTypes.length).toEqual(mappedFileTypes.length);
      expect(fileTypes).toEqual(mappedFileTypes);
    });
  });
  describe('expandAnndataZarr', () => {
    it('fails to expand when there are no options', () => {
      expect(() => expandAnndataZarr({
        fileType: 'anndata.zarr',
        url: 'http://localhost:8000/anndata.zarr',
      })).toThrow();
    });
    it('expands when there is an obsEmbedding object', () => {
      expect(
        expandAnndataZarr({
          fileType: 'anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            obsLabels: {
              path: 'obs/spot_name',
            },
            featureLabels: {
              path: 'var/gene_symbol',
            },
            obsEmbedding: {
              path: 'obsm/pca',
              dims: [2, 4],
            },
          },
          coordinationValues: {
            obsType: 'spot',
            featureType: 'transcript',
            obsLabelsType: 'spotName',
            featureLabelsType: 'geneSymbol',
            embeddingType: 'PCA',
          },
        }),
      ).toEqual([
        {
          fileType: 'obsEmbedding.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/pca',
            dims: [2, 4],
          },
          coordinationValues: {
            obsType: 'spot',
            embeddingType: 'PCA',
          },
        },
        {
          fileType: 'obsLabels.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obs/spot_name',
          },
          coordinationValues: {
            obsType: 'spot',
            obsLabelsType: 'spotName',
          },
        },
        {
          fileType: 'featureLabels.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'var/gene_symbol',
          },
          coordinationValues: {
            featureType: 'transcript',
            featureLabelsType: 'geneSymbol',
          },
        },
      ]);
    });
    it('expands when there is an obsEmbedding array of objects', () => {
      expect(
        expandAnndataZarr({
          fileType: 'anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            obsLocations: {
              path: 'obsm/xy',
            },
            obsEmbedding: [
              {
                path: 'obsm/pca',
                dims: [2, 4],
                embeddingType: 'PCA',
              },
              {
                path: 'obsm/umap',
                embeddingType: 'UMAP',
              },
            ],
          },
        }),
      ).toEqual([
        {
          fileType: 'obsLocations.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/xy',
          },
          coordinationValues: {
            obsType: 'cell',
          },
        },
        {
          fileType: 'obsEmbedding.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/pca',
            dims: [2, 4],
          },
          coordinationValues: {
            obsType: 'cell',
            embeddingType: 'PCA',
          },
        },
        {
          fileType: 'obsEmbedding.anndata.zarr',
          url: 'http://localhost:8000/anndata.zarr',
          options: {
            path: 'obsm/umap',
          },
          coordinationValues: {
            obsType: 'cell',
            embeddingType: 'UMAP',
          },
        },
      ]);
    });
  });
});
