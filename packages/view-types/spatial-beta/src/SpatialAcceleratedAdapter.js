import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary.js';

// Lazy load the HiGlass React component,
// using a dynamic import.
const LazySpatialAccelerated = React.lazy(async () => {
  // Temporary fix until a new release of HiGlass is made after 1.11.11,
  // which removes the github.com dependencies in the higlass package.json,
  // which is causing issues with PNPM install on GitHub Actions.
  const { SpatialWrapper } = await import('@vitessce/spatial-accelerated');
  return { default: SpatialWrapper };
});

export const SpatialAcceleratedAdapter = React.forwardRef((props, ref) => (
  <div ref={ref} style={{ width: '100%', height: '100%' }}>
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <LazySpatialAccelerated {...props} />
      </Suspense>
    </ErrorBoundary>
  </div>
));
