// Purpose: check that all subdirectories with tsconfig.json files are referenced
// from the root tsconfig.json.
// Reference: https://www.typescriptlang.org/docs/handbook/project-references.html
import tsconfig from '../tsconfig.json' with { type: 'json' };
import { dirname, basename, join, normalize } from 'node:path';
import { readdir } from 'node:fs/promises';
import { difference } from 'lodash-es';

// Walk subdirectories to find all non-root tsconfig.json files.
// Reference: https://stackoverflow.com/a/45130990
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

// Get the list of subdirectories referenced from the root tsconfig.json.
const tsconfigReferences = tsconfig.references.map(r => normalize(r.path));
// Get the list of subdirectories that actually have tsconfig.json files.
const tsconfigDirs = [];
for await (const f of getFiles('.')) {
  tsconfigDirs.push(f);
}

// Take the set difference.
const diff = difference(tsconfigDirs, tsconfigReferences);
// Throw error if necessary.
if (diff.length > 0) {
  console.error("Error: expected all directories with tsconfig.json files to be included in the Project References.");
  console.error(JSON.stringify(diff), "were not referenced.");
  process.exit(1);
}
