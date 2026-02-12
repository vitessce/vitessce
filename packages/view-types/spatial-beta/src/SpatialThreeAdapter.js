import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary.js';

const LazySpatialThree = React.lazy(async () => {
  const { SpatialWrapper } = await import('@vitessce/spatial-three');
  return { default: SpatialWrapper };
});

export const SpatialThreeAdapter = React.forwardRef((props, ref) => (
  <div ref={ref} style={{ width: '100%', height: '100%' }}>
    <ErrorBoundary fallback={<div>3D spatial view is not available in this environment.</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <LazySpatialThree {...props} />
      </Suspense>
    </ErrorBoundary>
  </div>
));
