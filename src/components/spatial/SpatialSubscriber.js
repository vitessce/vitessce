import React, {
  useState, useEffect, useMemo, useCallback,
} from 'react';
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
import SpatialOptions from './SpatialOptions';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber';
import {
  makeSpatialSubtitle,
  initializeLayerChannelsIfMissing,
  sortLayers,
  getInitialSpatialTargets,
} from './utils';
import {
  DEFAULT_MOLECULES_LAYER,
  DEFAULT_CELLS_LAYER,
  DEFAULT_NEIGHBORHOODS_LAYER,
} from './constants';
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

const SPATIAL_LAYER_TYPES = [
  'cells', 'molecules', 'raster', 'neighborhoods',
];

export default function SpatialSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    removeGridComponent,
    initializeLayers = true,
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

  const [autoLayers, setAutoLayers] = useState({
    [dataset]: [
      loaders[dataset].loaders.cells?.url ? DEFAULT_CELLS_LAYER : null,
      loaders[dataset].loaders.molecules?.url ? DEFAULT_MOLECULES_LAYER : null,
      loaders[dataset].loaders.neighborhoods?.url ? DEFAULT_NEIGHBORHOODS_LAYER : null,
    ].filter(Boolean),
  });

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
    setAutoLayers({
      [dataset]: [
        loaders[dataset].loaders.cells?.url ? DEFAULT_CELLS_LAYER : null,
        loaders[dataset].loaders.molecules?.url ? DEFAULT_MOLECULES_LAYER : null,
        loaders[dataset].loaders.neighborhoods?.url ? DEFAULT_NEIGHBORHOODS_LAYER : null,
      ].filter(Boolean),
    });
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
    autoImageLayers => setAutoLayers(prev => (
      // This prevents old updates from overriding the current dataset.
      // The previous state must be for this dataset, otherwise it's an old update.
      Object.keys(prev).includes(dataset)
        ? { [dataset]: [...(prev[dataset] || []), ...autoImageLayers] }
        : prev
    )),
  );
  // Try to set up the layers array automatically if null or undefined.
  useEffect(() => {
    // Check if the autoLayers have a layer for each spatial layer loader type.
    const areAutoLayersComplete = Object.keys(loaders[dataset].loaders)?.every(
      loaderType => !SPATIAL_LAYER_TYPES.includes(loaderType)
        || (
          autoLayers[dataset] && autoLayers[dataset].filter(
            layer => layer.type === loaderType,
          ).length > 0
        )
    );
    if (isReady && initializeLayers) {
      if (!layers && autoLayers[dataset] && areAutoLayersComplete) {
        setLayers(sortLayers(autoLayers[dataset]));
      } else if (layers) {
        // Layers were defined, but check whether channels for each layer were also defined.
        // If channel / slider / domain definitions are missing, initialize in automatically.
        initializeLayerChannelsIfMissing(layers, imageLayerLoaders).then(
          ([newLayers, didInitialize]) => {
            if (didInitialize) {
              // Channels were only partially defined.
              setLayers(newLayers);
            }
          },
        );
      }
      if ((typeof targetX !== 'number' || typeof targetY !== 'number')) {
        const { initialTargetX, initialTargetY, initialZoom } = getInitialSpatialTargets({
          width,
          height,
          cells,
          imageLayerLoaders,
        });
        setTargetX(initialTargetX);
        setTargetY(initialTargetY);
        setZoom(initialZoom);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, loaders, autoLayers, imageLayerLoaders,
    isReady, layers, setLayers, initializeLayers, cells]);

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
      options={(
        <SpatialOptions
          observationsLabel={observationsLabel}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
        />
      )}
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
