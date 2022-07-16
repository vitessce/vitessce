import fs from 'node:fs';
import path from 'node:path';

// Mutates package metadata in place
function pinVersions(deps = {}, sharedDeps = {}) {
  for (let name of Object.keys(deps)) {
    if (sharedDeps[name]) {
      deps[name] = sharedDeps[name];
    }
  }
}

function readJson(filePath) {
  const fullPath = path.resolve(filePath);
  return JSON.parse(fs.readFileSync(fullPath, { encoding: 'utf-8' }));
}

export default (workspaceDir) => {
  const rootPkgJson = readJson(path.join(workspaceDir, 'package.json'));
  const metaPkgJson = readJson(path.join(workspaceDir, '.meta-updater', 'shared-package.json'));
  return {
    'package.json': (manifest, dir) => {
      pinVersions(manifest.dependencies, metaPkgJson.dependencies);
      pinVersions(manifest.devDependencies, metaPkgJson.devDependencies);
      pinVersions(manifest.peerDependencies, metaPkgJson.peerDependencies);
      return { ...manifest, version: rootPkgJson.version };
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