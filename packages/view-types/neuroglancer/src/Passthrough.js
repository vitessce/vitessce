import React, { useMemo, useCallback } from 'react';
import { Neuroglancer } from './Neuroglancer.js';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import { isEqual } from 'lodash-es';
import { compareViewerState, deckZoomToProjectionScale, projectionScaleToDeckZoom } from './utils.js';

export const PassthroughMemo = React.memo(Passthrough, (prevProps, nextProps) => {
    let needsRender = false;

    if(Math.abs(prevProps.spatialZoom - nextProps.spatialZoom) > 0.1) {
      needsRender = true;
    }
    if(Math.abs(prevProps.spatialRotationX - nextProps.spatialRotationX) > 0.1) {
      needsRender = true;
    }
    if(Math.abs(prevProps.spatialRotationY - nextProps.spatialRotationY) > 0.1) {
      needsRender = true;
    }

    // console.log("NeuroglancerMemo", prevProps.viewerState, nextProps.viewerState);
    // Compare the viewer states to avoid unnecessary re-renders
    // It should return true if the old and new props are equal
    return !needsRender;

});

function Passthrough(props) {
    const {
        classes,
        initialViewerState,
        spatialZoom,
        setSpatialZoom,
        spatialRotationX,
        spatialRotationY,
        setCellHighlight,
    } = props;

    const derivedViewerState = useMemo(() => {
        // DeckGL coordinate system to Neuroglancer coordinate system
        // ==========================================================

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
        // Neuroglancer coordinate system to DeckGL coordinate system
        // ==========================================================


        // Note: https://github.com/clio-janelia/clio_website/blob/e0c7667073bc83cec01bd701058b940ac7dcf2a4/src/reducers/viewer.js#L50
        const { projectionScale, projectionOrientation, position } = newState;
    
        //const [pitch, yaw] = quaternionToEuler(projectionOrientation);
    
        setSpatialZoom(projectionScaleToDeckZoom(projectionScale, null));
        //setRotationX(pitch);
        //setRotationY(yaw);
    
    }, []);

    // Other callbacks
    const onSegmentHighlight = useCallback((obsId) => {
        setCellHighlight(String(obsId));
    }, [setCellHighlight]);

    // TODO: set segment colors based on obsSets and colors (further derived viewerState)
    // TODO: define callback for segment click


    return (
        <Neuroglancer
            classes={classes}
            onSegmentClick={() => {}}
            onSelectHoveredCoords={onSegmentHighlight}
            viewerState={derivedViewerState}
            setViewerState={handleStateUpdate}
        />
    );
}