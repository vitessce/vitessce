// TODO: ts-check

import { FileType } from '@vitessce/constants-internal';
import { withConsolidated, FetchStore, open as zarrOpen, root as zarrRoot } from 'zarrita';
// eslint-disable-next-line import/no-unresolved
import ZipFileStore from '@zarrita/storage/zip';
import { transformEntriesForZipFileStore } from '@vitessce/zarr-utils';
import { VitessceConfig } from './VitessceConfig.js';
// Classes for different types of objects
import { AnnDataAutoConfig } from './generate-config-anndata.js';
import { SpatialDataAutoConfig } from './generate-config-spatialdata.js';
import { OmeAutoConfig } from './generate-config-ome.js';

// TODO: make this a function parameter?
const FILE_TYPE_DELIM = '$';

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

const fileTypeToClass = {
  // OME-TIFF
  [FileType.IMAGE_OME_TIFF]: OmeAutoConfig,
  [FileType.OBS_SEGMENTATIONS_OME_TIFF]: OmeAutoConfig,
  // OME-Zarr
  [FileType.IMAGE_OME_ZARR]: OmeAutoConfig,
  [FileType.IMAGE_OME_ZARR_ZIP]: OmeAutoConfig,
  [FileType.OBS_SEGMENTATIONS_OME_ZARR]: OmeAutoConfig,
  [FileType.OBS_SEGMENTATIONS_OME_ZARR_ZIP]: OmeAutoConfig,
  // AnnData
  [FileType.ANNDATA_ZARR]: AnnDataAutoConfig,
  [FileType.ANNDATA_ZARR_ZIP]: AnnDataAutoConfig,
  // SpatialData
  [FileType.SPATIALDATA_ZARR]: SpatialDataAutoConfig,
  [FileType.SPATIALDATA_ZARR_ZIP]: SpatialDataAutoConfig,
};

// This list contains file types that can be mapped to a regular Zarr store
// (e.g., FetchStore or ZipStore).
const ZARR_FILETYPES = [
  FileType.ANNDATA_ZARR,
  FileType.ANNDATA_ZARR_ZIP,
  FileType.SPATIALDATA_ZARR,
  FileType.SPATIALDATA_ZARR_ZIP,
  FileType.IMAGE_OME_ZARR,
  FileType.IMAGE_OME_ZARR_ZIP,
  FileType.OBS_SEGMENTATIONS_OME_ZARR,
  FileType.OBS_SEGMENTATIONS_OME_ZARR_ZIP,
];

function urlToFileType(url) {
  // TODO: for plain .zarr, we could open the root .attrs and try to guess a fileType
  // (we can probably infer at least whether OME-Zarr vs. AnnData vs. SpatialData).

  const match = Object.entries(fileTypeToExtensions).find(
    // eslint-disable-next-line no-unused-vars
    ([fileType, extensions]) => extensions.some(ext => url.endsWith(ext)),
  );
  if (match) {
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
  if (!ZARR_FILETYPES.includes(fileType)) {
    return null;
  }
  return fileType.endsWith('.zip')
    ? ZipFileStore.fromUrl(url, {
      transformEntries: transformEntriesForZipFileStore,
    })
    : new FetchStore(url);
}

/**
 * Ensure that each object { url, fileType, [store] }
 * contains a `store`.
 * @param {object[]} parsedUrls
 * @returns {object[]}
 */
function ensureStores(parsedUrls) {
  return parsedUrls.map((parsedUrl) => {
    if (parsedUrl.store) {
      return parsedUrl;
    }
    const store = getStore(parsedUrl);
    return {
      ...parsedUrl,
      store,
    };
  });
}

/**
 *
 * @param {string[]} arr
 * @returns {{ url: string, fileType: string }[]} The URLs with file types.
 */
export function parseUrls(arr) {
  return arr.map((urlWithHash) => {
    const parts = urlWithHash.split(FILE_TYPE_DELIM);
    if (parts.length === 1) {
      const [url] = parts;
      return {
        url,
        fileType: urlToFileType(url),
      };
    } if (parts.length === 2) {
      const [url, fileType] = parts;
      return {
        url,
        fileType,
      };
    }
    throw new Error(`Only expected zero or one ${FILE_TYPE_DELIM} character per URL, but received more.`);
  });
}

/**
 *
 * @param {string} s A single string, like this
 * `http://example.com/my_zarr.zarr#anndata.zarr;
 * http://example.com/my_tiff.ome.tif`
 * @returns {{ url: string, fileType: string}[]} The URLs with file types.
 */
export function parseUrlsFromString(s) {
  const urlsWithHashes = s.split(';');
  return parseUrls(urlsWithHashes);
}


export async function parsedUrlToZmetadata(parsedUrl) {
  const { store: initialStore } = parsedUrl;

  if (!initialStore) {
    return null;
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
  } catch {
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
      // TODO: second round of getting metadata for
      // columns listed in /obs and /var .attrs['column-order'] ?

      // SpatialData keys
      // Note: For spatialData, we assume the store is always consolidated.
      // TODO: throw error if spatialdata + not consolidated?
    ];
    promises = keysToTry.map(async (k) => {
      try {
        const item = await zarrOpen(zarrRoot(store).resolve(k));
        return {
          path: k,
          kind: item.kind,
          attrs: item.attrs,
        };
      } catch {
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
 * @return {string[]} The layoutOptions.
 */
export function parsedUrlsToLayoutOptions(parsedUrls) {
  // eslint-disable-next-line no-unused-vars
  const parsedStores = ensureStores(parsedUrls);

  // TODO: implement
}

/**
 *
 * @param {{ url, fileType, store }[]} parsedUrls
 * @param {string|null} layoutOption
 */
export async function generateConfig(parsedUrls, layoutOption = null) {
  // Map each URL to a Zarr store.
  const parsedStores = ensureStores(parsedUrls);

  // Obtain Zarr consolidated_metadata for each store.
  const zmetadataStores = await Promise.all(
    parsedStores.map(async parsedStore => ({
      ...parsedStore,
      zmetadata: await parsedUrlToZmetadata(parsedStore),
    })),
  );

  // Create configuration instance.
  const vc = new VitessceConfig({
    schemaVersion: '1.0.17',
    name: 'Automatically-generated configuration.',
    // TODO: write a description based on what is known
    // (fileType(s) and maybe layoutOption).
    description: 'Populate with a description of this visualization.',
  });

  // Create datasets.
  // TODO: cases in which more than one dataset should be created?
  const dataset = vc.addDataset('Main dataset');

  zmetadataStores.forEach((parsedStore) => {
    const { fileType } = parsedStore;
    const AutoConfigClass = fileTypeToClass[fileType];
    const autoConfig = new AutoConfigClass(parsedStore);

    autoConfig.addFiles(vc, dataset);
    // TODO: add all files, then add all views (in two separate loops)?
    autoConfig.addViews(vc, dataset, layoutOption);
  });

  const stores = Object.fromEntries(
    // Here, we use `parsedUrls` rather than `parsedStores`
    // so that we do not provide more stores than intended
    // (i.e., we do not provide stores which were solely created
    // to obtain zmetadata).
    parsedUrls
      .filter(d => d.store)
      .map(d => ([d.url, d.store])),
  );

  // Return both the config and the `stores` url-to-store dict.
  return {
    config: vc,
    stores,
  };
}
