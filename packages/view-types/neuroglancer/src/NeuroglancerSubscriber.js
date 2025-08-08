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
  compareViewerState,
} from './utils.js';
import { useBaseScale } from './hooks.js';


// TODO: the initial value after 0 changes, should be a way to capture it as is
const deckZoom = 0;
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
    spatialTargetX,
    spatialTargetY,
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
  const latestViewerStateRef = useRef(initialViewerState);
  // const [clickedSegmentId, setClickedSegmentId] = useState(null);
  console.log("NG Subs REnder Zoom", spatialZoom);
  // console.log("NG Subs REnder translation", spatialTargetX, spatialTargetY)
  // console.log("NG Subs REnder Rotation",     spatialRotationX, spatialRotationY,spatialRotationZ,spatialRotationOrbit,spatialOrbitAxis)
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

  const BASE_SCALE = useBaseScale(initialViewerState, deckZoom);
  const hasMountedRef = useRef(false);
  const lastInteractionSource = useRef(null);
  const applyNgUpdateTimeoutRef = useRef(null);
  const prevSegmentsRef = useRef([]);
  const lastNgPushOrientationRef = useRef(null);

  useEffect(() => {
    console.log('useEffect');
        // Avoiding circular updates on first render
        if (!hasMountedRef.current) {
          hasMountedRef.current = true;
          // setTargetX(250);
          return;
        }
        if (lastInteractionSource.current === 'neuroglancer') return;
        lastInteractionSource.current = 'vitessce';
        // console.log('🔁 Vitessce interaction', lastInteractionSource.current);
      }, [spatialZoom, spatialRotationX, spatialRotationY]);
    
  
  /*
   * handleStateUpdate - Interactions from NG to Vitessce
   */
  const handleStateUpdate = useCallback((newState) => {
    const { projectionScale, projectionOrientation, position } = newState;
    const prevProjectionOrientation = latestViewerStateRef.current.projectionOrientation;
    const deckZoomFromNG = projectionScaleToDeckZoom(projectionScale, BASE_SCALE);
    setZoom(deckZoomFromNG);


    console.log("handleStateUpdate", BASE_SCALE, projectionScale, deckZoomFromNG, projectionOrientation, position);
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
        setRotationOrbit(yaw);
        lastInteractionSource.current = 'neuroglancer';
      }
    }, VITESSCE_INTERACTION_DELAY);


    latestViewerStateRef.current = {
      ...latestViewerStateRef.current,
      projectionOrientation,
      projectionScale,
      position,
    };
  }, []);


  const onSegmentClick = useCallback((value) => {
    // TODO multiple segments are added sometime to the selection - each click replaces the other
    if (value) {
      const id = String(value);
      const selectedCellIds = [id];
      const alreadySelectedId = cellSetSelection?.flat()?.some(sel => sel.includes(id));
      // Don't create no selection from same ids
      if (alreadySelectedId) {
        // TODO: reset the setObsSelection
        return;
      };
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
    batchedUpdateTimeoutRef.current = setTimeout(() => {
      setBatchedCellColors(cellColors);
    }, 100);

    // TODO: look into deferredValue from React
    // startTransition(() => {
    //   setBatchedCellColors(cellColors);
    // });

  }, [cellColors]);
  // TODO use a ref if slow - see prev commits
  const cellColorMapping = useMemo(() => {
    const colorMapping = {};
    batchedCellColors.forEach((color, cell) => {
      colorMapping[cell] = rgbToHex(color);
    });
    return colorMapping;
  }, [batchedCellColors]);



  const derivedViewerState = useMemo(() => {

    const { current } = latestViewerStateRef;
    const nextSegments = Object.keys(cellColorMapping);
    const prevLayer = current?.layers?.[0] || {};
    const prevSegments = prevLayer.segments || [];
    // let hasInteractionsChangedState = false;
    console.log("derivedViewerState", prevSegments?.length, Object.keys(cellColorMapping)?.length);
    let { projectionScale, projectionOrientation } = current;
    if (typeof spatialZoom === 'number' && BASE_SCALE) {
      projectionScale = deckZoomToProjectionScale(spatialZoom, BASE_SCALE);
      console.log("spatialZoom, projectionScale, current.projectionScale), BASE_SCALE" ,spatialZoom, projectionScale, current.projectionScale, BASE_SCALE)
    }

    const vitessceRotation = eulerToQuaternion(
      spatialRotationX,
      spatialRotationOrbit,
      spatialRotationZ,
    );
    console.log("vitessceRotation", vitessceRotation)
    // Only update state if coming from Vitessce - avoid circular self changes
    if (lastInteractionSource.current === 'vitessce') {
      if (valueGreaterThanEpsilon(vitessceRotation, projectionOrientation, 1e-2)) {
        projectionOrientation = vitessceRotation;
        console.log('Vitessce → NG: pushing new orientation');
      }
       else {
        console.log('Skip push to NG — no quaternion change');
      }
    } else if (lastInteractionSource.current === 'neuroglancer') {
      // prevent override by committing what NG sent
      projectionOrientation = lastNgPushOrientationRef.current ?? projectionOrientation;
      // console.log('NG → NG: committing NG-derived orientation');
      lastInteractionSource.current = null;
    }
    else {
      console.log('Vitessce → NG: Skipping due to unknown source');
    }

    const newLayer0 = {
      ...prevLayer,
      segments: nextSegments,
      segmentColors: cellColorMapping,
    };

    const updated = {
      ...current,
      projectionScale,
      // projectionOrientation,
      layers: [newLayer0, ...(current?.layers?.slice(1) || [])],
    };
    console.log("before", compareViewerState(current, updated))
    const hasInteractionsChangedState = compareViewerState(current, updated);
    latestViewerStateRef.current = updated;
    // if (!hasInteractionsChangedState){
      console.log("interactions From vitessce", prevSegments?.length > 0, hasInteractionsChangedState, prevSegments?.length === 0 && hasInteractionsChangedState, isEqual( latestViewerStateRef.current, updated));
    // }
    
    lastInteractionSource.current = updated

    if (prevSegments?.length === 0 && hasInteractionsChangedState) 
        return current;

    return updated;
  }, [cellColorMapping, spatialZoom, spatialRotationX, spatialRotationY,
    spatialRotationZ,]);

  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [obsIndex, setCellHighlight]);

  // TODO: if all cells are deselected, a black view is shown, rather we want to show empty NG view
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
      <NeuroglancerComp
        classes={classes}
        onSegmentClick={onSegmentClick}
        onSelectHoveredCoords={onSegmentHighlight}
        viewerState={derivedViewerState}
        cellColorMapping={cellColorMapping}
        setViewerState={handleStateUpdate}
      />
    </TitleInfo>
  );
}
