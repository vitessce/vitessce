/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
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
} from './utils.js';
import { useBaseScale } from './hooks.js';

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

  useEffect(() => {
    console.log('useEffect');
    // Avoiding circular updates on first render
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (lastInteractionSource.current === 'neuroglancer') return;
    lastInteractionSource.current = 'vitessce';
    // console.log('🔁 Vitessce interaction', lastInteractionSource.current);
  }, [spatialRotationX, spatialRotationY]);

  // Vitessce does not set rotation
  // useEffect(() => {
  //   setTimeout(() => setRotationX(22.5), 2000); // Force pitch after load
  // }, []);

  // console.log("render spatialRotationX, Intereaction Source", spatialRotationX, lastInteractionSource.current);


  const lastNgPushOrientationRef = useRef(null);

  const handleStateUpdate = useCallback((newState) => {
    const { projectionScale, projectionOrientation, position } = newState;
    const prevProjectionOrientation = latestViewerStateRef.current.projectionOrientation;

    // console.log("handleStateUpdate", prevProjectionOrientation, projectionOrientation);

    setZoom(projectionScaleToDeckZoom(projectionScale, BASE_SCALE));

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
  }, [setZoom, setRotationX, BASE_SCALE, spatialRotationX]);


  const onSegmentClick = useCallback((value) => {
    if (value) {
      const selectedCellIds = [String(value)];
      if (isEqual(cellSetSelection, selectedCellIds)) return;
      console.log("onSegmentClick")
      // requestIdleCallback(() => {
      setObsSelection(
        selectedCellIds, additionalCellSets, cellSetColor,
        setCellSetSelection, setAdditionalCellSets, setCellSetColor,
        setCellColorEncoding,
        'Selection ',
        `: based on selected segments ${value}`,
      );
    // });
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

  // const cellColors = useMemo(() => {
  //   if (!obsIndex) return new Map();
  //   const dummyColor = [255, 0, 0]; // bright red
  //   const map = new Map();
  //   obsIndex.forEach(cell => {
  //     map.set(cell, dummyColor);
  //   });
  //   return map;
  // }, [obsIndex]);

  const rgbToHex = useCallback(rgb => (typeof rgb === 'string' ? rgb
    : `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`), []);

  const cellColorMappingRef = useRef({});
  const batchedUpdateTimeoutRef = useRef(null);
  const [batchedCellColors, setBatchedCellColors] = useState(cellColors);

  useEffect(() => {
    if (batchedUpdateTimeoutRef.current) {
      clearTimeout(batchedUpdateTimeoutRef.current);
    }
    batchedUpdateTimeoutRef.current = setTimeout(() => {
      setBatchedCellColors(cellColors);
      console.log("batched Updates")
    }, 100);
  }, [cellColors]);

  const cellColorMapping = useMemo(() => {
    const colorMapping = {};
    let changed = false;
    batchedCellColors.forEach((color, cell) => {
      const hex = rgbToHex(color);
      if (cellColorMappingRef.current[cell] !== hex) {
        changed = true;
      }
      colorMapping[cell] = hex;
    });
    if (!changed
      && Object.keys(colorMapping).length === Object.keys(cellColorMappingRef.current).length) {
      return cellColorMappingRef.current;
    }
    cellColorMappingRef.current = colorMapping;
    return colorMapping;
  }, [batchedCellColors]);

  const derivedViewerState = useMemo(() => {
    const { current } = latestViewerStateRef;

    const nextSegments = Object.keys(cellColorMapping).map(String);
    const prevSegments = current?.layers?.[0]?.segments ?? [];
    const prevColors = current?.layers?.[0]?.segmentColors ?? null;
    console.log(prevSegments.length === 0 ,nextSegments.length > 0)
    const initNeeded = prevSegments.length === 0 && nextSegments.length > 0;
    const segmentsChanged = initNeeded
      || nextSegments.length !== prevSegmentsRef.current.length
      || !nextSegments.every((v, i) => v === prevSegmentsRef.current[i]);
    if (segmentsChanged) {
      prevSegmentsRef.current = nextSegments;
    }
    if (!prevColors) {
      const updated = {
        ...current,
        layers: [{
          ...current.layers[0],
          segmentColors: cellColorMapping,
          segments: nextSegments,
        }, ...current.layers.slice(1)],
      };
      latestViewerStateRef.current = updated;
      return updated;
    }
    const colorsChanged = !prevColors || Object.keys(cellColorMapping).some(
      key => cellColorMapping[key] !== prevColors[key],
    );

    const newLayer0 = {
      ...current.layers[0],
      ...(segmentsChanged && { segments: nextSegments }),
      // Always set `segmentColors` if it doesn't exist yet
      ...((colorsChanged || !current.layers[0]?.segmentColors)
      && { segmentColors: cellColorMapping }),
    };

    if (!segmentsChanged && !colorsChanged && current.layers[0]?.segmentColors) {
      return current;
    }

    console.log('derivedState Exit',current.layers[0]?.segmentColors);

    return {
      ...current,
      layers: [newLayer0, ...current.layers.slice(1)],
    };
  }, [cellColorMapping]);


  const derivedViewerState2 = useMemo(() => {
    console.log('derivedViewerState2', Object.keys(derivedViewerState.layers[0]?.segmentColors).length);
    // console.log('derivedViewerState2', spatialRotationX, lastNgPushOrientationRef.current, derivedViewerState.projectionOrientation, latestViewerStateRef.current.projectionOrientation);
    let { projectionScale, projectionOrientation } = derivedViewerState;
    if (typeof spatialZoom === 'number' && BASE_SCALE) {
      projectionScale = deckZoomToProjectionScale(spatialZoom, BASE_SCALE);
    }

    const vitessceRotation = eulerToQuaternion(
      spatialRotationX,
      spatialRotationY,
      spatialRotationZ,
    );

    // Only update state if coming from Vitessce - avoid circular self changes
    if (lastInteractionSource.current === 'vitessce') {
      if (valueGreaterThanEpsilon(vitessceRotation, projectionOrientation, 1e-3)) {
        projectionOrientation = vitessceRotation;
        // console.log('Vitessce → NG: pushing new orientation');
      }
      //  else {
      //   console.log('Skip push to NG — no quaternion change');
      // }
    } else if (lastInteractionSource.current === 'neuroglancer') {
      // prevent override by committing what NG sent
      projectionOrientation = lastNgPushOrientationRef.current ?? projectionOrientation;
      // console.log('NG → NG: committing NG-derived orientation');
      lastInteractionSource.current = null;
    }
    // else {
    //   console.log('Vitessce → NG: Skipping due to unknown source');
    // }


    return {
      ...derivedViewerState,
      projectionScale,
      projectionOrientation,
    };
  }, [derivedViewerState, spatialZoom, spatialRotationX, spatialRotationY,
    spatialRotationZ, BASE_SCALE]);

  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [obsIndex, setCellHighlight]);

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
      <Neuroglancer
        classes={classes}
        onSegmentClick={onSegmentClick}
        onSelectHoveredCoords={onSegmentHighlight}
        viewerState={derivedViewerState2}
        // viewerState={initialViewerState}
        setViewerState={handleStateUpdate}
      />
    </TitleInfo>
  );
}
