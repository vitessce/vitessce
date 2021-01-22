import React, { useEffect, useMemo, useCallback } from 'react';
import TitleInfo from '../TitleInfo';
import { capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls } from '../hooks';
import { setCellSelection, mergeCellSets } from '../utils';
import {
  useCellsData, useCellSetsData, useExpressionMatrixData,
  useMoleculesData, useNeighborhoodsData, useRasterData,
} from '../data-hooks';
import { getCellColors } from '../interpolate-colors';
import Spatial from './Spatial';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber';
import { makeSpatialSubtitle } from './utils';
import {
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

const SPATIAL_DATA_TYPES = [
  'cells', 'molecules', 'raster', 'cell-sets', 'expression-matrix',
];

export default function SpatialSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    removeGridComponent,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    subobservationsPluralLabelOverride: subobservationsPluralLabel = `${subobservationsLabel}s`,
    theme,
    disableTooltip = false,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Get "props" from the coordination space.
  const [{
    dataset,
    spatialZoom: zoom,
    spatialTargetX: targetX,
    spatialTargetY: targetY,
    spatialTargetZ: targetZ,
    spatialLayers: layers,
    cellFilter,
    cellHighlight,
    geneSelection,
    cellSetSelection,
    cellSetColor,
    cellColorEncoding,
    additionalCellSets,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialLayers: setLayers,
    setCellFilter,
    setCellSetSelection,
    setCellHighlight,
    setCellSetColor,
    setCellColorEncoding,
    setAdditionalCellSets,
    setMoleculeHighlight,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.spatial, coordinationScopes);

  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    SPATIAL_DATA_TYPES,
  );
  const [width, height, deckRef] = useDeckCanvasSize();

  // Reset file URLs and loader progress when the dataset has changed.
  // Also clear the array of automatically-initialized layers.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells, cellsCount] = useCellsData(
    loaders, dataset, setItemIsReady, addUrl, false,
    () => {},
  );
  const [molecules, moleculesCount, locationsCount] = useMoleculesData(
    loaders, dataset, setItemIsReady, addUrl, false,
    () => {},
  );
  const [neighborhoods] = useNeighborhoodsData(
    loaders, dataset, setItemIsReady, addUrl, false,
    () => {},
  );
  const [cellSets] = useCellSetsData(
    loaders, dataset, setItemIsReady, addUrl, false,
  );
  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, false,
  );
  // eslint-disable-next-line no-unused-vars
  const [raster, imageLayerLoaders] = useRasterData(
    loaders, dataset, setItemIsReady, addUrl, false,
    { setSpatialLayers: setLayers },
  );

  const mergedCellSets = useMemo(() => mergeCellSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  const setCellSelectionProp = useCallback((v) => {
    setCellSelection(
      v, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
    );
  }, [additionalCellSets, cellSetColor, setCellColorEncoding,
    setAdditionalCellSets, setCellSetColor, setCellSetSelection]);

  const cellColors = useMemo(() => getCellColors({
    cellColorEncoding,
    expressionMatrix,
    geneSelection,
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
  }), [cellColorEncoding, geneSelection, mergedCellSets,
    cellSetColor, cellSetSelection, expressionMatrix]);

  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  const getCellInfo = (cellId) => {
    const cell = cells[cellId];
    if (cell) {
      return {
        [`${capitalize(observationsLabel)} ID`]: cellId,
        ...cell.factors,
      };
    }
    return null;
  };

  const subtitle = makeSpatialSubtitle({
    observationsCount: cellsCount,
    observationsLabel,
    observationsPluralLabel,
    subobservationsCount: moleculesCount,
    subobservationsLabel,
    subobservationsPluralLabel,
    locationsCount,
  });
  return (
    <TitleInfo
      title="Spatial"
      info={subtitle}
      isSpatial
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <Spatial
        ref={deckRef}
        uuid={uuid}
        width={width}
        height={height}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={({ zoom: newZoom, target }) => {
          setZoom(newZoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
          setTargetZ(target[2]);
        }}
        layers={layers}
        cells={cells}
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        cellColors={cellColors}
        molecules={molecules}
        neighborhoods={neighborhoods}
        imageLayerLoaders={imageLayerLoaders}
        setCellFilter={setCellFilter}
        setCellSelection={setCellSelectionProp}
        setCellHighlight={setCellHighlight}
        setMoleculeHighlight={setMoleculeHighlight}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
      />
      {!disableTooltip && (
      <SpatialTooltipSubscriber
        parentUuid={uuid}
        cellHighlight={cellHighlight}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
      />
      )}
    </TitleInfo>
  );
}
