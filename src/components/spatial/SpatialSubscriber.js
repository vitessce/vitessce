/* eslint-disable */
import React, {
  useState, useCallback, useEffect, useMemo,
} from 'react';
import PubSub from 'pubsub-js';
import TitleInfo from '../TitleInfo';
import {
  VIEW_INFO,
} from '../../events';
import { capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls } from '../utils';
import {
  useCellsData, useCellSetsData, useExpressionMatrixData,
  useMoleculesData, useNeighborhoodsData, useRasterData
} from '../data-hooks';
import { getCellColors } from '../interpolate-colors';
import Spatial from './Spatial';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber';
import { makeSpatialSubtitle } from './utils';
import { DEFAULT_MOLECULES_LAYER, DEFAULT_CELLS_LAYER } from './constants';
import { useCoordination } from '../../app/state/hooks';
import { componentCoordinationTypes } from '../../app/state/coordination';

const SPATIAL_DATA_TYPES = [
  'cells', 'molecules', 'raster', 'cell-sets', 'expression-matrix'
];

export default function SpatialSubscriber(props) {
  const {
    uuid,
    loaders,
    coordinationScopes,
    removeGridComponent,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    subobservationsPluralLabelOverride: subobservationsPluralLabel = `${subobservationsLabel}s`,
    theme,
    disableTooltip = false,
  } = props;

  // Get "props" from the coordination space.
  const [{
    dataset,
    spatialZoom: zoom,
    spatialTargetX: targetX,
    spatialTargetY: targetY,
    spatialTargetZ: targetZ,
    spatialLayers: layers,
    cellFilter,
    cellSelection,
    cellHighlight,
    geneSelection,
    cellSetSelection,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialLayers: setLayers,
    setCellFilter,
    setCellSelection,
    setCellHighlight,
  }] = useCoordination(componentCoordinationTypes.spatial, coordinationScopes);
  
  const [autoLayers, setAutoLayers] = useState([]);
  
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
    setAutoLayers([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells, cellsCount] = useCellsData(
    loaders, dataset, setItemIsReady, addUrl, false,
    () =>  setAutoLayers(prev => ([...prev, DEFAULT_CELLS_LAYER]))
  );
  const [molecules, moleculesCount, locationsCount] = useMoleculesData(
    loaders, dataset, setItemIsReady, addUrl, false,
    () =>  setAutoLayers(prev => ([...prev, DEFAULT_MOLECULES_LAYER]))
  );
  // TODO: set up a neighborhoods default layer and add to autoLayers.
  const [neighborhoods] = useNeighborhoodsData(
    loaders, dataset, setItemIsReady, addUrl, false
  );
  const [cellSets] = useCellSetsData(
    loaders, dataset, setItemIsReady, addUrl, false
  );
  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, false
  );
  // eslint-disable-next-line no-unused-vars
  const [raster, imageLayerLoaders] = useRasterData(
    loaders, dataset, setItemIsReady, addUrl, false,
    (autoImageLayers) => {
      setAutoLayers(prev => ([...prev, ...autoImageLayers]));
    },
  );
  
  // Try to set up the layers array automatically if null or undefined.
  useEffect(() => {
    if(isReady && !layers) {
      // TODO: Sort the automatic layer list by layer type (molecules < cells < raster).
      setLayers(autoLayers);
    }
  }, [autoLayers, isReady, layers, setLayers]);

  const cellColors = useMemo(() => {
    return getCellColors({
      expressionMatrix,
      geneSelection,
      cellColorEncoding: 'geneSelection',
      cellSets,
      cellSetSelection,
    })
  }, [geneSelection, cellSets, cellSetSelection, expressionMatrix]);

  const updateViewInfo = useCallback(
    viewInfo => PubSub.publish(VIEW_INFO, viewInfo),
    [],
  );

  const getCellInfo = (cellId) => {
    const cell = cells[cellId]
    if(cell) {
      return {
        [`${capitalize(observationsLabel)} ID`]: cellId,
        ...cell.factors,
      };
    }
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
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={({ zoom, target }) => {
          setZoom(zoom);
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

        setCellFilter={setCellFilter}
        setCellSelection={setCellSelection}
        setCellHighlight={setCellHighlight}

        molecules={molecules}
        neighborhoods={neighborhoods}
        imageLayerLoaders={imageLayerLoaders}
        
        updateViewInfo={updateViewInfo}
      />
      {!disableTooltip && (
      <SpatialTooltipSubscriber
        uuid={uuid}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
        coordinationScopes={coordinationScopes}
      />
      )}
    </TitleInfo>
  );
}
