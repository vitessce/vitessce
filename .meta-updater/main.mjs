import fs from 'node:fs';
import path from 'node:path';
import jsonDiff from 'json-diff-ts';
import { cloneDeep } from 'lodash-es';

const isDryrun = process.env.META_UPDATER_MODE === 'dryrun';
const isVersionOnly = process.env.META_UPDATER_MODE === 'versiononly';



// Mutates package metadata in place
function pinVersions(deps = {}) {
  for (let name of Object.keys(deps)) {

  }
}

function getChangeset(prevJson, newJson) {
  const changeset = jsonDiff.diff(prevJson, newJson);
  return jsonDiff.flattenChangeset(changeset);
}

function checkUpdate(prevJson, newJson, isVersionOnly, dir, filename) {
  const changeset = getChangeset(prevJson, newJson);
  if(isVersionOnly) {
    if(changeset.length > 0) {
      console.log(`Error: found non-version changes for ${filename} in ${dir}`);
      console.log(JSON.stringify(changeset, null, 2));
      process.exit(1);
    }
  }
}

function processUpdate(prevJson, newJson, isDryrun, dir, filename) {
  console.log(`meta-update for ${filename} in ${dir}`);
  // Diff the changes and print.
  const changeset = getChangeset(prevJson, newJson);
  console.log(JSON.stringify(changeset, null, 2));
  if(!isDryrun) {
    // Not a dry-run, return the new JSON.
    return newJson;
  }
  // This is a dry-run, return the old JSON.
  return prevJson;
}

export default (workspaceDir) => {
  console.log("mode:", process.env.META_UPDATER_MODE);
  let root = path.resolve(workspaceDir, 'package.json');
  let meta = JSON.parse(fs.readFileSync(root, { encoding: 'utf-8' }));
  return {
    'package.json': (prevJson, dir) => {
      let newJson = cloneDeep(prevJson);
      pinVersions(newJson.dependencies);
      pinVersions(newJson.devDependencies);
      pinVersions(newJson.peerDependencies);
      checkUpdate(prevJson, newJson, isVersionOnly, dir, 'package.json');
      newJson = { ...newJson, version: meta.version };
      return processUpdate(prevJson, newJson, isDryrun || isVersionOnly, dir, 'package.json');
    },
  };
}
