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
    spatialZoom,
  }, {
    setSpatialZoom: setZoom,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER], coordinationScopes);

  /*
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
  const latestViewerStateRef = useRef(initialViewerState);
  // console.log(spatialRotationX, spatialRotationY)
  
  const loaders = useLoaders();

  const [{ obsSets: cellSets }] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );

  const [{ obsIndex }] = useObsEmbeddingData(
    loaders, dataset, true, {}, {},
    { obsType, embeddingType: mapping },
  );
  */

  // const BASE_SCALE = useBaseScale(initialViewerState, deckZoom);
  const BASE_SCALE = 1;
  const hasMountedRef = useRef(false);
  const lastInteractionSource = useRef(null);
  const applyNgUpdateTimeoutRef = useRef(null);

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

  const handleStateUpdate = useCallback((newState) => {
    const { projectionScale, projectionOrientation, position } = newState;
    // const prevProjectionOrientation = latestViewerStateRef.current.projectionOrientation;

    // console.log("handleStateUpdate", prevProjectionOrientation, projectionOrientation);

    //setZoom(projectionScaleToDeckZoom(projectionScale, BASE_SCALE));

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


  /*
  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [obsIndex, setCellHighlight]);
  */

  return (
    <Passthrough
      classes={classes}
      initialViewerState={initialViewerState}
      spatialZoom={spatialZoom}
    />
  );
}
