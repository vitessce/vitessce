import { AbstractAutoConfig } from "./generate-config-helpers.js";

export class AnnDataAutoConfig extends AbstractAutoConfig {
  getOptions() {
    const { zmetadata } = this;
    const options = {
      obsEmbedding: [],
      obsSets: [],
    };

    zmetadata.forEach(({ path, attrs }) => {
      const lowerPath = path.toLowerCase();
      const relPath = path.substring(1);
      // Gene expression matrix.
      if(['/x'].includes(lowerPath)) {
        options.obsFeatureMatrix = {
          path: relPath,

          // TODO: Also check the shape of X.
          // If X is very large, try to initialize initial-filtering properties
          // (will require that /var contains a boolean column however.)
        };
      }

      // Spatial coordinates.
      if(['/obsm/x_spatial', '/obsm/spatial'].includes(lowerPath)) {
        // TODO: use obsSpots instead of obsLocations here?
        options.obsLocations = {
          path: relPath
        };
      }

      // Embedding arrays.
      if (['/obsm/x_umap', '/obsm/umap'].includes(lowerPath)) {
        options.obsEmbedding.push({ path: relPath, embeddingType: 'UMAP' });
      }
      if (['/obsm/x_tsne', '/obsm/tsne'].includes(lowerPath)) {
        options.obsEmbedding.push({ path: relPath, embeddingType: 't-SNE' });
      }
      if (['/obsm/x_pca', '/obsm/pca'].includes(lowerPath)) {
        options.obsEmbedding.push({ path: relPath, embeddingType: 'PCA' });
      }

      // Cell set columns.
      // TODO: use all categorical/string columns of obs instead of this fixed set?
      const supportedObsSetsPaths = [
        'cluster', 'clusters', 'subcluster', 'cell_type', 'celltype',
        'leiden', 'louvain', 'disease', 'organism', 'self_reported_ethnicity',
        'tissue', 'sex',
      ].map(colname => `/obs/${colname}`);
      if(supportedObsSetsPaths.includes(lowerPath)) {
        const name = relPath.split('/').at(-1);
        options.obsSets.push({ path: relPath, name });
      }
    });

    return options;
  }
  
  addFiles(vc, dataset) {
    const { url, fileType } = this;
    dataset.addFile({
      url,
      fileType,
      options: this.getOptions(),
      // TODO: coordination values?
    });
  }

  addViews(vc, layoutOption) {
    // TODO
  }
}

