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
  quaternionsAreClose,

} from './utils.js';
import { useBaseScale } from './hooks.js';

// TODO: the initial value after 0 changes, should be a way to capture it as is
const deckZoom = -4.4;

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
  // const isFromVitessceRef = useRef(false);
  const lastUpdateSource = useRef(null);
  const hasMountedRef = useRef(false);
  const lastInteractionSource = useRef(null);
  const lastPushedFromVitessceRef = useRef(null);
  const lastReceivedFromNGRef = useRef(null);
  const spatialRotationPrevRef = useRef(null);
  const ngFirstRender = useRef(false)
  const updateSequenceRef = useRef(null)
  // useRef({
  //   quat: null,
  //   timestamp: 0,
  // });

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      ngFirstRender.current = true;
      lastInteractionSource.current = 'render';
      return;
    }
    else if (updateSequenceRef.current === 'n') {
      updateSequenceRef.current = null
      return;
    }
    else lastInteractionSource.current = 'vitessce';
    console.log('🔁 Vitessce interaction', lastInteractionSource.current);
  }, [spatialRotationX, spatialRotationY]);

  console.log("render spatialRotationX, provX, Source", spatialRotationX, spatialRotationPrevRef.current, lastInteractionSource.current, updateSequenceRef.current);



  /**
   * 
   * 
   */
  const handleStateUpdate = useCallback((newState) => {
    const { projectionScale, projectionOrientation, position } = newState;
    const [pitch, yaw] = quaternionToEuler(projectionOrientation);
  

    console.log("handleStateUpdate")//, projectionOrientation, latestViewerStateRef.current.projectionOrientation, valueGreaterThanEpsilon(projectionOrientation, latestViewerStateRef.current.projectionOrientation, 1e-5))
    // lastInteractionSource.current = 'neuroglancer';
    // 🚫 Ignore if this update originated from Vitessce
    if (
      lastReceivedFromNGRef.current &&
      !valueGreaterThanEpsilon(projectionOrientation, latestViewerStateRef.current.projectionOrientation, 1e-5)
    ) {
      latestViewerStateRef.current = {
        ...latestViewerStateRef.current,
        projectionScale,
        projectionOrientation,
        position,
      };
      console.log('⛔️ Skip NG → Vitessce update (loopback)');
      return;
    }
  
    // ✅ Push NG update to Vitessce
    lastReceivedFromNGRef.current = projectionOrientation;
    // isNgInteraction.current = true;
  
    if (BASE_SCALE) {
      setZoom(projectionScaleToDeckZoom(projectionScale, BASE_SCALE));
    }
    console.log("before Pitch update", Math.abs(pitch - spatialRotationX) > 0.0001, pitch)
    // console.log("before Pitch update", pitch, projectionOrientation)
    if (Math.abs(pitch - spatialRotationX) > 0.0001 &&  lastInteractionSource.current !== 'render' && updateSequenceRef.current !== 'n'
  && spatialRotationX !== spatialRotationPrevRef.current  && Math.abs(pitch) > 0.3) {
      spatialRotationPrevRef.current = spatialRotationX
      updateSequenceRef.current = 'n',
      console.log('🌀 NG → Vitessce: pitch diff', pitch, spatialRotationX, updateSequenceRef.current);
      lastInteractionSource.current === 'neuroglancer'
      setRotationX(pitch);
    }

    // console.log("exit")
  
  }, [setZoom, setRotationX, BASE_SCALE, spatialRotationX]);
  

  const onSegmentClick = useCallback((value) => {
    if (value) {
      const selectedCellIds = [String(value)];
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

  const cellColorMapping = useMemo(() => {
    const colorCellMapping = {};
    cellColors.forEach((color, cell) => {
      colorCellMapping[cell] = rgbToHex(color);
    });
    // console.log("color mapping")
    return colorCellMapping;
  }, [JSON.stringify([...cellColors.entries()].sort()), rgbToHex]);

  const derivedViewerState = useMemo(() => {
    const { current } = latestViewerStateRef;

    const nextSegments = Object.keys(cellColorMapping).map(String);
    const prevSegments = current.layers[0].segments;
    const prevColors = current.layers[0].segmentColors;

    const segmentsChanged = nextSegments.length !== prevSegments.length
      || !nextSegments.every((v, i) => v === prevSegments[i]);

    const colorsChanged = !isEqual(cellColorMapping, prevColors);

    if (!segmentsChanged && !colorsChanged) {
      return current; // Reuse previous object to avoid triggering downstream re-renders
    }

    const newLayer0 = {
      ...current.layers[0],
      ...(segmentsChanged && { segments: nextSegments }),
      ...(colorsChanged && { segmentColors: cellColorMapping }),
    };

    return {
      ...current,
      layers: [newLayer0, ...current.layers.slice(1)],
    };
  }, [cellColorMapping]);


  const derivedViewerState2 = useMemo(() => {
    console.log("derivedViewerState2")
    let { projectionScale, projectionOrientation } = derivedViewerState;
  
    if (typeof spatialZoom === 'number' && BASE_SCALE) {
      projectionScale = deckZoomToProjectionScale(spatialZoom, BASE_SCALE);
    }
  
    if (lastInteractionSource.current === 'vitessce' && updateSequenceRef.current !== 'n') {
      const newQuat = eulerToQuaternion(spatialRotationX, spatialRotationY, spatialRotationZ);
  
      const shouldPush = (
        !lastReceivedFromNGRef.current ||
        valueGreaterThanEpsilon(newQuat, lastReceivedFromNGRef.current, 1e-4)
      );
  
      if (shouldPush) {
        projectionOrientation = newQuat;
        lastPushedFromVitessceRef.current = newQuat;
        
        console.log('✅ Push new orientation to NG');
      } else {
        console.log('⛔️ Skip push to NG — no change');
      }
  
      // 🔄 Reset the flag after pushing
      lastInteractionSource.current = null;
    }
  
    return {
      ...derivedViewerState,
      projectionScale,
      projectionOrientation,
    };
  }, [derivedViewerState, spatialZoom, spatialRotationX, spatialRotationY, spatialRotationZ, BASE_SCALE]);
  
  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [obsIndex, setCellHighlight]);

  // const [updateState, setUpdateState] = useState(false);
  // console.log("state", updateState, spatialTargetX, spatialTargetY, spatialZoom)

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
