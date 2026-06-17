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

  async getRange(key, range) {
    // The list of files does not prefix its paths with slashes.
    const file = this.files.find(f => `/${f.relpath}` === key);
    if (!file) return undefined;
    const buffer = await file.arrayBuffer();
    if ('suffixLength' in range) {
      const { suffixLength } = range;
      return new Uint8Array(buffer, buffer.byteLength - suffixLength, suffixLength);
    }
    if ('offset' in range && 'length' in range) {
      const { offset, length } = range;
      return new Uint8Array(buffer, offset, length);
    }
    throw new Error('Invalid rangeQuery value.');
  }
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


/**
 * Create an event handler for either dropzone or input type="file" elements.
 * @param {object} setters - The parameters for the drop event handler.
 * @param {function} setters.setViewConfig - A function to set the view config.
 * @param {function} setters.setStores - A function to set the stores.
 * @param {boolean} isFileInput - Whether the drop zone is for file input.
 * By default, false.
 * @param {boolean} isConfigInput - Whether the drop zone is for config input.
 * By default, false.
 * @returns A drop event handler async function.
 */
export function createOnDrop(
  setters,
  isFileInput = false,
  isConfigInput = false,
) {
  return async (e) => {
    const { setViewConfig, setStores } = setters;
    let topLevelEntries;
    let files;
    if (isFileInput) {
      // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop

      // Note: e.target.files is a FileList, not an array.
      // If we use the spread operator, the methods like file.arrayBuffer() get lost.
      files = Array.from(e.target.files);
      // Here, we use files.forEach rather than files = files.map
      // so that we can modify the original array in place.
      files.forEach((f, i) => {
        if (!f.path) {
          // eslint-disable-next-line no-param-reassign
          files[i].path = files[i].webkitRelativePath;
        }
      });
      // When a user selects a directory via a file picker dialog,
      // we get only a flat list of files.
      // In order to match e.dataTransfer.items behavior,
      // we create fake top-level entries for each unique directory/file name.
      const dirNames = new Set();
      topLevelEntries = [];
      Array.from(files).forEach((file) => {
        const dirName = file.path.split('/')[0];
        if (dirName) {
          dirNames.add(dirName);
        }
        // If the file is at the top level (no directory),
        // we need to add a top-level entry for it.
        if (dirName === file.name) {
          topLevelEntries.push({
            isDirectory: false,
            name: file.name,
          });
        }
      });
      topLevelEntries = topLevelEntries.concat(Array.from(dirNames).map(name => ({
        isDirectory: true,
        name,
      })));
    } else {
      topLevelEntries = Object.values(e.dataTransfer.items)
        .map(item => item.webkitGetAsEntry());
      files = await getFilesFromDataTransferItems(e.dataTransfer.items);
    }

    if (isConfigInput) {
      // We expect a single file which contains the config JSON.
      if (files.length === 1) {
        const file = files[0];
        if (file.name.endsWith('.json')) {
          const content = await file.arrayBuffer();
          // Alternatively, use the FileReader API.
          const json = JSON.parse(new TextDecoder().decode(content));
          setViewConfig(json);
          return;
        }
      }
    }

    // TODO: implement an alternative approach that does not first flatten the file tree,
    // since it can be very large.
    // See https://github.com/manzt/zarrita.js/pull/161/files

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
