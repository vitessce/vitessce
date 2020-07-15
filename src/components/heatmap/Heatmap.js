/* eslint-disable */
import React, { useRef, useState, useCallback, useMemo, useEffect, useReducer } from 'react';
import DeckGL from 'deck.gl';
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import HeatmapBitmapLayer from './HeatmapBitmapLayer';
import { LineLayer, TextLayer } from '@deck.gl/layers';
import range from 'lodash/range';
import clamp from 'lodash/clamp';
import {
  DEFAULT_GL_OPTIONS,
} from '../utils';

import HeatmapWorker from 'worker-loader!./vitessce.worker';

const tileSize = 4096;

function layerFilter({ layer, viewport }) {
  if(viewport.id === 'axisLeft') {
    return layer.id.startsWith('axisLeft');
  } else if(viewport.id === 'axisTop') {
    return layer.id.startsWith('axisTop');
  } else if(viewport.id === 'heatmap') {
    return layer.id.startsWith('heatmap');
  }
  return false;
}

export default function Heatmap(props) {
  const {
    uuid,
    theme,
    initialViewState = {
      minZoom: 0,
      zoom: 0,
      target: [0, 0, 0]
    },
    width: viewWidth,
    height: viewHeight,
    cells,
    clusters,
    selectedCellIds,
    cellColors,
    clearPleaseWait,
    updateCellsHover = (hoverInfo) => {
      console.warn(`Heatmap updateCellsHover: ${hoverInfo.cellId}`);
    },
    updateStatus = (message) => {
      console.warn(`Heatmap updateStatus: ${message}`);
    },
    updateViewInfo = (message) => {
      //console.warn(`Heatmap updateViewInfo: ${message}`);
    },
  } = props;
  if (clearPleaseWait && clusters) {
    clearPleaseWait('clusters');
  }

  const [viewState, setViewState] = useState(initialViewState);

  const workerRef = useRef(new HeatmapWorker());
  const tilesRef = useRef();
  const dataRef = useRef();

  const [tileIteration, incTileIteration] = useReducer(i => i+1, 0);
  useEffect(() => {
    workerRef.current.addEventListener('message', (event) => {
      // The tiles have been generated.
      tilesRef.current = event.data.tiles;
      // The buffer has been transferred back to the main thread.
      dataRef.current = new Uint8Array(event.data.buffer);
      incTileIteration();
    });
  }, [workerRef, tilesRef]);

  useEffect(() => {
    // Store the clusters Uint8Array in the dataRef.
    if(clusters && clusters.matrix) {
      dataRef.current = clusters.matrix.data;
    } 
  }, [dataRef, clusters]);

  useEffect(() => {
    if(viewState) {
      updateViewInfo({
        uuid,
        width: viewState.width,
        height: viewState.height,
        viewport: viewState.viewport,
      });
    }
    
  }, [uuid, viewState, updateViewInfo]);

  const cellOrdering = useMemo(() => {
    if(!clusters) {
      return null;
    }
    console.log("cell ordering changed");
    if(!cellColors) {
      return clusters.rows;
    }

    return Object.keys(cellColors);

  }, [clusters, cellColors]);

  const width = clusters && clusters.cols ? clusters.cols.length : 0;
  const height = cellOrdering ? cellOrdering.length : 0;

  const offsetTop = 80;
  const offsetLeft = 80;

  const matrixWidth = viewWidth - offsetLeft;
  const matrixHeight = viewHeight - offsetTop;

  const matrixLeft = -matrixWidth/2;
  const matrixRight = matrixWidth/2;
  const matrixTop = -matrixHeight/2;
  const matrixBottom = matrixHeight/2;

  const xTiles = Math.ceil(width / tileSize);
  const yTiles = Math.ceil(height / tileSize);

  const widthRatio = (xTiles*tileSize - (tileSize - (width % tileSize))) / (xTiles*tileSize);
  const heightRatio = (yTiles*tileSize - (tileSize - (height % tileSize))) / (yTiles*tileSize);

  const tileWidth = (matrixWidth / widthRatio) / (xTiles);
  const tileHeight = (matrixHeight / heightRatio) / (yTiles);

  const onViewStateChange = useCallback(({ viewState }) => {
    const { target, zoom } = viewState;
    const scaleFactor = Math.pow(2, zoom);

    const minTargetX = zoom === 0 ? 0 : -(matrixRight - (matrixRight / scaleFactor));
    const maxTargetX = -1 * minTargetX;

    const minTargetY = zoom === 0 ? 0 : -(matrixBottom - (matrixBottom / scaleFactor));
    const maxTargetY = -1 * minTargetY;

    // Manipulate view state
    viewState.target[0] = clamp(viewState.target[0], minTargetX, maxTargetX);
    viewState.target[1] = clamp(viewState.target[1], minTargetY, maxTargetY);

    setViewState(viewState);
  }, [matrixRight, matrixBottom]);

  useEffect(() => {
    if(!clusters || !cellOrdering) {
      return;
    }
    console.log("making tiles");
    if(dataRef.current && dataRef.current.buffer.byteLength) {
      workerRef.current.postMessage(['getTiles', {
        xTiles,
        yTiles,
        tileSize,
        cellOrdering,
        rows: clusters.rows,
        cols: clusters.cols,
        data: dataRef.current.buffer,
      }], [dataRef.current.buffer]);
    }

  }, [dataRef, clusters, cellOrdering]);

  const heatmapLayers = useMemo(() => {
    if(!tilesRef.current) {
      return [];
    }
    
    function getLayer(i, j, tile) {
      return new HeatmapBitmapLayer({
        id: `heatmapLayer-${tileIteration}-${i}-${j}`,
        image: tile,
        bounds: [matrixLeft + j*tileWidth, matrixTop + i*tileHeight, matrixLeft + (j+1)*tileWidth, matrixTop + (i+1)*tileHeight],
        updateTriggers: {
          image: [cellOrdering],
          bounds: [tileHeight, tileWidth],
        }
      });
    }

    return tilesRef.current.flatMap((tileRow, i) => tileRow.map((tile, j) => getLayer(i, j, tile)));
  }, [tilesRef, tileIteration, tileWidth, tileHeight, cellOrdering, xTiles, yTiles]);

  const colsData = useMemo(() => {
    if(!clusters) {
      return [];
    }
    return clusters.cols.map((d, i) => [i, d]);
  }, [clusters]);

  const rowsData = useMemo(() => {
    if(!cellOrdering) {
      return [];
    }
    return cellOrdering.map((d, i) => [i, d]);
  }, [cellOrdering]);

  const scaleFactor = Math.pow(2, viewState.zoom);
  const cellHeight = (matrixHeight * scaleFactor) / height;
  const cellWidth = (matrixWidth * scaleFactor) / width;
  const labelSize = 8;
  const titleSize = 14;

  const showAxisLeftLabels = cellHeight >= labelSize;
  const showAxisTopLabels = cellWidth >= labelSize;

  const axisMargin = 3;
  const axisLabelLeft = viewState.target[0] + (offsetLeft - axisMargin)/2/scaleFactor;
  const axisLabelTop = viewState.target[1] + (offsetTop - axisMargin)/2/scaleFactor;

  const axisTitleLeft = viewState.target[0];
  const axisTitleTop = viewState.target[1];
  
  const axisLayers = (clusters && clusters.rows && clusters.cols ? [
    new TextLayer({
      id: 'axisLeftLabels',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: rowsData,
      getText: d => d[1],
      getPosition: d => [axisLabelLeft, matrixTop + ((d[0] + 0.5) / height) * matrixHeight],
      getTextAnchor: 'end',
      getColor: [128, 128, 128, 255],
      getSize: (showAxisLeftLabels ? labelSize : 0),
      getAngle: 0,
      updateTriggers: {
        getPosition: [axisLabelLeft, matrixTop, matrixHeight, viewHeight],
        getSize: [showAxisLeftLabels]
      }
    }),
    new TextLayer({
      id: 'axisTopLabels',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: colsData,
      getText: d => d[1],
      getPosition: d => [matrixLeft + ((d[0] + 0.5) / width) * matrixWidth, axisLabelTop],
      getTextAnchor: 'start',
      getColor: [128, 128, 128, 255],
      getSize: (showAxisTopLabels ? labelSize : 0),
      getAngle: 75,
      updateTriggers: {
        getPosition: [axisLabelTop, matrixLeft, matrixWidth, viewWidth],
        getSize: [showAxisTopLabels]
      }
    }),
    new TextLayer({
      id: 'axisLeftTitle',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [{
        title: "Cells"
      }],
      getText: d => d.title,
      getPosition: d => [axisTitleLeft, axisTitleTop],
      getTextAnchor: 'middle',
      getColor: [128, 128, 128, 255],
      getSize: (!showAxisLeftLabels ? titleSize : 0),
      getAngle: 90,
      updateTriggers: {
        getPosition: [axisTitleLeft, axisTitleTop],
        getSize: [showAxisLeftLabels]
      }
    }),
    new TextLayer({
      id: 'axisTopTitle',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [{
        title: "Genes"
      }],
      getText: d => d.title,
      getPosition: d => [axisTitleLeft, axisTitleTop],
      getTextAnchor: 'middle',
      getColor: [128, 128, 128, 255],
      getSize: (!showAxisTopLabels ? titleSize : 0),
      getAngle: 0,
      updateTriggers: {
        getPosition: [axisTitleLeft, axisTitleTop],
        getSize: [showAxisTopLabels]
      }
    }),
  ] : []);

  const layers = heatmapLayers.concat(axisLayers);

  return (
    <DeckGL
      views={[
        new OrthographicView({ id: 'heatmap', controller: true, x: offsetLeft, y: offsetTop, width: matrixWidth, height: matrixHeight }),
        new OrthographicView({ id: 'axisLeft', controller: false, x: 0, y: offsetTop, width: offsetLeft, height: matrixHeight }),
        new OrthographicView({ id: 'axisTop', controller: false, x: offsetLeft, y: 0, width: matrixWidth, height: offsetTop }),
      ]}
      layers={layers}
      layerFilter={layerFilter}
      getCursor={interactionState => (interactionState.isDragging ? 'grabbing' : 'default')}
      glOptions={DEFAULT_GL_OPTIONS}
      onViewStateChange={onViewStateChange}
      viewState={viewState}
    />
  );
}
