import fs from 'node:fs';
import path from 'node:path';

const MATHGL_VERSION = '^3.5.6';
const LUMAGL_VERSION = '~8.5.10';
const LOADERSGL_VERSION = "^3.0.0";
const DECKGL_VERSION = '8.6.7';
const TURF_VERSION = "^6.5.0";
const NEBULAGL_VERSION = "^0.23.8";
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

  // LumaGL
  "@luma.gl/constants": "8.5.10",
  "@luma.gl/core": "8.5.10",
  "@luma.gl/engine": "8.5.10",
  "@luma.gl/gltools": "8.5.10",
  "@luma.gl/shadertools": "8.5.10",
  "@luma.gl/experimental": "8.5.10",
  "@luma.gl/webgl": "8.5.10",
  // DeckGL
  "deck.gl": "8.6.7",
  "@deck.gl/core": "8.6.7",
  "@deck.gl/geo-layers": "8.6.7",
  "@deck.gl/mesh-layers": "8.6.7",
  "@deck.gl/aggregation-layers": "8.6.7",
  "@deck.gl/extensions": "8.6.7",
  "@deck.gl/layers": "8.6.7",
  "@deck.gl/react": "8.6.7",
  // NebulaGL
  "nebula.gl": "0.23.8",
  "@nebula.gl/layers": "0.23.8",
  "@nebula.gl/edit-modes": "0.23.8",
  // LoadersGL
  "@loaders.gl/3d-tiles": "^3.0.0",
  "@loaders.gl/core": "^3.0.0",
  "@loaders.gl/images": "^3.0.0",
  "@loaders.gl/loader-utils": "^3.0.0",
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