/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo } from 'react';
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
import { Neuroglancer } from './Neuroglancer.js';
import { useStyles } from './styles.js';

const NEUROGLANCER_ZOOM_BASIS = 16;

function mapVitessceToNeuroglancer(zoom) {
  return NEUROGLANCER_ZOOM_BASIS * (2 ** -zoom);
}

function mapNeuroglancerToVitessce(projectionScale) {
  return -Math.log2(projectionScale / NEUROGLANCER_ZOOM_BASIS);
}

function quaternionToEuler([x, y, z, w]) {
  // X-axis rotation (Roll)
  const thetaX = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));

  // Y-axis rotation (Pitch)
  const sinp = 2 * (w * y - z * x);
  const thetaY = Math.abs(sinp) >= 1 ? Math.sign(sinp) * (Math.PI / 2) : Math.asin(sinp);

  // Convert to degrees as Vitessce expects degrees?
  return [thetaX * (180 / Math.PI), thetaY * (180 / Math.PI)];
}


function eulerToQuaternion(thetaX, thetaY) {
  // Convert Euler angles (X, Y rotations) to quaternion
  const halfThetaX = thetaX / 2;
  const halfThetaY = thetaY / 2;

  const sinX = Math.sin(halfThetaX);
  const cosX = Math.cos(halfThetaX);
  const sinY = Math.sin(halfThetaY);
  const cosY = Math.cos(halfThetaY);

  return [
    sinX * cosY,
    cosX * sinY,
    sinX * sinY,
    cosX * cosY,
  ];
}

function normalizeQuaternion(q) {
  const length = Math.sqrt((q[0] ** 2) + (q[1] ** 2) + (q[2] ** 2) + (q[3] ** 2));
  return q.map(value => value / length);
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

  const handleStateUpdate = useCallback((newState) => {
    const { projectionScale, projectionOrientation, position } = newState;
    setZoom(mapNeuroglancerToVitessce(projectionScale));
    const vitessceEularMapping = quaternionToEuler(projectionOrientation);

    // TODO: support z rotation on SpatialView?
    setRotationX(vitessceEularMapping[0]);
    setRotationY(vitessceEularMapping[1]);

    // Note: To pan in Neuroglancer, use shift+leftKey+drag
    setTargetX(position[0]);
    setTargetY(position[1]);
  }, [setZoom, setTargetX, setTargetY, setRotationX, setRotationY]);

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
    return colorCellMapping;
  }, [cellColors, rgbToHex]);

  const derivedViewerState = useMemo(() => ({
    ...initialViewerState,
    layers: initialViewerState.layers.map((layer, index) => (index === 0
      ? {
        ...layer,
        segments: Object.keys(cellColorMapping).map(String),
        segmentColors: cellColorMapping,
      }
      : layer)),
  }), [cellColorMapping, initialViewerState]);

  const derivedViewerState2 = useMemo(() => {
    if (typeof spatialZoom === 'number' && typeof spatialTargetX === 'number') {
      const projectionScale = mapVitessceToNeuroglancer(spatialZoom);
      const position = [spatialTargetX, spatialTargetY, derivedViewerState.position[2]];
      const projectionOrientation = normalizeQuaternion(
        eulerToQuaternion(spatialRotationX, spatialRotationY),
      );
      return {
        ...derivedViewerState,
        projectionScale,
        position,
        projectionOrientation,
      };
    }
    return derivedViewerState;
  }, [derivedViewerState, spatialZoom, spatialTargetX,
    spatialTargetY, spatialRotationX, spatialRotationY]);

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
        setViewerState={handleStateUpdate}
      />
    </TitleInfo>
  );
}
