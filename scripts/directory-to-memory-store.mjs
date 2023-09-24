// Input: path to a Zarr DirectoryStore.
// Output: a JSON file whose contents can be passed
// directly to the JS Map() constructor such that it
// can be used as an in-memory store with Zarrita.
// Usage:
// node scripts/directory-to-memory-store.mjs ./path/to/something.zarr ./path/to/output.json

// To read this store, see code in packages/utils/zarr-utils/base64-store.ts

import { join } from 'node:path';
import { readdir, readFile, writeFile } from 'node:fs/promises';

const inputDir = process.argv[2];
const outputFile = process.argv[3];

// Walk subdirectories to find all files within the zarr store.
// Reference: https://stackoverflow.com/a/45130990
async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield [res, await readFile(res)];
    }
  }
}

async function directoryStoreToJson(inputDir) {
  // Get the list of files in the store.
  const mapContents = [];
  for await (const [filePath, fileContents] of getFiles(inputDir)) {
    const key = `/${filePath.substring(inputDir.length + 1)}`;
    const val = fileContents.toString('base64');
    mapContents.push([key, val]);
  }
  return mapContents;
}

// Main
const mapContents = await directoryStoreToJson(inputDir);
await writeFile(outputFile, JSON.stringify(mapContents, null, 2));