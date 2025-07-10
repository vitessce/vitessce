import React, { useMemo, useCallback } from 'react';
import { Neuroglancer } from './Neuroglancer.js';
import { compareViewerState, deckZoomToProjectionScale, projectionScaleToDeckZoom } from './utils.js';

/*
const NeuroglancerMemo = React.memo(Neuroglancer, (prevProps, nextProps) => {
    let needsRender = false;
    
    // Compare the viewer states to avoid unnecessary re-renders
    needsRender = !compareViewerState(prevProps.viewerState, nextProps.viewerState);

    // It should return true if the old and new props are equal
    return !needsRender;
});
*/

export function Passthrough(props) {
    const {
        classes,
        initialViewerState,
        spatialZoom,
        setSpatialZoom,
        spatialRotationX,
        spatialRotationY,
    } = props;

    //console.log('Passthrough render');

    const derivedViewerState = useMemo(() => {
        let projectionScale = deckZoomToProjectionScale(0, null);
        if(typeof spatialZoom === 'number') {
            projectionScale = deckZoomToProjectionScale(spatialZoom, null);
        }
        /*const projectionOrientation = eulerToQuaternion(
            spatialRotationX,
            spatialRotationY,
        );*/
        
        return {
            ...initialViewerState,
            projectionScale,
            //projectionOrientation
        };
    }, [initialViewerState, spatialZoom]);

    const handleStateUpdate = useCallback((newState) => {
        // Note: https://github.com/clio-janelia/clio_website/blob/e0c7667073bc83cec01bd701058b940ac7dcf2a4/src/reducers/viewer.js#L50
        const { projectionScale, projectionOrientation, position } = newState;
        // const prevProjectionOrientation = latestViewerStateRef.current.projectionOrientation;
    
        // console.log("handleStateUpdate", prevProjectionOrientation, projectionOrientation);
        //console.log('setZoom in handleStateUpdate');
        //const [pitch, yaw] = quaternionToEuler(projectionOrientation);
    
        setSpatialZoom(projectionScaleToDeckZoom(projectionScale, null));
        //setRotationX(pitch);
        //setRotationY(yaw);
    
        /*
        latestViewerStateRef.current = {
          ...latestViewerStateRef.current,
          projectionOrientation,
          projectionScale,
          position,
        };
    
        // Ignore loopback from Vitessce
        if (
          !valueGreaterThanEpsilon(projectionOrientation, prevProjectionOrientation, 1e-5)
        ) {
          // console.log('⛔️ Skip NG → Vitessce update (loopback)');
          return;
        }
    
        if (applyNgUpdateTimeoutRef.current) {
          clearTimeout(applyNgUpdateTimeoutRef.current);
        }
        lastNgPushOrientationRef.current = latestViewerStateRef.current.projectionOrientation;
        applyNgUpdateTimeoutRef.current = setTimeout(() => {
          const [pitch, yaw] = quaternionToEuler(latestViewerStateRef.current.projectionOrientation);
    
          const pitchDiff = Math.abs(pitch - spatialRotationX);
          if (pitchDiff > 0.001) {
            console.log('🌀 NG → Vitessce (debounced apply):', pitch);
            setRotationX(pitch);
            setRotationY(yaw);
            lastInteractionSource.current = 'neuroglancer';
          }
        }, VITESSCE_INTERACTION_DELAY);
        */
      }, []);

    return (
        <Neuroglancer
            classes={classes}
            onSegmentClick={() => {}}
            onSelectHoveredCoords={() => {}}
            viewerState={derivedViewerState}
            // viewerState={initialViewerState}
            setViewerState={handleStateUpdate}
        />
    );
}