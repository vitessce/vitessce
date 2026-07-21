import type * as XRModuleType from '@react-three/xr';

// @react-three/xr is an optional peer dependency. This dynamic namespace
// import must remain the ONLY runtime reference to the package: static named
// imports (e.g. `import { useXR } from '@react-three/xr'`) end up in dist
// chunks and fail consumer builds when the package is not installed, because
// bundlers resolve them at build time regardless of lazy loading.
let xrModule: typeof XRModuleType | null = null;

export async function loadXRModule(): Promise<typeof XRModuleType> {
  xrModule = await import('@react-three/xr');
  return xrModule;
}

// Only call from modules that are lazy-loaded after loadXRModule() resolves
// (i.e., gated behind the xrAvailable state in SpatialWrapper).
export function getXRModule(): typeof XRModuleType {
  if (!xrModule) {
    throw new Error('@react-three/xr is not loaded; call loadXRModule() first.');
  }
  return xrModule;
}
