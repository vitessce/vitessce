import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
  useObsEmbeddingData,
  useNeuroglancerViewerState,
  useSetNeuroglancerViewerState,
} from '@vitessce/vit-s';

import { ViewHelpMapping, ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import React, { useCallback, useMemo, useEffect } from 'react';
import { Neuroglancer } from './Neuroglancer.js';

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
  } = props;

  const [{
    dataset,
    obsType,
    spatialZoom,
    spatialTargetX,
    spatialTargetY,
    // spatialTargetZ,
    // spatialRotationX,
    // spatialRotationY,
    // spatialRotationZ,
    // spatialAxisFixed,
    // spatialOrbitAxis,
    // obsHighlight: cellHighlight,
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
    // setSpatialTargetZ: setTargetZ,
    setSpatialRotationX: setRotationX,
    setSpatialRotationY: setRotationY,
    setSpatialRotationZ: setRotationZ,
    // setSpatialRotationOrbit: setRotationOrbit,
    setSpatialZoom: setZoom,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER], coordinationScopes);


  const loaders = useLoaders();
  const setViewerState = useSetNeuroglancerViewerState();
  const [{ obsSets: cellSets }] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );

  const [
    { obsIndex },
  ] = useObsEmbeddingData(
    loaders, dataset, true, {}, {},
    { obsType, embeddingType: mapping },
  );

  const viewerState = useNeuroglancerViewerState();

  useEffect(() => {
    if (!spatialZoom || !spatialTargetX || !spatialTargetY) return;
    const projectionScale = mapVitessceToNeuroglancer(spatialZoom);
    const position = [spatialTargetX, spatialTargetY, viewerState.position[2]];
    // console.log("postiion", position)
    const updatedState = { ...viewerState, projectionScale, position };
    setViewerState(updatedState);
  }, [spatialZoom, spatialTargetX, spatialTargetY]);


  const handleStateUpdate = useCallback((newState) => {
    setZoom(mapNeuroglancerToVitessce(newState.projectionScale));
    // To map xyz rotation
    setRotationX(newState.projectionOrientation[0]);
    setRotationY(newState.projectionOrientation[1]);
    setRotationZ(newState.projectionOrientation[2]);
    // Note: To pan in Neuroglancer, use shift+leftKey+drag
    setTargetX(newState.position[0]);
    setTargetY(newState.position[1]);
    // console.log(newState.position);
  }, []);

  const handleSegmentClick = useCallback((value) => {
    if (value) {
      const selectedCellIds = [value];
      setObsSelection(
        selectedCellIds, additionalCellSets, cellSetColor,
        setCellSetSelection, setAdditionalCellSets, setCellSetColor,
        setCellColorEncoding,
        'Selection ',
        `: based on selected segments ${value} `,
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

  const onSegmentHighlight = useCallback((obsId) => {
    // console.log("obsId", obsId, cellHighlight)
    // TODO: not working
    setCellHighlight(obsId);
  }, [viewerState]);

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
    >
      <Neuroglancer
        cellColorMapping={cellColorMapping}
        onSegmentClick={handleSegmentClick}
        onSelectHoveredCoords={onSegmentHighlight}
        onViewerStateUpdate={handleStateUpdate}
      />
    </TitleInfo>
  );
}
