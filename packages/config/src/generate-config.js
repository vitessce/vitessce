
import { FileType } from '@vitessce/constants-internal';
import { withConsolidated, FetchStore, ZipFileStore } from 'zarrita';

const fileTypeToExtensions = {
    [FileType.IMAGE_OME_TIFF]: ['.ome.tif', '.ome.tiff', '.ome.tf2', '.ome.tf8'],
    [FileType.ANNDATA_ZARR]: ['.h5ad.zarr', '.adata.zarr', '.anndata.zarr'],
    [FileType.ANNDATA_ZARR_ZIP]: ['.h5ad.zarr.zip', '.adata.zarr.zip', '.anndata.zarr.zip'],
    [FileType.IMAGE_OME_ZARR]: ['.ome.zarr'],
};

function urlToFileType(url) {
  const match = Object.entries(fileTypeToExtensions)
    .find(([fileType, extensions]) => extensions.some(ext => url.endsWith(ext)));
  if(match) {
    return match[0];
  }
  throw new Error('The file extension contained in the URL did not map to a supported fileType.');
}

/**
 * 
 * @param {string} s A single string, like this
 * `http://example.com/my_zarr.zarr#anndata.zarr;
 * http://example.com/my_tiff.ome.tif`
 * @returns {{ url: string, fileType: string}[]} The URLs with file types.
 */
export function parseUrls(s) {
  const urlsWithHashes = s.split(';');
  return urlsWithHashes.map(urlWithHash => {
    const parts = urlWithHash.split('#');
    if(parts.length === 1) {
      const [url] = parts;
      return {
        url,
        fileType: urlToFileType(url),
      };
    } else if(parts.length === 2) {
      const [url, fileType] = parts;
      return {
        url,
        fileType,
      };
    } else {
      throw new Error('Only expected zero or one # character per URL, but received more.');
    }
  });
}

export function parsedUrlsToLayoutOptions(parsedUrls) {

}

export async function parsedUrlToZmetadata(parsedUrl) {
    const { url, fileType } = parsedUrl;

    if (fileType === FileType.ANNDATA_ZARR || fileType === FileType.ANNDATA_ZARR_ZIP) {
        const initialStore = fileType.endsWith('.zip') ? ZipFileStore.fromUrl(url) : new FetchStore(url);
        
        try {
            const store = await withConsolidated(initialStore);
            // Is consolidated.
            const contents = store.contents();
            const promises = contents.map(async (value) => {
                const item = await zarrOpen(store.resolve(value.path));
                return {
                    ...value,
                    attrs: item.attrs,
                };
            });
            return Promise.all(promises);
        } catch(e) {
            // Is not consolidated.
            const keysToTry = [
                'X',
                'layers',
                'obs',
                'var',
                'obsm',
                'obsm/spatial',
                'obsm/X_spatial',
                'obsm/pca',
                'obsm/X_pca',
                'obsm/tsne',
                'obsm/X_tsne',
                'obsm/umap',
                'obsm/X_umap',
            ];
            const promises = keysToTry.map(async (k) => {
                const item = await zarrOpen(initialStore.resolve(k));
                return {
                    path: k,
                    kind: item.kind,
                    attrs: item.attrs,
                };
            });
            return Promise.all(promises);
        }
    }

}

export async function generateConfig(parsedUrls, layoutOption = null) {

}