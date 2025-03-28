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
import Neuroglancer from './Neuroglancer.js';
import { useStyles } from './styles.js';

const NEUROGLANCER_ZOOM_BASIS = 16;

function mapVitessceToNeuroglancer(zoom) {
  return NEUROGLANCER_ZOOM_BASIS * (2 ** -zoom);
}

function mapNeuroglancerToVitessce(projectionScale) {
  return -Math.log2(projectionScale / NEUROGLANCER_ZOOM_BASIS);
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
    spatialTargetZ,
    spatialRotationX,
    spatialRotationY,
    spatialRotationZ,
    spatialRotationOrbit,
    spatialOrbitAxis,
    obsHighlight: cellHighlight,
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
    setSpatialTargetZ: setTargetZ,
    setSpatialRotationX: setRotationX,
    setSpatialRotationY: setRotationY,
    setSpatialRotationZ: setRotationZ,
    setSpatialRotationOrbit: setRotationOrbit,

    setSpatialZoom: setZoom,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER], coordinationScopes);

  const classes = useStyles();
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

    // To map xyz rotation
    setRotationX(projectionOrientation[0]);
    setRotationY(projectionOrientation[1]);
    setRotationZ(projectionOrientation[2]);

    // Note: To pan in Neuroglancer, use shift+leftKey+drag
    setTargetX(position[0]);
    setTargetY(position[1]);
  }, [setZoom, setRotationX, setRotationY, setRotationZ, setTargetX, setTargetY]);

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
      return {
        ...derivedViewerState,
        projectionScale,
        position,
      };
    }
    return derivedViewerState;
  }, [derivedViewerState, spatialZoom, spatialTargetX, spatialTargetY]);

  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [obsIndex]);

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
