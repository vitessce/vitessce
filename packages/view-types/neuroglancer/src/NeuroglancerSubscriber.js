/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
  useObsEmbeddingData,
} from '@vitessce/vit-s';
import {
  Quaternion,
  Euler,
  MathUtils,
} from 'three';
import {
  ViewHelpMapping,
  ViewType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import { Neuroglancer } from './Neuroglancer.js';
import { useStyles } from './styles.js';

// import {compareViewerState} from './utils.js';
// let SCALE_FACTOR = null;
const SCALE_FACTOR = 74;
// const SCALE_FACTOR = 1174; //73.4; 32768/2^4.8
// const SCALE_FACTOR1 = 12.5;

/**
 * projectionScale = 2048, Vitessce zoom after loading = -4.8
 * 2048 = 2^4.8 * BASE_SCALE  (TODO: these are assumptions, based on visual comparison)
*  SCALE_FACTOR ≈ 2048 / 2^4.8 ≈ 2048 / 27.9 ≈ 73.4
* */

/**
 * Deck.gl zoom → Neuroglancer projectionScale
 */
function deckZoomToProjectionScale(zoom) {
  // console.log(SCALE_FACTOR * (2 ** -zoom), 2 ** (SCALE_FACTOR1 - zoom));
  // return 2 ** (SCALE_FACTOR1 - zoom);
  return SCALE_FACTOR * (2 ** -zoom);
}

/**
 * Neuroglancer projectionScale → Deck.gl zoom
 */
function projectionScaleToDeckZoom(projectionScale) {
  console.log("SCALE_FACTOR", SCALE_FACTOR)
  return Math.log2(SCALE_FACTOR / projectionScale);
}


function quaternionToEuler([x, y, z, w]) {
  const quaternion = new Quaternion(x, y, z, w);
  const euler = new Euler().setFromQuaternion(quaternion, 'YXZ'); // deck.gl uses Y (yaw), X (pitch), Z (roll)

  const pitch = MathUtils.radToDeg(euler.x); // X-axis rotation
  const yaw = MathUtils.radToDeg(euler.y); // Y-axis rotation

  return [pitch, yaw];
}


function eulerToQuaternion(pitch, yaw, roll) {
  const euler = new Euler(
    MathUtils.degToRad(pitch),
    MathUtils.degToRad(yaw),
    MathUtils.degToRad(roll),
    // 0, // roll is 0
    'ZXY', // Yaw-Pitch-Roll order
  );

  const quaternion = new Quaternion().setFromEuler(euler);
  return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
}

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
    // spatialRotationZ,
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


//   function getViewportHeightPx() {
//     const container = document.querySelector('#neuroglancer-container') 
//       ?? document.querySelector('.neuroglancer-display') 
//       ?? window;
  
//     return container?.clientHeight ?? window.innerHeight;
//   }

//  const projectionScale = initialViewerState.projectionScale; // e.g. 4084
// const unit = 'nm'; // based on your dimensions
// const vh = document.querySelector('#neuroglancer-container')?.clientHeight ?? window.innerHeight;

// const µm_vh = getMicronsPerViewportHeight(projectionScale, unit, vh);
// console.log("Microns per viewport height:", µm_vh.toFixed(2), 'µm/vh');

//   console.log("height", getViewportHeightPx(), initialViewerState.projectionScale)

//   console.log("subscriber loaded")

//   function getMicronsPerViewportHeight(projectionScale, unit = 'nm', viewportHeight = window.innerHeight) {
//     const conversion = {
//       nm: 1e-3,
//       µm: 1,
//       mm: 1e3,
//       m: 1e6
//     };
//     const scaleInMicrons = projectionScale * (conversion[unit] ?? 1);
//     return scaleInMicrons * viewportHeight;
//   }

  const handleStateUpdate = useCallback((newState) => {
    console.log("newStete", newState)
    // if(!compareViewerState(latestViewerState, newState)){
      latestViewerStateRef.current = {
      ...initialViewerState,
      projectionScale: newState.projectionScale,
      projectionOrientation: newState.projectionOrientation,
      position: newState.position
    };
    // }
    const { projectionScale, projectionOrientation, position } = newState;
    console.log("handleStateUpdate", spatialZoom, spatialRotationX, spatialRotationY, projectionScale, compareViewerState(latestViewerStateRef.current, newState))
    // console.log("toDeck", projectionScale, projectionScaleToDeckZoom(projectionScale))

    // setZoom(projectionScaleToDeckZoom(projectionScale));
    // const vitessceEularMapping = quaternionToEuler(projectionOrientation);
    // // TODO: support z rotation on SpatialView?
    // setRotationX(vitessceEularMapping[0]);
    // setRotationY(vitessceEularMapping[1]);
    // console.log(projectionOrientation, vitessceEularMapping, spatialRotationX, spatialRotationY)
    // // Note: To pan in Neuroglancer, use shift+leftKey+drag
    // setTargetX(position[0]);
    // setTargetY(position[1]);
    // console.log(vitessceEularMapping)
  }, [setZoom, setTargetX, setTargetY, setRotationX, setRotationY]);

  // if (
  //   SCALE_FACTOR === null
  //      && initialViewerState?.projectionScale
  //     && typeof spatialZoom === 'number'
  //     && spatialZoom !== 0
  // ) {
  //   SCALE_FACTOR = (initialViewerState.projectionScale * 1e-3) / (2 ** -spatialZoom);
  // }

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
    console.log("color mapping")
    updateCellSetUpdated(true)
    return colorCellMapping;
  }, [cellColors, rgbToHex, updateCellSetUpdated]);

  const derivedViewerState = useMemo(() => ({
    ...latestViewerStateRef.current,
    layers: latestViewerStateRef.current.layers.map((layer, index) => (index === 0
      ? {
        ...layer,
        segments: Object.keys(cellColorMapping).map(String),
        segmentColors: cellColorMapping,
      }
      : layer)),
  }), [cellColorMapping, latestViewerStateRef.current]);

  const derivedViewerState2 = useMemo(() => {
    console.log("derviedViewerstate tested", derivedViewerState)
    // let { projectionScale, projectionOrientation } = derivedViewerState;
    // const { position } = derivedViewerState;
    // if (typeof spatialZoom === 'number') {
    //   projectionScale = deckZoomToProjectionScale(spatialZoom);
    // } else {
    //   projectionScale = deckZoomToProjectionScale(0);
    // }

 
    // console.log(derivedViewerState.projectionScale, projectionScale, spatialZoom)
    // // if (typeof spatialTargetX === 'number') {
    // //    position = [spatialTargetX, spatialTargetY, derivedViewerState.position[2]];
    // // }
    // projectionOrientation = eulerToQuaternion(spatialRotationX, spatialRotationY);
    // projectionOrientation = eulerToQuaternion(spatialRotationX, 90, spatialRotationZ);

    // console.log("new and old", projectionOrientation, derivedViewerState.projectionOrientation, spatialRotationX, spatialRotationY, spatialRotationZ);
    return {
      ...derivedViewerState,
      // projectionScale,
      // position,
      // projectionOrientation,
    };
    // return derivedViewerState;
  }, [derivedViewerState, spatialZoom, spatialTargetX,
    spatialTargetY, spatialRotationX, spatialRotationY]);

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
