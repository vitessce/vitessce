import React, { useMemo } from 'react';
import { Neuroglancer } from './Neuroglancer.js';
import { compareViewerState, deckZoomToProjectionScale, eulerToQuaternion } from './utils.js';


const NeuroglancerMemo = React.memo(Neuroglancer, (prevProps, nextProps) => {
    let needsRender = false;
    
    // Compare the viewer states to avoid unnecessary re-renders
    needsRender = !compareViewerState(prevProps.viewerState, nextProps.viewerState);

    // It should return true if the old and new props are equal
    return !needsRender;
});

export function Passthrough(props) {
    const {
        classes,
        initialViewerState,
        handleStateUpdate,
        spatialZoom,
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
    }, [initialViewerState, spatialZoom, spatialRotationX, spatialRotationY]);

    return (
        <NeuroglancerMemo
            classes={classes}
            onSegmentClick={() => {}}
            onSelectHoveredCoords={() => {}}
            viewerState={derivedViewerState}
            // viewerState={initialViewerState}
            setViewerState={handleStateUpdate}
        />
    );
}