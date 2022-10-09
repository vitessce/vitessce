import fs from 'node:fs';
import path from 'node:path';

const LUMAGL_VERSION = '8.5.10';
const LOADERSGL_VERSION = "^3.0.0";
const DECKGL_VERSION = '8.6.7';
const TURF_VERSION = "^6.5.0";
const NEBULAGL_VERSION = "0.23.8";
const OTHER_VERSIONS = {
  "ajv": "^6.10.0",
  'lodash': '^4.17.21',
  'react-grid-layout': '^1.3.4',
  "internmap": "^2.0.3",
  "uuid": "^3.3.2",
  "zarr": "0.5.1",
  "zustand": "^3.5.10",
  "@hms-dbmi/viv": "~0.12.6",
  "clsx": "^1.1.1",
  "d3-array": "^2.4.0",
  "d3-dsv": "^1.1.1",
  "d3-force": "^2.1.1",
  "d3-quadtree": "^1.0.7",
  "d3-scale-chromatic": "^1.3.3",
  "plur": "^5.1.0",
  "@material-ui/core": "~4.12.3",
  "@material-ui/icons": "~4.11.2",
  "math.gl": "^3.5.6",
  "mathjs": "^9.2.0",

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
    if (name.startsWith('@math.gl/') || name === "math.gl") {
      deps[name] = MATHGL_VERSION;
    }
    if (name.startsWith('@turf/')) {
      deps[name] = TURF_VERSION;
    }
    if (Object.keys(OTHER_VERSIONS).includes(name)) {
      deps[name] = OTHER_VERSIONS[name];
    }
  }
}

export default (workspaceDir) => {
  let root = path.resolve(workspaceDir, 'package.json');
  let meta = JSON.parse(fs.readFileSync(root, { encoding: 'utf-8' }));
  return {
    'package.json': (manifest, dir) => {
      pinVersions(manifest.dependencies);
      pinVersions(manifest.devDependencies);
      pinVersions(manifest.peerDependencies);
      return { ...manifest, version: meta.version };
    },
    'tsconfig.json': (tsConfig, dir) => {
      
      return (tsConfig && dir !== workspaceDir) ? {
        ...tsConfig,
        compilerOptions: {
          ...tsConfig?.compilerOptions,
          outDir: 'dist',
          rootDir: 'src',
        },
      } : tsConfig;
    }
  }
}