import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary.js';

const LazySpatialAccelerated = React.lazy(async () => {
  const { SpatialWrapper } = await import('@vitessce/spatial-accelerated');
  return { default: SpatialWrapper };
});

export const SpatialAcceleratedAdapter = React.forwardRef((props, ref) => (
  <div ref={ref} style={{ width: '100%', height: '100%' }}>
    <ErrorBoundary fallback={<div>3D spatial view is not available in this environment.</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <LazySpatialAccelerated {...props} />
      </Suspense>
    </ErrorBoundary>
  </div>
));
