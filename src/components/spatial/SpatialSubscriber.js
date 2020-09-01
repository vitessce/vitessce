import React, {
  useState, useEffect, useMemo,
} from 'react';
import PubSub from 'pubsub-js';
import TitleInfo from '../TitleInfo';
import {
  VIEW_INFO,
} from '../../events';
import { capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls } from '../hooks';
import {
  useCellsData, useCellSetsData, useExpressionMatrixData,
  useMoleculesData, useNeighborhoodsData, useRasterData,
} from '../data-hooks';
import { getCellColors } from '../interpolate-colors';
import Spatial from './Spatial';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber';
import { makeSpatialSubtitle, initializeLayerChannelsIfMissing, sortLayers } from './utils';
import { DEFAULT_MOLECULES_LAYER, DEFAULT_CELLS_LAYER } from './constants';
import { useCoordination, useLoaders, useSetComponentHover } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

const SPATIAL_DATA_TYPES = [
  'cells', 'molecules', 'raster', 'cell-sets', 'expression-matrix',
];

const updateViewInfo = viewInfo => PubSub.publish(VIEW_INFO, viewInfo);

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
    cellColorEncoding,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialLayers: setLayers,
    setCellFilter,
    setCellSelection,
    setCellSetSelection,
    setCellHighlight,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.spatial, coordinationScopes);

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
    () => setAutoLayers(prev => ([...prev, DEFAULT_CELLS_LAYER])),
  );
  const [molecules, moleculesCount, locationsCount] = useMoleculesData(
    loaders, dataset, setItemIsReady, addUrl, false,
    () => setAutoLayers(prev => ([...prev, DEFAULT_MOLECULES_LAYER])),
  );
  // TODO: set up a neighborhoods default layer and add to autoLayers.
  const [neighborhoods] = useNeighborhoodsData(
    loaders, dataset, setItemIsReady, addUrl, false,
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
    (autoImageLayers) => {
      setAutoLayers(prev => ([...prev, ...autoImageLayers]));
    },
  );

  // Try to set up the layers array automatically if null or undefined.
  useEffect(() => {
    if (isReady && !layers) {
      setLayers(sortLayers(autoLayers));
    } else if (isReady && layers) {
      // Layers were defined, but check whether channels for each layer were also defined.
      // If channel / slider / domain definitions are missing, initialize in automatically.
      initializeLayerChannelsIfMissing(layers, imageLayerLoaders)
        .then(([newLayers, didInitialize]) => {
          if (didInitialize) {
            // Channels were only partially defined.
            setLayers(newLayers);
          }
        });
    }
  }, [autoLayers, imageLayerLoaders, isReady, layers, setLayers]);

  const cellColors = useMemo(() => getCellColors({
    cellColorEncoding,
    expressionMatrix,
    geneSelection,
    cellSets,
    cellSetSelection,
  }), [cellColorEncoding, geneSelection, cellSets, cellSetSelection, expressionMatrix]);

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
        setCellSelection={(v) => {
          setCellSetSelection(null);
          setCellSelection(v);
        }}
        setCellHighlight={setCellHighlight}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={updateViewInfo}
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
