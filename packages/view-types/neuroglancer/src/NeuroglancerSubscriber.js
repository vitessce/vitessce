import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
  // useMultiObsLabels,
  // useGetObsInfo,
  // useDeckCanvasSize,
  useObsEmbeddingData,
  useNeuroglancerViewerState,
} from '@vitessce/vit-s';

import { ViewHelpMapping, ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import React, { useCallback, useMemo, useState } from 'react';
// import ForwardedNeuroglancer from './Neuroglancer';
import { Neuroglancer } from './Neuroglancer.js';
import { NeuroglancerTooltipSubscriber } from './NeuroglancerTooltipSubscriber.js';

export function NeuroglancerSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    // observationsLabelOverride,
    uuid,
    title = 'Neuroglancer',
    helpText = ViewHelpMapping.NEUROGLANCER,
  } = props;

  const [{
    dataset,
    obsType,
    // spatialZoom,
    // spatialTargetX,
    // spatialTargetY,
    // spatialTargetZ,
    // spatialRotationX,
    // spatialRotationY,
    // spatialRotationZ,
    // spatialAxisFixed,
    // spatialOrbitAxis,
    // obsSelection,
    // obsSelectionMode,
    // obsColorEncoding,
    // obsFilter,
    // obsSetFilter,
    obsHighlight: cellHighlight,
    tooltipsVisible,
    embeddingType: mapping,
    obsSetSelection: cellSetSelection,
    additionalObsSets: additionalCellSets,
    obsSetColor: cellSetColor,
  }, {
    setAdditionalObsSets: setAdditionalCellSets,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setObsSetSelection: setCellSetSelection,
    // setTooltipsVisible
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER], coordinationScopes);


  const loaders = useLoaders();
  const viewerState = useNeuroglancerViewerState();
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
  // // TODO: get dimensions for Neuroglancer Canvas
  // const [deckWidth, deckHeight, deckRef] = useDeckCanvasSize();
  // const observationsLabel = observationsLabelOverride || obsType;
  // const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
  //   coordinationScopes, obsType, loaders, dataset,
  // );


  const getTranformedCoordinates = useCallback((data) => {
    const { x, y, z, width, height } = data;
    const { position, projectionOrientation, projectionScale } = viewerState;
    const [px, py, pz] = position;
    const [qx, qy, qz, qw] = projectionOrientation;

    const norm = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
    const qxNorm = qx / norm;
    const qyNorm = qy / norm;
    const qzNorm = qz / norm;
    const qwNorm = qw / norm;

    // Calculate rotation matrix from quaternion
    const xx = 1 - 2 * (qyNorm * qyNorm + qzNorm * qzNorm);
    const xy = 2 * (qxNorm * qyNorm - qwNorm * qzNorm);
    const xz = 2 * (qxNorm * qzNorm + qwNorm * qyNorm);
    const yx = 2 * (qxNorm * qyNorm + qwNorm * qzNorm);
    const yy = 1 - 2 * (qxNorm * qxNorm + qzNorm * qzNorm);
    const yz = 2 * (qyNorm * qzNorm - qwNorm * qxNorm);
    const zx = 2 * (qxNorm * qzNorm - qwNorm * qyNorm);
    const zy = 2 * (qyNorm * qzNorm + qwNorm * qxNorm);
    const zz = 1 - 2 * (qxNorm * qxNorm + qyNorm * qyNorm);

    // Apply rotation matrix to the difference vector (coords - position)
    const dx = x - px;
    const dy = y - py;
    const dz = z - pz;

    const rx = xx * dx + xy * dy + xz * dz;
    const ry = yx * dx + yy * dy + yz * dz;
    const rz = zx * dx + zy * dy + zz * dz;

    // Apply perspective projection -- 12 seems to be the padding
    const projectedX = ((rx / (rz + projectionScale)) * projectionScale + width / 2) + 12;
    const projectedY = ((ry / (rz + projectionScale)) * projectionScale + height / 2) + 12;

    // Clamp coordinates to viewport
    const clampedX = Math.max(0, Math.min(projectedX, width));
    const clampedY = Math.max(0, Math.min(projectedY, height));

    // console.log(data, projectedX, projectedY, clampedX, clampedY);
    return {
      x: clampedX,
      y: clampedY,
    };
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


  // const getObsInfo = useGetObsInfo(
  //   observationsLabel, obsLabelsTypes, obsLabelsData, obsSetsMembership,
  // );

  const [hoverData, setHoverData] = useState({
    tooltipX: null,
    tooltipY: null,
    hoverInfo: null,
    width: null,
    height: null,
  });

  const handleHoverData = (data) => {
    const transformedData = getTranformedCoordinates(data);
    setHoverData({
      tooltipX: transformedData.x,
      tooltipY: transformedData.y,
      hoverInfo: data.hoveredId,
      width: data.width,
      height: data.height,
    });
  };

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
        onSelectHoveredCoords={handleHoverData}
        // ref={deckRef}
      />
      {tooltipsVisible && (
        <NeuroglancerTooltipSubscriber
          parentUuid={uuid}
          width={hoverData.width}
          height={hoverData.height}
          x={hoverData.tooltipX}
          y={hoverData.tooltipY}
          hoverInfo={hoverData.hoverInfo}
          obsHighlight={cellHighlight}
        />
      )}
    </TitleInfo>
  );
}
