import React, { forwardRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SpatialThree } from './SpatialThree.js';

// Lazy-load XR components. If @react-three/xr is not installed,
// the dynamic imports fail and the catch provides fallbacks.
// eslint-disable-next-line implicit-arrow-linebreak, function-paren-newline
const LazyXRWrapper = React.lazy(() => import('./xr/XRWrapper.js').catch(() => ({
  default: ({ children }) => children,
})));

// eslint-disable-next-line implicit-arrow-linebreak, function-paren-newline
const LazyXREnterButton = React.lazy(() => import('./xr/XREnterButton.js').catch(() => ({
  default: () => null,
})));

export const SpatialWrapper = forwardRef((props, canvasRef) => {
  const [xrAvailable, setXrAvailable] = useState(false);

  useEffect(() => {
    import('@react-three/xr')
      .then(() => setXrAvailable(true))
      .catch(() => {});
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {xrAvailable && (
        <Suspense fallback={null}>
          <LazyXREnterButton />
        </Suspense>
      )}
      <Canvas
        style={{ position: 'absolute', top: 0, left: 0 }}
        camera={{
          fov: 50,
          up: [0, 1, 0],
          position: [0, 0, 800],
          near: 0.1,
          far: 3000,
        }}
        gl={{ antialias: true, logarithmicDepthBuffer: false }}
        ref={canvasRef}
      >
        {xrAvailable ? (
          <Suspense fallback={<SpatialThree {...props} />}>
            <LazyXRWrapper>
              <SpatialThree {...props} xrEnabled />
            </LazyXRWrapper>
          </Suspense>
        ) : (
          <SpatialThree {...props} />
        )}
      </Canvas>
    </div>
  );
});
