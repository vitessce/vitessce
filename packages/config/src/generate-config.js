
import { FileType } from '@vitessce/constants-internal';
import { withConsolidated, FetchStore, ZipFileStore, open as zarrOpen, root as zarrRoot } from 'zarrita';

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
 * @param {{ fileType, url }} parsedUrl
 * @returns {Readable}
 */
function getStore(parsedUrl) {
  const { fileType, url } = parsedUrl;
  return fileType.endsWith('.zip')
    ? ZipFileStore.fromUrl(url)
    : new FetchStore(url);
}

/**
 * Ensure that each object { url, fileType, [store] }
 * contains a `store`.
 * @param {object[]} parsedUrls 
 * @returns {object[]}
 */
function ensureStores(parsedUrls) {
  return parsedUrls.map(parsedUrl => {
    if(parsedUrl.store) {
      return parsedUrl
    } else {
      const store = getStore(parsedUrl);
      return {
        ...parsedUrl,
        store,
      };
    }
  });
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

/**
 * 
 * @param {{ url, fileType, store }[]} parsedUrls
 * @return {string[]} The layoutOptions.
 */
export function parsedUrlsToLayoutOptions(parsedUrls) {
  const parsedStores = ensureStores(parsedUrls);
  
}

export async function parsedUrlToZmetadata(parsedUrl) {
    const { fileType, store: initialStore } = parsedUrl;

    let promises = [];

    if (fileType === FileType.ANNDATA_ZARR || fileType === FileType.ANNDATA_ZARR_ZIP || fileType === FileType.SPATIALDATA_ZARR || fileType === FileType.SPATIALDATA_ZARR_ZIP) {        
        try {
            const store = await withConsolidated(initialStore);
            // Is consolidated.
            const contents = store.contents();
            promises = contents.map(async (value) => {
                const item = await zarrOpen(store.resolve(value.path));
                return {
                    ...value,
                    attrs: item.attrs,
                };
            });
        } catch(e) {
            // Is not consolidated.
            const keysToTry = [
                // AnnData keys
                '',
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
                // TODO: split up keys for anndata vs. spatialdata vs. ...
                // TODO: for spatialdata, the keys will sometimes depend on the names of the elements, for example 'tables/{table_name}/obs
                'images',
                'labels',
                'points',
                'shapes',
                'tables',
            ];
            // TODO: also get the metadata for the root.
            promises = keysToTry.map(async (k) => {
              try {
                const item = await zarrOpen(zarrRoot(initialStore).resolve(k));
                return {
                  path: k,
                  kind: item.kind,
                  attrs: item.attrs,
                };
              } catch(e) {
                return null;
              }
            });
        }
    }

    const zmetadata = await Promise.all(promises);
    return zmetadata.filter(entry => entry !== null);

}



/**
 * 
 * @param {{ url, fileType, store }[]} parsedUrls 
 * @param {string|null} layoutOption 
 */
export async function generateConfig(parsedUrls, layoutOption = null) {
  const parsedStores = ensureStores(parsedUrls);

}