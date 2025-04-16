import { jsx as _jsx } from "react/jsx-runtime";
import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary.js';
// Lazy load the HiGlass React component,
// using a dynamic import.
const LazySpatialThree = React.lazy(async () => {
    // Temporary fix until a new release of HiGlass is made after 1.11.11,
    // which removes the github.com dependencies in the higlass package.json,
    // which is causing issues with PNPM install on GitHub Actions.
    const { SpatialWrapper } = await import('@vitessce/spatial-three');
    return { default: SpatialWrapper };
});
export const SpatialThreeAdapter = React.forwardRef((props, ref) => (_jsx("div", { ref: ref, style: { width: '100%', height: '100%' }, children: _jsx(ErrorBoundary, { children: _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(LazySpatialThree, { ...props }) }) }) })));
