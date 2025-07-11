import { useMemo } from 'react';
// import { getProjectionScaleInMicrons } from './utils.js';

/*
    The baseScale is created based on the initial value of projectionScale and initialZoom
    when the view loads

*/
export function useBaseScale(initialViewerState, initialZoom) {
  return useMemo(() => {
    const { projectionScale } = initialViewerState;
    if (
      initialViewerState
      && typeof initialViewerState.projectionScale === 'number'
      && typeof initialZoom === 'number'
    ) {
    //   const projectionScaleUm = getProjectionScaleInMicrons(
    //     initialViewerState.dimensions,
    //     initialViewerState.projectionScale,
    //   );

      // TODO: micron units don't work for now
      //   if (typeof projectionScaleUm === 'number' && projectionScaleUm > 0) {
      //     return projectionScaleUm / (2 ** -initialZoom);
      //   }

      if (typeof projectionScale === 'number' && projectionScale > 0) {
        return projectionScale / (2 ** -initialZoom);
      }
    }
    return null;
  });
}
