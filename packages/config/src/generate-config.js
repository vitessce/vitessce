
import { FileType } from '@vitessce/constants-internal';
import { withConsolidated, FetchStore, ZipFileStore, open as zarrOpen, root as zarrRoot } from 'zarrita';

const fileTypeToExtensions = {
    [FileType.IMAGE_OME_TIFF]: ['.ome.tif', '.ome.tiff', '.ome.tf2', '.ome.tf8'],
    [FileType.IMAGE_OME_ZARR]: ['.ome.zarr'],
    [FileType.IMAGE_OME_ZARR_ZIP]: ['.ome.zarr.zip'],
    [FileType.ANNDATA_ZARR]: ['.ad.zarr', '.h5ad.zarr', '.adata.zarr', '.anndata.zarr'],
    [FileType.ANNDATA_ZARR_ZIP]: ['.ad.zarr.zip', '.h5ad.zarr.zip', '.adata.zarr.zip', '.anndata.zarr.zip'],
    // TODO: how to handle h5ad-based AnnData (since needs reference JSON file).
    // Perhaps just assume one H5AD+one JSON (or .ref.json) file correspond to each other?
    [FileType.SPATIALDATA_ZARR]: ['.sd.zarr', '.sdata.zarr', '.spatialdata.zarr'],
    [FileType.SPATIALDATA_ZARR_ZIP]: ['.sd.zarr.zip', '.sdata.zarr.zip', '.spatialdata.zarr.zip'],
};

// This list contains file types that can be mapped to a regular Zarr store
// (e.g., FetchStore or ZipStore).
const ZARR_FILETYPES = [
  FileType.ANNDATA_ZARR,
  FileType.ANNDATA_ZARR_ZIP,
  FileType.SPATIALDATA_ZARR,
  FileType.SPATIALDATA_ZARR_ZIP,
  FileType.IMAGE_OME_ZARR,
  FileType.OBS_SEGMENTATIONS_OME_ZARR,
];

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

    if (!ZARR_FILETYPES.includes(fileType)) {     
      return [];
    }

    let store;
    let promises = [];

    try {
      try {
        store = await withConsolidated(initialStore);
      } catch {
        // Try again with `zmetadata` rather than `.zmetadata`.
        // Reference: https://github.com/zarr-developers/zarr-python/issues/1121
        store = await withConsolidated(initialStore, { metadataKey: 'zmetadata' });
      }
      // Is consolidated.
      const contents = store.contents();
      promises = contents.map(async (value) => {
        const item = await zarrOpen(zarrRoot(store).resolve(value.path));
        return {
          ...value,
          attrs: item.attrs,
        };
      });
    } catch(e) {
      store = initialStore;
      // Is not consolidated.
      const keysToTry = [
        // Note: OME-NGFF metadata is stored in the root attrs.
        '/',
        // AnnData keys
        '/X',
        '/layers',
        '/obs',
        '/var',
        '/obsm',
        '/obsm/spatial',
        '/obsm/X_spatial',
        '/obsm/pca',
        '/obsm/X_pca',
        '/obsm/tsne',
        '/obsm/X_tsne',
        '/obsm/umap',
        '/obsm/X_umap',
        // SpatialData keys
        // Note: For spatialData, we assume the store is always consolidated.
      ];
      promises = keysToTry.map(async (k) => {
        try {
          const item = await zarrOpen(zarrRoot(store).resolve(k));
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

    return (await Promise.all(promises))
      .filter(entry => entry !== null);
}

/**
 * 
 * @param {{ url, fileType, store }[]} parsedUrls 
 * @param {string|null} layoutOption 
 */
export async function generateConfig(parsedUrls, layoutOption = null) {
  const parsedStores = ensureStores(parsedUrls);

}