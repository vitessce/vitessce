import React from 'react';
import { Neuroglancer } from './Neuroglancer.js';

const NeuroglancerMemo = React.memo(Neuroglancer, (prevProps, nextProps) => {
    // console.log("NeuroglancerMemo", prevProps.viewerState, nextProps.viewerState);
    // Compare the viewer states to avoid unnecessary re-renders
    // It should return true if the old and new props are equal
    return true;
    //return compareViewerState(prevProps.viewerState, nextProps.viewerState);

  });

export function Passthrough(props) {
    const { classes, initialViewerState, spatialZoom } = props;
    console.log(spatialZoom);
  return (

      <NeuroglancerMemo
        classes={classes}
        onSegmentClick={() => {}}
        onSelectHoveredCoords={() => {}}
        viewerState={initialViewerState}
        // viewerState={initialViewerState}
        setViewerState={() => {}}
      />

  );
}