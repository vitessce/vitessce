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
  compareWithEpsilon,
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
  const suppressVitessceEffectRef = useRef(false);
  // const lastPushedQuaternion = useRef(null);
  const lastPushedFromVitessceRef = useRef(null);
  const lastReceivedFromNGRef = useRef(null);
  // useRef({
  //   quat: null,
  //   timestamp: 0,
  // });

  useEffect(() => {
    if (!suppressVitessceEffectRef.current) {
    lastUpdateSource.current = 'vitessce';
  }
  }, [spatialRotationX, spatialRotationY]);

  console.log("spatialRotationX", spatialRotationX);

  const handleStateUpdate = useCallback((newState) => {
    const { projectionScale, projectionOrientation, position } = newState;
    const [pitch, yaw] = quaternionToEuler(projectionOrientation);
  
    latestViewerStateRef.current = {
      ...latestViewerStateRef.current,
      projectionScale,
      projectionOrientation,
      position,
    };
    // If Vitessce just pushed this, skip
    if (
      lastPushedFromVitessceRef.current &&
      compareWithEpsilon(projectionOrientation, lastPushedFromVitessceRef.current, 1e-4)
    ) {
      return;
    }
  
    // Store last received so we don’t re-push it
    lastReceivedFromNGRef.current = projectionOrientation;
  

  
    if (BASE_SCALE) {
      setZoom(projectionScaleToDeckZoom(projectionScale, BASE_SCALE));
    }
  
    lastUpdateSource.current = 'neuroglancer';
  
    if (Math.abs(pitch - spatialRotationX) > 0.01) {
      setRotationX(pitch);
    }
    if (Math.abs(yaw - spatialRotationY) > 0.01) {
      setRotationY(yaw);
    }
  
  }, [setZoom, setRotationX, setRotationY, BASE_SCALE, spatialRotationX, spatialRotationY]);
  

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
    let { projectionScale, projectionOrientation } = derivedViewerState;
  
    if (typeof spatialZoom === 'number' && BASE_SCALE) {
      projectionScale = deckZoomToProjectionScale(spatialZoom, BASE_SCALE);
    }
  
    if (lastUpdateSource.current === 'vitessce') {
      const newQuat = eulerToQuaternion(spatialRotationX, spatialRotationY, spatialRotationZ);
  
      // Don't re-push NG’s own state
      if (
        !lastReceivedFromNGRef.current ||
        !compareWithEpsilon(newQuat, lastReceivedFromNGRef.current, 1e-4)
      ) {
        projectionOrientation = newQuat;
        lastPushedFromVitessceRef.current = newQuat;
        console.log('✅ Push new orientation to NG');
      }
  
      lastUpdateSource.current = null;
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
