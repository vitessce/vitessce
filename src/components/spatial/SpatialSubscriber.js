import React, {
  useState, useCallback, useEffect, useMemo,
} from 'react';
import PubSub from 'pubsub-js';
import shortNumber from 'short-number';

import TitleInfo from '../TitleInfo';
import {
  MOLECULES_ADD,
  MOLECULES_OPACITY,
  NEIGHBORHOODS_ADD,
  CELLS_ADD,
  CELLS_COLOR,
  CELLS_OPACITY,
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
} from '../../events';
import Spatial from './Spatial';

export default function SpatialSubscriber({
  children,
  onReady,
  removeGridComponent,
  moleculeRadius,
  view,
  cellRadius,
  uuid = null,
}) {
  const [cells, setCells] = useState(null);
  const [molecules, setMolecules] = useState(null);
  const [cellColors, setCellColors] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState(null);
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [imageLayerProps, setImageLayerProps] = useState({});
  const [imageLayerLoaders, setImageLayerLoaders] = useState({});
  const [cellOpacity, setCellOpacity] = useState(1);
  const [moleculesOpacity, setMoleculesOpacity] = useState(1);

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    const moleculesAddSubscriber = (msg, newMolecules) => setMolecules(newMolecules);
    const neighborhoodsAddSubscriber = (msg, newNeighborhoods) => setNeighborhoods(newNeighborhoods); // eslint-disable-line max-len
    const cellsAddSubscriber = (msg, newCells) => setCells(newCells);
    const cellsSelectionSubscriber = (msg, newCellIds) => setSelectedCellIds(newCellIds);
    const cellsColorSubscriber = (msg, newColors) => setCellColors(newColors);
    const cellsOpacitySubscriber = (msg, newCellOpacity) => setCellOpacity(newCellOpacity);
    const moleculesOpacitySubscriber = (msg, newMoleculesOpacity) => setMoleculesOpacity(
      newMoleculesOpacity,
    );
    function layerAddSubscriber(msg, { layerId, loader, layerProps }) {
      setImageLayerProps(prevLayerProps => ({ ...prevLayerProps, [layerId]: layerProps }));
      setImageLayerLoaders(prevLoaders => ({ ...prevLoaders, [layerId]: loader }));
    }
    function layerChangeSubscriber(msg, { layerId, layerProps }) {
      setImageLayerProps(prevLayerProps => ({
        ...prevLayerProps,
        [layerId]: { ...prevLayerProps[layerId], ...layerProps },
      }));
    }
    function layerRemoveSubscriber(msg, layerId) {
      setImageLayerLoaders((prevLoaders) => {
        const { [layerId]: _, ...nextLoaders } = prevLoaders;
        return nextLoaders;
      });
      setImageLayerProps((prevLayerProps) => {
        const { [layerId]: _, ...nextLayerProps } = prevLayerProps;
        return nextLayerProps;
      });
    }
    function clearSubscriber() {
      setCells(null);
      setMolecules(null);
      setNeighborhoods(null);
      setImageLayerProps({});
      setImageLayerLoaders({});
    }

    const moleculesAddToken = PubSub.subscribe(MOLECULES_ADD, moleculesAddSubscriber);
    const moleculesOpacityToken = PubSub.subscribe(MOLECULES_OPACITY, moleculesOpacitySubscriber);
    const neighborhoodsAddToken = PubSub.subscribe(NEIGHBORHOODS_ADD, neighborhoodsAddSubscriber);
    const cellsAddToken = PubSub.subscribe(CELLS_ADD, cellsAddSubscriber);
    const cellsSelectionToken = PubSub.subscribe(CELLS_SELECTION, cellsSelectionSubscriber);
    const cellSetsViewToken = PubSub.subscribe(CELL_SETS_VIEW, cellsSelectionSubscriber);
    const cellsColorToken = PubSub.subscribe(CELLS_COLOR, cellsColorSubscriber);
    const layerAddToken = PubSub.subscribe(LAYER_ADD, layerAddSubscriber);
    const layerChangeToken = PubSub.subscribe(LAYER_CHANGE, layerChangeSubscriber);
    const layerRemoveToken = PubSub.subscribe(LAYER_REMOVE, layerRemoveSubscriber);
    const cellsOpacityToken = PubSub.subscribe(CELLS_OPACITY, cellsOpacitySubscriber);
    const resetToken = PubSub.subscribe(RESET, clearSubscriber);
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(moleculesAddToken);
      PubSub.unsubscribe(moleculesOpacityToken);
      PubSub.unsubscribe(neighborhoodsAddToken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsSelectionToken);
      PubSub.unsubscribe(cellSetsViewToken);
      PubSub.unsubscribe(cellsColorToken);
      PubSub.unsubscribe(cellsOpacityToken);
      PubSub.unsubscribe(layerAddToken);
      PubSub.unsubscribe(layerChangeToken);
      PubSub.unsubscribe(layerRemoveToken);
      PubSub.unsubscribe(resetToken);
    };
  }, [onReadyCallback]);

  const cellsCount = useMemo(() => (cells ? Object.keys(cells).length : 0), [cells]);
  const [moleculesCount, locationsCount] = useMemo(() => {
    if (!molecules) return [0, 0];
    return [
      Object.keys(molecules).length,
      Object.values(molecules)
        .map(l => l.length)
        .reduce((a, b) => a + b, 0),
    ];
  }, [molecules]);
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
  const clearPleaseWait = useCallback(
    layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName),
    [],
  );
  return (
    <TitleInfo
      title="Spatial"
      info={
        `${cellsCount} cells, ${moleculesCount} molecules at ${shortNumber(locationsCount)} locations`
      }
      isSpatial
      removeGridComponent={removeGridComponent}
    >
      {children}
      <Spatial
        cells={cells}
        selectedCellIds={selectedCellIds}
        neighborhoods={neighborhoods}
        molecules={molecules}
        moleculesOpacity={moleculesOpacity}
        cellOpacity={cellOpacity}
        cellColors={cellColors}
        imageLayerProps={imageLayerProps}
        imageLayerLoaders={imageLayerLoaders}
        view={view}
        cellRadius={cellRadius}
        moleculeRadius={moleculeRadius}
        uuid={uuid}
        updateStatus={updateStatus}
        updateCellsSelection={updateCellsSelection}
        updateCellsHover={updateCellsHover}
        updateViewInfo={updateViewInfo}
        clearPleaseWait={clearPleaseWait}
      />
    </TitleInfo>
  );
}

SpatialSubscriber.defaultProps = {
  cellRadius: 50,
  moleculeRadius: 10,
};
