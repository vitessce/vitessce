import { describe, expect, it } from 'vitest';
import { expandAnndataZarr, } from './joint-file-types.js';
describe('src/app/joint-file-types.js', () => {
    describe('expandAnndataZarr', () => {
        it('fails to expand when there are no options', () => {
            expect(expandAnndataZarr({
                fileType: 'anndata.zarr',
                url: 'http://localhost:8000/anndata.zarr',
            })).toEqual([]);
        });
        it('expands when there is an obsEmbedding object', () => {
            expect(expandAnndataZarr({
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
            })).toEqual([
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
            expect(expandAnndataZarr({
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
            })).toEqual([
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
