import fs from 'node:fs';
import path from 'node:path';
import jsonDiff from 'json-diff-ts';
import { cloneDeep } from 'lodash-es';

const isDryrun = process.env.META_UPDATER_MODE === 'dryrun';
const isVersionOnly = process.env.META_UPDATER_MODE === 'versiononly';

const LUMAGL_VERSION = '~8.5.16';
const LOADERSGL_VERSION = "^3.0.0";
const DECKGL_VERSION = '~8.8.6';
const TURF_VERSION = "^6.5.0";
const NEBULAGL_VERSION = "0.23.8";
const OTHER_VERSIONS = {
  'lodash-es': '^4.17.21',
  'react-grid-layout-with-lodash': '^1.3.5',
  "internmap": "^2.0.3",
  "uuid": "^9.0.0",
  "@zarrita/core": "^0.0.3",
  "@zarrita/indexing": "^0.0.3",
  "@zarrita/storage": "^0.0.2",
  "zustand": "^3.5.10",
  "@hms-dbmi/viv": "~0.13.7",
  "clsx": "^1.1.1",
  "d3-array": "^2.4.0",
  "d3-dsv": "^1.1.1",
  "d3-force": "^2.1.1",
  "d3-quadtree": "^1.0.7",
  "d3-scale-chromatic": "^1.3.3",
  "pluralize": "^8.0.0",
  "@material-ui/core": "~4.12.3",
  "@material-ui/icons": "~4.11.2",
  "math.gl": "^3.5.6",
  "@math.gl/core": "^3.5.6",
  "mathjs": "^9.2.0",
  "zod": "^3.21.4",
  "react-aria": "^3.28.0",
  "semver": "^7.3.8",
  "vite": "^4.3.0",
  "@vitejs/plugin-react": "^4.0.0",
  "vitest": "^0.32.2",
  "@testing-library/jest-dom": "^5.16.4",
  "@testing-library/react": "^13.3.0",
  "@testing-library/react-hooks": "^8.0.1",
  "@testing-library/user-event": "^14.2.1",

  // LumaGL
  "@luma.gl/constants": LUMAGL_VERSION,
  "@luma.gl/core": LUMAGL_VERSION,
  "@luma.gl/engine": LUMAGL_VERSION,
  "@luma.gl/gltools": LUMAGL_VERSION,
  "@luma.gl/shadertools": LUMAGL_VERSION,
  "@luma.gl/experimental": LUMAGL_VERSION,
  "@luma.gl/webgl": LUMAGL_VERSION,
  // DeckGL
  "deck.gl": DECKGL_VERSION,
  "@deck.gl/core": DECKGL_VERSION,
  "@deck.gl/geo-layers": DECKGL_VERSION,
  "@deck.gl/mesh-layers": DECKGL_VERSION,
  "@deck.gl/aggregation-layers": DECKGL_VERSION,
  "@deck.gl/extensions": DECKGL_VERSION,
  "@deck.gl/layers": DECKGL_VERSION,
  "@deck.gl/react": DECKGL_VERSION,
  // NebulaGL
  "nebula.gl": NEBULAGL_VERSION,
  "@nebula.gl/layers": NEBULAGL_VERSION,
  "@nebula.gl/edit-modes": NEBULAGL_VERSION,
  // LoadersGL
  "@loaders.gl/3d-tiles": LOADERSGL_VERSION,
  "@loaders.gl/core": LOADERSGL_VERSION,
  "@loaders.gl/images": LOADERSGL_VERSION,
  "@loaders.gl/loader-utils":LOADERSGL_VERSION,
};

// Mutates package metadata in place
function pinVersions(deps = {}) {
  for (let name of Object.keys(deps)) {
    /*if (name === 'react' || name === 'react-dom') {
      deps[name] = REACT_VERSION;
    }*/
    if (name.startsWith('@deck.gl/') || name === "deck.gl") {
      deps[name] = DECKGL_VERSION;
    }
    if (name.startsWith('@luma.gl/') || name === "luma.gl") {
      deps[name] = LUMAGL_VERSION;
    }
    if (name.startsWith('@loaders.gl/') || name === "loaders.gl") {
      deps[name] = LOADERSGL_VERSION;
    }
    if (name.startsWith('@nebula.gl/') || name === "nebula.gl") {
      deps[name] = NEBULAGL_VERSION;
    }
    if (name.startsWith('@turf/')) {
      deps[name] = TURF_VERSION;
    }
    if (Object.keys(OTHER_VERSIONS).includes(name)) {
      deps[name] = OTHER_VERSIONS[name];
    }
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
