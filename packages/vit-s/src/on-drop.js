import { getFilesFromDataTransferItems } from '@placemarkio/flat-drop-files';
import { generateConfigAlt as generateConfig, parseUrlsFromString } from '@vitessce/config';


// Stores
// This "flat" store can be slow to initialize when the Zarr store contains many files.
class FlatFileSystemStore {
  constructor(files) {
    this.files = files;
  }

  async get(key) {
    // The list of files does not prefix its paths with slashes.
    const file = this.files.find(f => `/${f.relpath}` === key);
    if (!file) return undefined;
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  }

  // TODO: implement getRange
}

/*
// Get a file handle to a file in a directory.
async function resolveFileHandleForPath(
  root, // A root directory from the Web File System API.
  path, // A key to a file in the root directory.
) {
  const dirs = path.split('/');
  const fname = dirs.pop();
  if (!fname) {
    throw new Error('Invalid path');
  }
  for (const dir of dirs) {
    root = await root.getDirectoryHandle(dir);
  }
  // Returns a file handle to the file.
  return root.getFileHandle(fname);
}

// TODO: use this hierarchical store to avoid the issues with flattening the file tree up-front,
// as this store only traverses/accesses the parts of the tree that are needed.
class HierarchicalFileSystemStore {
  constructor(root) {
    // root is a FileSystemDirectoryHandle
    this.root = root;
  }

  async get(key) {
    // TODO: better error handling
    // I believe a missing file will trigger an error here, which we should explicitly
    // catch and return `undefined`
    const fh = await resolveFileHandleForPath(this.root, key.slice(1)).catch(
      () => undefined,
    );
    if (!fh) {
      return undefined;
    }

    const file = await fh.getFile();
    return file.arrayBuffer();
  }

  // TODO: implement getRange
}
*/


export function createOnDrop({ setViewConfig, setStores }) {
  return async (e) => {
    const topLevelEntries = Object.values(e.dataTransfer.items)
      .map(item => item.webkitGetAsEntry());

    // TODO: implement an alternative approach that does not first flatten the file tree,
    // since it can be very large.
    // See https://github.com/manzt/zarrita.js/pull/161/files
    const files = await getFilesFromDataTransferItems(e.dataTransfer.items);

    const stores = topLevelEntries.map((entry) => {
      if (entry.isDirectory) {
        // TODO: optimize by using a single loop for filter+map,
        // and by using .substring (rather than split+slice+join).
        const dirFiles = files
          .filter(f => f.path.split('/')?.[0] === entry.name)
          .map((f) => {
            // eslint-disable-next-line no-param-reassign
            f.relpath = f.path.split('/')?.slice(1).join('/');
            return f;
          });
        // Create a store for each top-level item of e.dataTransfer.items.
        const store = new FlatFileSystemStore(dirFiles);
        return [entry.name, store];
      }
      // This is a single file. Check extension to determine how to create a store.
      if (entry.name.endsWith('.zip')) {
        // Create a zip store.

        // TODO
      } else if (entry.name.endsWith('.tif') || entry.name.endsWith('.tiff')) {
        // Create an OME-TIFF-as-NGFF store?

        // TODO
      } else if (entry.name.endsWith('.csv')) {
        // Create a CSV store?

        // TODO
      } else {
        // Throw?

        // TODO
      }
      return [entry.name, null];
    });

    const parsedUrls = stores.map(([name, store]) => ({
      ...parseUrlsFromString(name)[0],
      store,
    }));
    const { config, stores: storesForConfig } = await generateConfig(parsedUrls);
    const newConfig = config.toJSON();

    setViewConfig(newConfig);
    setStores(storesForConfig);
  };
}
