import React, { useCallback, useMemo, Suspense, useRef, useEffect, useState } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { useStyles, globalNeuroglancerCss } from './styles.js';

const LazyReactNeuroglancer = React.lazy(async () => {
  const ReactNeuroglancer = await import('@janelia-flyem/react-neuroglancer');
  return ReactNeuroglancer;
});

function createWorker() {
  return new ChunkWorker();
}

export function Neuroglancer(props) {
  console.log("rendered");
  const {
    viewerState: initialViewerState,
    onViewerStateChanged,
    onSegmentSelect,
  } = props;
  const classes = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);
  const viewerRef = useRef(null);
  const [selectedSegments, setSelectedSegments] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);

  // Use a ref to track the current viewerState.
  const currentViewerStateRef = useRef(initialViewerState);

  // Memoize the initialViewerState to prevent unnecessary changes.
  const stableInitialViewerState = useMemo(() => initialViewerState, [initialViewerState]);

  // Update the ref when initialViewerState changes.
  useEffect(() => {
    currentViewerStateRef.current = stableInitialViewerState;
  }, [stableInitialViewerState]);

  const lastHoveredSegmentRef = useRef(null);

  useEffect(() => {
    if (!viewerRef.current || !viewerRef.current.viewer) return;
    const viewer = viewerRef.current.viewer;

    const updateHoveredSegment = () => {
      const selectedLayer = viewer.layerManager.getLayerByName('segmentation');
      const hoveredSegmentId = selectedLayer?.layer_?.displayState.segmentationGroupState.curRoot.selectionState.value;
      if (hoveredSegmentId?.low) {
        lastHoveredSegmentRef.current = hoveredSegmentId.low;
        setSelectedSegments([hoveredSegmentId.low]);
        console.log("hovered", hoveredSegmentId.low)
        setSelectedCoordinates(getCoordinates(viewer));
        onSegmentSelect([hoveredSegmentId.low]); // Notify parent of segment selection.
      }
    };

    const updateClickedSegment = () => {
      const selectedLayer = viewer.layerManager.getLayerByName('segmentation');
      const clickedSegments = selectedLayer?.layer_?.displayState.segmentationGroupState.curGroupState.visibleSegments.toJSON();
      console.log("Clicked Segments:", clickedSegments);
      onSegmentSelect(clickedSegments); // Notify parent of segment selection.
    };

    viewer.mouseState.changed.add(updateHoveredSegment);
    const selectedLayer = viewer.layerManager.getLayerByName('segmentation');
    if (selectedLayer && selectedLayer.layer_) {
      selectedLayer.layer_.displayState.segmentationGroupState.curGroupState.visibleSegments.changed.add(updateClickedSegment);
    }

    return () => {
      viewer.mouseState.changed.remove(updateHoveredSegment);
      if (selectedLayer && selectedLayer.layer_) {
        selectedLayer.layer_.displayState.segmentationGroupState.curGroupState.visibleSegments.changed.remove(updateClickedSegment);
      }
    };
  }, [viewerRef.current, onSegmentSelect]);

  const handleStateChanged = useCallback(
    (newState) => {
      if (JSON.stringify(newState) !== JSON.stringify(currentViewerStateRef.current)) {
        currentViewerStateRef.current = newState;
        onViewerStateChanged?.(newState);
      }
    },
    [onViewerStateChanged],
  );

  const getCoordinates = (viewer) => {
    const coordinates = viewer?.navigationState?.pose?.position?.coordinates_;
    return coordinates;
  };

  return (
    <>
      <style>{globalNeuroglancerCss}</style>
      <div className={classes.neuroglancerWrapper}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyReactNeuroglancer
            brainMapsClientId="NOT_A_VALID_ID"
            viewerState={currentViewerStateRef.current}
            onViewerStateChanged={handleStateChanged}
            bundleRoot={bundleRoot}
            ref={viewerRef}
          />
        </Suspense>
      </div>
    </>
  );
}