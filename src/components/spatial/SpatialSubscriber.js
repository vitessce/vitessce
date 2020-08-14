/* eslint-disable */
import React, {
  useState, useCallback, useEffect, useMemo, useRef,
} from 'react';
import PubSub from 'pubsub-js';
import shortNumber from 'short-number';
import TitleInfo from '../TitleInfo';
import {
  MOLECULES_ADD,
  MOLECULES_SET_OPACITY,
  MOLECULES_TURN_ON,
  NEIGHBORHOODS_ADD,
  CELLS_ADD,
  CELLS_COLOR,
  CELLS_SET_OPACITY,
  CELLS_TURN_ON,
  STATUS_INFO,
  CELLS_SELECTION,
  CELLS_HOVER,
  CLEAR_PLEASE_WAIT,
  VIEW_INFO,
  CELL_SETS_VIEW,
  LAYER_ADD,
  LAYER_REMOVE,
  LAYER_CHANGE,
  RESET,
  RASTER_ADD,
} from '../../events';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls } from '../utils';
import Spatial from './Spatial';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber';

import { useCoordination } from '../../app/state/hooks';
import { componentCoordinationTypes } from '../../app/state/coordination';

import { DEFAULT_LAYER_PROPS } from './constants';
import { buildDefaultSelection } from './utils';

export default function SpatialSubscriber(props) {
  const {
    uid,
    loaders,
    coordinationScopes,
    removeGridComponent,
    moleculeRadius,
    cellRadius,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    subobservationsPluralLabelOverride: subobservationsPluralLabel = `${subobservationsLabel}s`,
    theme,
    disableTooltip = false,
  } = props;
  // Create a UUID so that hover events
  // know from which DeckGL element they were generated.
  const uuid = uid;

  const [{
    dataset,
    spatialZoom: zoom,
    spatialTarget: target,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTarget: setTarget,
  }] = useCoordination(componentCoordinationTypes.spatial, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    ['cells', 'molecules', 'neighborhoods', 'raster', 'cell-sets'],
    Object.keys(loaders[dataset]?.loaders || {})
  );
  const [urls, addUrl, resetUrls] = useUrls();
  const [width, height, deckRef] = useDeckCanvasSize();

  const [cells, setCells] = useState();
  const [cellsCount, setCellsCount] = useState(0);
  const [cellSets, setCellSets] = useState();
  const [molecules, setMolecules] = useState();
  const [cellColors, setCellColors] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState(null);
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [imageLayerProps, setImageLayerProps] = useState({});
  const [imageLayerLoaders, setImageLayerLoaders] = useState({});
  const [cellOpacity, setCellOpacity] = useState(1);
  const [areCellsOn, setCellsOn] = useState(true);
  const [moleculesOpacity, setMoleculesOpacity] = useState(1);
  const [areMoleculesOn, setMoleculesOn] = useState(true);

  useEffect(() => {
    resetUrls();
    resetReadyItems();

    loaders[dataset]?.loaders['molecules']?.load().then(({ data, url }) => {
      setMolecules(data);
      addUrl(url, 'Molecules');
      setItemIsReady('molecules');
    });

    loaders[dataset]?.loaders['neighborhoods']?.load().then(({ data, url }) => {
      setNeighborhoods(data);
      addUrl(url, 'Neighborhoods');
      setItemIsReady('neighborhoods');
    });

    loaders[dataset]?.loaders['cells']?.load().then(({ data, url }) => {
      setCells(data);
      setCellsCount(Object.keys(data).length);
      addUrl(url, 'Cells');
      setItemIsReady('cells');
    });

    loaders[dataset]?.loaders['cell-sets']?.load().then(({ data, url }) => {
      setCellSets(data);
      addUrl(url, 'Cell Sets');
      setItemIsReady('cell-sets');
    });

    loaders[dataset]?.loaders['raster']?.load().then(({ data: { images, layers }, urls }) => {
      layers.forEach(({ layerId, loader }) => {
        setImageLayerProps(prevLayerProps => ({ ...prevLayerProps, [layerId]: DEFAULT_LAYER_PROPS }));
        setImageLayerLoaders(prevLoaders => ({ ...prevLoaders, [layerId]: loader }));

        // TODO: initialize layers and channels and set their options in the view config.
      });
      urls.forEach(([url, name]) => {
        addUrl(url, name);
      });
      setItemIsReady('raster');
    });
    
  }, [loaders, dataset]);


  const [moleculesCount, locationsCount] = useMemo(() => {
    if (!molecules) return [0, 0];
    return [
      Object.keys(molecules).length,
      Object.values(molecules)
        .map(l => l.length)
        .reduce((a, b) => a + b, 0),
    ];
  }, [molecules]);

  // TODO: remove these pubsub callbacks, use coordination objects instead.
  const updateStatus = useCallback(
    message => PubSub.publish(STATUS_INFO, message),
    [],
  );
  const updateCellsSelection = useCallback(
    selectedIds => PubSub.publish(CELLS_SELECTION, selectedIds),
    [],
  );
  const updateCellsHover = useCallback(
    hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo),
    [],
  );
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

  return (
    <TitleInfo
      title="Spatial"
      info={
        `${cellsCount} ${pluralize(observationsLabel, observationsPluralLabel, cellsCount)},
         ${moleculesCount} ${pluralize(subobservationsLabel, subobservationsPluralLabel, moleculesCount)}
         at ${shortNumber(locationsCount)} locations`
      }
      isSpatial
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <Spatial
        ref={deckRef}
        zoom={zoom}
        target={target}
        setZoom={setZoom}
        setTarget={setTarget}
        cells={cells}
        selectedCellIds={selectedCellIds}
        neighborhoods={neighborhoods}
        molecules={molecules}
        moleculesOpacity={moleculesOpacity}
        areCellsOn={areCellsOn}
        cellOpacity={cellOpacity}
        cellColors={cellColors}
        areMoleculesOn={areMoleculesOn}
        imageLayerProps={imageLayerProps}
        imageLayerLoaders={imageLayerLoaders}
        cellRadius={cellRadius}
        moleculeRadius={moleculeRadius}
        uuid={uuid}
        updateStatus={updateStatus}
        updateCellsSelection={updateCellsSelection}
        updateCellsHover={updateCellsHover}
        updateViewInfo={updateViewInfo}
      />
      {!disableTooltip && (
      <SpatialTooltipSubscriber
        uuid={uuid}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
      />
      )}
    </TitleInfo>
  );
}

SpatialSubscriber.defaultProps = {
  cellRadius: 50,
  moleculeRadius: 10,
};
