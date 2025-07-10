/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
  useObsEmbeddingData,
} from '@vitessce/vit-s';
import {
  ViewHelpMapping,
  ViewType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import { isEqual } from 'lodash-es';
import { Neuroglancer } from './Neuroglancer.js';
import { useStyles } from './styles.js';
import {
  deckZoomToProjectionScale,
  projectionScaleToDeckZoom,
  quaternionToEuler,
  eulerToQuaternion,
  valueGreaterThanEpsilon,
  compareViewerState,

} from './utils.js';
import { useBaseScale } from './hooks.js';
import { Passthrough } from './Passthrough.js';

// TODO: the initial value after 0 changes, should be a way to capture it as is
const deckZoom = -4.4;
const VITESSCE_INTERACTION_DELAY = 50;

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
    //return compareViewerState(prevProps.viewerState, nextProps.viewerState);

});

export function NeuroglancerSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Neuroglancer',
    helpText = ViewHelpMapping.NEUROGLANCER,
    viewerState: initialViewerState,
  } = props;

  const { classes } = useStyles();

  const [{
    dataset,
    obsType,
    spatialZoom,
    // spatialTargetX,
    // spatialTargetY,
    spatialRotationX,
    spatialRotationY,
    spatialRotationZ,
    // spatialRotationOrbit,
    // spatialOrbitAxis,
    embeddingType: mapping,
    obsSetSelection: cellSetSelection,
    additionalObsSets: additionalCellSets,
    obsSetColor: cellSetColor,
  }, {
    setAdditionalObsSets: setAdditionalCellSets,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setObsSetSelection: setCellSetSelection,
    setObsHighlight: setCellHighlight,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialRotationX: setRotationX,
    setSpatialRotationY: setRotationY,
    // setSpatialRotationZ: setRotationZ,
    // setSpatialRotationOrbit: setRotationOrbit,

    setSpatialZoom: setZoom,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER], coordinationScopes);
  // const [latestViewerState, setLatestViewerState] = useState(initialViewerState);
  //const latestViewerStateRef = useRef(initialViewerState);
  // console.log(spatialRotationX, spatialRotationY)
  
  const loaders = useLoaders();

  const [{ obsSets }] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );

  const [{ obsIndex }] = useObsEmbeddingData(
    loaders, dataset, true, {}, {},
    { obsType, embeddingType: mapping },
  );

  /*
  useEffect(() => {
    // Avoiding circular updates on first render
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (lastInteractionSource.current === 'neuroglancer') return;
    lastInteractionSource.current = 'vitessce';
    // console.log('🔁 Vitessce interaction', lastInteractionSource.current);
  }, [spatialRotationX, spatialRotationY]);
  */

  // Vitessce does not set rotation
  // useEffect(() => {
  //   setTimeout(() => setRotationX(22.5), 2000); // Force pitch after load
  // }, []);

  // console.log("render spatialRotationX, Intereaction Source", spatialRotationX, lastInteractionSource.current);


  // const lastNgPushOrientationRef = useRef(null);

  


  /*
  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [obsIndex, setCellHighlight]);
  */

  // NOTE: Keep the logic in this component to a minimum.
  // Pass the props from the coordinationSpace down into the Passthrough component,
  // and use the arePropsEqual function to avoid unnecessary re-renders.
  return (
    <PassthroughMemo
      classes={classes}
      initialViewerState={initialViewerState}
      spatialZoom={spatialZoom}
      setSpatialZoom={setZoom}
      spatialRotationX={spatialRotationX}
      spatialRotationY={spatialRotationY}
      obsSets={obsSets}
      obsIndex={obsIndex}
    />
  );
}
