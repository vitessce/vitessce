import tsconfig from '../tsconfig.json' assert { type: 'json' };
import { dirname, basename, join } from 'node:path';
import { readdir } from 'node:fs/promises';
import lodash from 'lodash';
const { intersection, difference } = lodash;


async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = join(dir, dirent.name);
    if (dirent.isDirectory() && basename(res) !== "node_modules") {
      yield* getFiles(res);
    } else if (res !== "tsconfig.json" && basename(res) === "tsconfig.json"){
      yield dirname(res);
    }
  }
}

const tsconfigReferences = tsconfig.references.map(r => r.path);
const tsconfigDirs = [];
for await (const f of getFiles('.')) {
  tsconfigDirs.push(f);
}

const intersectionSize = intersection(tsconfigReferences, tsconfigDirs).length;

console.log(intersectionSize === tsconfigReferences.length);
console.log(intersectionSize === tsconfigDirs.length);

console.log(difference(tsconfigDirs, tsconfigReferences))