import React, { useState, useCallback, useEffect } from 'react';
import PubSub from 'pubsub-js';
import shortNumber from 'short-number';
import { createZarrLoader } from '@hubmap/vitessce-image-viewer';


import TitleInfo from '../TitleInfo';
import {
  MOLECULES_ADD,
  NEIGHBORHOODS_ADD,
  CELLS_ADD,
  CELLS_COLOR,
  STATUS_INFO,
  CELLS_SELECTION,
  CELLS_HOVER,
  CLEAR_PLEASE_WAIT,
  VIEW_INFO,
  CELL_SETS_VIEW,
  LAYER_ADD,
  CHANNEL_VISIBILITIES_CHANGE,
  CHANNEL_COLORS_CHANGE,
  CHANNEL_SLIDERS_CHANGE,
  CHANNEL_SELECTIONS_CHANGE,
  CHANNEL_SET,
} from '../../events';
import Spatial from './Spatial';

async function initLoader(imageData) {
  const { type, url, metadata } = imageData;
  const { dimensions, is_pyramid: isPyramid, transform } = metadata;

  switch (type) {
    // TODO: Add tiff loader
    case ('zarr'): {
      const loader = await createZarrLoader({
        url, dimensions, isPyramid, ...transform,
      });
      return loader;
    }
    default: {
      throw Error(`Image type (${type}) is not supported`);
    }
  }
}

const defualtLayer = {
  colormap: '',
  opacity: 1,
  sliders: [],
  colors: [],
  selections: [],
  visibilities: [],
};

export default function SpatialSubscriber({
  children,
  onReady,
  removeGridComponent,
  moleculeRadius,
  view,
  cellRadius,
  uuid = null,
}) {
  const [cells, setCells] = useState({});
  const [molecules, setMolecules] = useState({});
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [cellColors, setCellColors] = useState([]);
  const [imageLayers, setImageLayers] = useState({});

  const memoizedOnReady = useCallback(onReady, []);

  useEffect(() => {
    function handleLayerAdd(msg, { sourceId, imageData }) {
      initLoader(imageData)
        .then(loader => setImageLayers(prevImageLayers => ({
          ...prevImageLayers,
          [sourceId]: {
            loader,
            ...defualtLayer,
          },
        })));
    }
    const moleculesAddToken = PubSub.subscribe(MOLECULES_ADD, setMolecules);
    const neighborhoodsAddToken = PubSub.subscribe(NEIGHBORHOODS_ADD, setNeighborhoods);
    const cellsAddToken = PubSub.subscribe(CELLS_ADD, setCells);
    const cellsSelectionToken = PubSub.subscribe(CELLS_SELECTION, setSelectedCellIds);
    const cellSetsViewToken = PubSub.subscribe(CELL_SETS_VIEW, setSelectedCellIds);
    const cellsColorToken = PubSub.subscribe(CELLS_COLOR, setCellColors);
    const layerAddToken = PubSub.subscribe(LAYER_ADD, handleLayerAdd);
    memoizedOnReady();
    return () => {
      PubSub.unsubscribe(moleculesAddToken);
      PubSub.unsubscribe(neighborhoodsAddToken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsSelectionToken);
      PubSub.unsubscribe(cellSetsViewToken);
      PubSub.unsubscribe(cellsColorToken);
      PubSub.unsubscribe(layerAddToken);
    };
  }, [memoizedOnReady]);

  useEffect(() => {
    const handleChange = (id, property, values) => {
      const { loader } = imageLayers[id];
      setImageLayers(prevImageLayers => ({
        ...prevImageLayers,
        [id]: {
          ...prevImageLayers[id],
          [property]: property === 'selections' ? loader.serializeSelection(values) : values,
        },
      }));
    };
    const handleChannelSet = (id, payload) => {
      const { loader } = imageLayers[id];
      const { selections, ...rest } = payload;
      setImageLayers(prevImageLayers => ({
        ...prevImageLayers,
        [id]: {
          ...rest,
          loader,
          selections: loader.serializeSelection(selections),
        },
      }));
    };
    const tokens = Object.keys(imageLayers).map(id => [
      PubSub.subscribe(CHANNEL_VISIBILITIES_CHANGE(id), (msg, v) => handleChange(id, 'visibilities', v)),
      PubSub.subscribe(CHANNEL_COLORS_CHANGE(id), (msg, c) => handleChange(id, 'colors', c)),
      PubSub.subscribe(CHANNEL_SLIDERS_CHANGE(id), (msg, s) => handleChange(id, 'sliders', s)),
      PubSub.subscribe(CHANNEL_SELECTIONS_CHANGE(id), (msg, s) => handleChange(id, 'selections', s)),
      PubSub.subscribe(CHANNEL_SET(id), (msg, payload) => handleChannelSet(id, payload)),
    ]);
    return () => tokens.flat().forEach(token => PubSub.unsubscribe(token));
  }, [imageLayers]);

  const cellsCount = cells ? Object.keys(cells).length : 0;
  const moleculesCount = molecules ? Object.keys(molecules).length : 0;
  const locationsCount = molecules ? Object.values(molecules)
    .map(l => l.length)
    .reduce((a, b) => a + b, 0) : 0;

  return (
    <TitleInfo
      title="Spatial"
      info={`${cellsCount} cells, ${moleculesCount} molecules
              at ${shortNumber(locationsCount)} locations`}
      removeGridComponent={removeGridComponent}
    >
      {children}
      <Spatial
        cells={cells}
        selectedCellIds={selectedCellIds}
        neighborhoods={neighborhoods}
        cellColors={cellColors}
        imageLayers={imageLayers}
        view={view}
        moleculeRadius={moleculeRadius}
        cellRadius={cellRadius}
        uuid={uuid}
        updateStatus={
            message => PubSub.publish(STATUS_INFO, message)
          }
        updateCellsSelection={
            selectedIds => PubSub.publish(CELLS_SELECTION, selectedIds)
          }
        updateCellsHover={
            hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)
          }
        updateViewInfo={
            viewInfo => PubSub.publish(VIEW_INFO, viewInfo)
          }
        clearPleaseWait={
            layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
          }
      />
    </TitleInfo>
  );
}

SpatialSubscriber.defaultProps = {
  cellRadius: 50,
  moleculeRadius: 10,
};
