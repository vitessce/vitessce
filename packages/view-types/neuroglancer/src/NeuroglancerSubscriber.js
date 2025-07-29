/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { startTransition } from 'react';
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
import { NeuroglancerComp } from './Neuroglancer.js';
import { useStyles } from './styles.js';
import {
  deckZoomToProjectionScale,
  projectionScaleToDeckZoom,
  quaternionToEuler,
  eulerToQuaternion,
  valueGreaterThanEpsilon,
} from './utils.js';
import { useBaseScale } from './hooks.js';

// import { getSegmentColorMapping } from '@vitessce/neuroglancer-workers';

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

  const [{
    dataset,
    obsType,
    spatialZoom,
    // spatialTargetX,
    // spatialTargetY,
    spatialRotationX,
    spatialRotationY,
    spatialRotationZ,
    spatialRotationOrbit,
    spatialOrbitAxis,
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
    setSpatialRotationOrbit: setRotationOrbit,

    setSpatialZoom: setZoom,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER], coordinationScopes);
  // const [latestViewerState, setLatestViewerState] = useState(initialViewerState);
  const latestViewerStateRef = useRef(initialViewerState);
  // console.log("render", spatialRotationX, spatialRotationOrbit, spatialOrbitAxis)
  const { classes } = useStyles();
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

  const BASE_SCALE = 1500;// useBaseScale(initialViewerState, deckZoom);
  const hasMountedRef = useRef(false);
  const lastInteractionSource = useRef(null);
  const applyNgUpdateTimeoutRef = useRef(null);
  const prevSegmentsRef = useRef([]);
  // console.log("NG-Sub rendered", spatialZoom, spatialOrbitAxis, spatialRotationOrbit, spatialRotationX)

  const target = [0, 0, 0];
  const zoom = 5;
  const rotationOrbit = 0;
  const rotationX = 0;

  const handleStateUpdate = useCallback((newState) => {
    console.log("handleStateUpdate")
    const { projectionScale, projectionOrientation, position, layerManager } = newState;
    // const prevProjectionOrientation = latestViewerStateRef.current.projectionOrientation;

    // console.log("handleStateUpdate", prevProjectionOrientation, projectionOrientation);

    // setZoom(projectionScaleToDeckZoom(projectionScale, BASE_SCALE));

    latestViewerStateRef.current = {
      ...latestViewerStateRef.current,
      projectionOrientation,
      projectionScale,
      position,
    };

    // Ignore loopback from Vitessce
    // if (
    //   !valueGreaterThanEpsilon(projectionOrientation, prevProjectionOrientation, 1e-5)
    // ) {
    //   // console.log('⛔️ Skip NG → Vitessce update (loopback)');
    //   return;
    // }

    // if (applyNgUpdateTimeoutRef.current) {
    //   clearTimeout(applyNgUpdateTimeoutRef.current);
    // }
    // lastNgPushOrientationRef.current = latestViewerStateRef.current.projectionOrientation;
    // applyNgUpdateTimeoutRef.current = setTimeout(() => {
    //   const [pitch, yaw] = quaternionToEuler(latestViewerStateRef.current.projectionOrientation);

    //   const pitchDiff = Math.abs(pitch - spatialRotationX);
    //   if (pitchDiff > 0.001) {
    //     console.log('🌀 NG → Vitessce (debounced apply):', pitch);
    //     setRotationX(pitch);
    //     setRotationY(yaw);
    //     lastInteractionSource.current = 'neuroglancer';
    //   }
    // }, VITESSCE_INTERACTION_DELAY);
  }, []);


  const onSegmentClick = useCallback((value) => {
    if (value) {
      const selectedCellIds = [String(value)];
      if (isEqual(cellSetSelection, selectedCellIds)) return;
      console.log("onSegmentClick")
      setObsSelection(
        selectedCellIds, additionalCellSets, cellSetColor,
        setCellSetSelection, setAdditionalCellSets, setCellSetColor,
        setCellColorEncoding,
        'Selection ',
        `: based on selected segments ${value}`,
      );
    }
  }, [additionalCellSets, cellSetColor, setAdditionalCellSets,
    setCellColorEncoding, setCellSetColor, setCellSetSelection,
  ]);

  const mergedCellSets = useMemo(() => mergeObsSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  const cellColors = useMemo(() => getCellColors({
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
    obsIndex,
    theme,
  }), [mergedCellSets, theme,
    cellSetColor, cellSetSelection, obsIndex]);

  const rgbToHex = useCallback(rgb => (typeof rgb === 'string' ? rgb
    : `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`), []);

  // const cellColorMappingRef = useRef({});
  const batchedUpdateTimeoutRef = useRef(null);
  const [batchedCellColors, setBatchedCellColors] = useState(cellColors);

  useEffect(() => {
    if (batchedUpdateTimeoutRef.current) {
      clearTimeout(batchedUpdateTimeoutRef.current);
    }
    // batchedUpdateTimeoutRef.current = setTimeout(() => {
    //   setBatchedCellColors(cellColors);
    //   // console.log("batched Updates")
    // }, 100);

    startTransition(() => {
      setBatchedCellColors(cellColors);
    });

  }, [cellColors]);



  // const cellColorMapping = useMemo(() => {
  //   const colorMapping = {};
  //   let changed = false;
  //   batchedCellColors.forEach((color, cell) => {
  //     const hex = rgbToHex(color);
  //     if (cellColorMappingRef.current[cell] !== hex) {
  //       changed = true;
  //     }
  //     colorMapping[cell] = hex;
  //   });
  //   if (!changed
  //     && Object.keys(colorMapping).length === Object.keys(cellColorMappingRef.current).length) {
  //     return cellColorMappingRef.current;
  //   }
  //   cellColorMappingRef.current = colorMapping;
  //   return colorMapping;
  // }, [batchedCellColors]);

  // TODO use a ref if slow - see prev commits
  const cellColorMapping = useMemo(() => {
    const colorMapping = {};
    batchedCellColors.forEach((color, cell) => {
      colorMapping[cell] = rgbToHex(color);
    });
    return colorMapping;
  }, [batchedCellColors]);



  // console.log("NG cellColorMapping", Object.keys(cellColorMapping).length)
  // For the first render, assign the cellSets and their colors to segments
  const derivedViewerState = useMemo(() => {
    const { current } = latestViewerStateRef;
    const nextSegments = Object.keys(cellColorMapping);
    const prevLayer = current?.layers?.[0] || {};
    const prevSegments = prevLayer.segments || [];
    console.log("derivedViewerState", prevSegments?.length, Object.keys(cellColorMapping)?.length);
    if (prevSegments?.length > 0) return current;
    const newLayer0 = {
      ...prevLayer,
      segments: nextSegments,
      segmentColors: cellColorMapping,
    };

    const updated = {
      ...current,
      layers: [newLayer0, ...(current?.layers?.slice(1) || [])],
    };
    latestViewerStateRef.current = updated;

    return updated;
  }, [cellColorMapping]);
  // const derivedViewerState2 = useMemo(() => {
  //   // const start = performance.now();
  //   // console.time("⏱ END derivedViewerState2");
  //   // console.log('derivedViewerState2', Object.keys(derivedViewerState?.layers[0]?.segmentColors)?.length);
  //   // console.log('derivedViewerState2', spatialRotationX, lastNgPushOrientationRef.current, derivedViewerState.projectionOrientation, latestViewerStateRef.current.projectionOrientation);
  //   let { projectionScale, projectionOrientation } = derivedViewerState;
  //   if (typeof spatialZoom === 'number' && BASE_SCALE) {
  //     projectionScale = deckZoomToProjectionScale(spatialZoom, BASE_SCALE);
  //   }

  //   const vitessceRotation = eulerToQuaternion(
  //     spatialRotationX,
  //     spatialRotationY,
  //     spatialRotationZ,
  //   );

  //   // Only update state if coming from Vitessce - avoid circular self changes
  //   if (lastInteractionSource.current === 'vitessce') {
  //     if (valueGreaterThanEpsilon(vitessceRotation, projectionOrientation, 1e-3)) {
  //       projectionOrientation = vitessceRotation;
  //       // console.log('Vitessce → NG: pushing new orientation');
  //     }
  //     //  else {
  //     //   console.log('Skip push to NG — no quaternion change');
  //     // }
  //   } else if (lastInteractionSource.current === 'neuroglancer') {
  //     // prevent override by committing what NG sent
  //     projectionOrientation = lastNgPushOrientationRef.current ?? projectionOrientation;
  //     // console.log('NG → NG: committing NG-derived orientation');
  //     lastInteractionSource.current = null;
  //   }
  //   // else {
  //   //   console.log('Vitessce → NG: Skipping due to unknown source');
  //   // }


  //   // const end = performance.now();
  //   // console.log(`⏱️ derivedState2 took ${end - start}ms`);
  //   return {
  //     ...derivedViewerState,
  //     projectionScale,
  //     projectionOrientation,
  //   };
  // }, [derivedViewerState, spatialZoom, spatialRotationX, spatialRotationY,
  //   spatialRotationZ, BASE_SCALE]);

  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [obsIndex, setCellHighlight]);


  const applyNgInteractionsToVit = useCallback(() => {
   
    const { projectionOrientation, projectionScale } = latestViewerStateRef.current;
    console.log("button clicked", BASE_SCALE, spatialZoom, projectionScale)
    if (!projectionOrientation || !projectionScale) return;
  
    // Convert quaternion → Euler
    const [pitch, yaw] = quaternionToEuler(projectionOrientation);
  
      const zoom = BASE_SCALE ? projectionScaleToDeckZoom(projectionScale, BASE_SCALE) : null;

      setRotationX(pitch);
      setRotationOrbit(yaw);
      if (zoom) setZoom(zoom);
      console.log("new zoom", zoom)
      
    console.log('✅ Applied NG → Vitessce state via button:', { pitch, yaw, zoom });

  }, [setZoom, setRotationX, setRotationOrbit]);

  useEffect(() => {
    console.log('🧪 cellColorMapping changed in Subscriber:', Object.keys(cellColorMapping).length);
  }, [cellColorMapping]);

  // const [stableColorMapping, setStableColorMapping] = useState({});

// useEffect(() => {
//   setStableColorMapping(structuredClone(cellColorMapping)); // or use JSON.parse(JSON.stringify(...))
//   console.log("stableColorMapping changed in Subscriber:", stableColorMapping)
// }, [cellColorMapping]);


  // if (!stableColorMapping || Object.keys(stableColorMapping).length === 0) {
  //   return null; // or show loading spinner
  // }

  if (!cellColorMapping || Object.keys(cellColorMapping).length === 0) {
    return;
  }
  
  return (
    <TitleInfo
      title={title}
      helpText={helpText}
      isSpatial
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady
      withPadding={false}
    >
    <button style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
      onClick={applyNgInteractionsToVit}> Update Vitessce
    </button>
      <NeuroglancerComp
        classes={classes}
        // onSegmentClick={onSegmentClick}
        // onSelectHoveredCoords={onSegmentHighlight}
        viewerState={derivedViewerState}
        cellColorMapping={cellColorMapping}
        setViewerState={handleStateUpdate}
      />
    </TitleInfo>
  );
}
