/* eslint-disable */
import React, { useRef, useState, useCallback, useMemo, useEffect, useReducer } from 'react';
import uuidv4 from 'uuid/v4';
import DeckGL from 'deck.gl';
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import HeatmapBitmapLayer, { TILE_SIZE, MAX_ROW_AGG, MIN_ROW_AGG } from './HeatmapBitmapLayer';
import PixelatedBitmapLayer from './PixelatedBitmapLayer';
import { TextLayer } from '@deck.gl/layers';
import range from 'lodash/range';
import clamp from 'lodash/clamp';
import isEqual from 'lodash/isEqual';
import { DEFAULT_GL_OPTIONS } from '../utils';

import HeatmapWorker from './heatmap.worker.js';

const themeToTextColor = {
  "dark": [224, 224, 224],
  "light": [64, 64, 64],
};

function layerFilter({ layer, viewport }) {
  if(viewport.id === 'axisLeft') {
    return layer.id.startsWith('axisLeft');
  } else if(viewport.id === 'axisTop') {
    return layer.id.startsWith('axisTop');
  } else if(viewport.id === 'heatmap') {
    return layer.id.startsWith('heatmap');
  } else if(viewport.id === 'colorsLeft') {
    return layer.id.startsWith('colorsLeft');
  } else if(viewport.id === 'colorsTop') {
    return layer.id.startsWith('colorsTop');
  }
  return false;
}

/**
 * A heatmap component for cell x gene matrices.
 * @param {*} props 
 */
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
    transpose = false,
  } = props;

  useEffect(() => {
    if (clearPleaseWait && clusters) {
      clearPleaseWait('genes');
    }
  }, [clearPleaseWait, clusters]);

  const [viewState, setViewState] = useState(initialViewState);

  const workerRef = useRef(new HeatmapWorker());
  const tilesRef = useRef();
  const dataRef = useRef();
  const [cellOrdering, setCellOrdering] = useState();

  const [tileIteration, incTileIteration] = useReducer(i => i+1, 0);
  const [backlog, setBacklog] = useState([]);

  useEffect(() => {
    workerRef.current.addEventListener('message', (event) => {
      // The tiles have been generated.
      tilesRef.current = event.data.tiles;
      // The buffer has been transferred back to the main thread.
      dataRef.current = new Uint8Array(event.data.buffer);
      incTileIteration();

      const curr = event.data.curr;
      setBacklog(prev => {
        const currIndex = prev.indexOf(curr);
        return prev.slice(currIndex+1, prev.length);
      })
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

  useEffect(() => {
    if(!clusters) {
      return;
    }
    // TODO: need to use Map rather than Object.keys since ordering may not be stable/correct when IDs are numbers.
    const newCellOrdering = (!cellColors ? clusters.rows : Object.keys(cellColors));
    if(!isEqual(cellOrdering, newCellOrdering)) {
      setCellOrdering(newCellOrdering);
    }
  }, [clusters, cellColors, cellOrdering]);

  const width = clusters && clusters.cols ? clusters.cols.length : 0;
  const height = cellOrdering ? cellOrdering.length : 0;

  const axisOffsetLeft = 80;
  const axisOffsetTop = 80;

  const colorOffsetLeft = 20;

  const offsetTop = axisOffsetTop;
  const offsetLeft = axisOffsetLeft + colorOffsetLeft;

  const matrixWidth = viewWidth - offsetLeft;
  const matrixHeight = viewHeight - offsetTop;

  const matrixLeft = -matrixWidth/2;
  const matrixRight = matrixWidth/2;
  const matrixTop = -matrixHeight/2;
  const matrixBottom = matrixHeight/2;

  const xTiles = Math.ceil(width / TILE_SIZE);
  const yTiles = Math.ceil(height / TILE_SIZE);

  const widthRatio = (xTiles*TILE_SIZE - (TILE_SIZE - (width % TILE_SIZE))) / (xTiles*TILE_SIZE);
  const heightRatio = (yTiles*TILE_SIZE - (TILE_SIZE - (height % TILE_SIZE))) / (yTiles*TILE_SIZE);

  const tileWidth = (matrixWidth / widthRatio) / (xTiles);
  const tileHeight = (matrixHeight / heightRatio) / (yTiles);

  const scaleFactor = Math.pow(2, viewState.zoom);
  const cellHeight = (matrixHeight * scaleFactor) / height;
  const cellWidth = (matrixWidth * scaleFactor) / width;

  // Get power of 2 between 1 and 16, for number of cells to aggregate together in each direction.
  const aggSizeX = clamp(Math.pow(2, Math.ceil(Math.log2(1/cellWidth))), MIN_ROW_AGG, MAX_ROW_AGG);
  const aggSizeY = clamp(Math.pow(2, Math.ceil(Math.log2(1/cellHeight))), MIN_ROW_AGG, MAX_ROW_AGG);

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
    setBacklog(prev => ([...prev, uuidv4()]));
  }, [dataRef, clusters, cellOrdering]);

  // When the backlog has updated, a new worker job can be submitted if:
  // - the backlog has length >= 1 (at least one job is waiting), and
  // - buffer.byteLength is not zero, so the worker does not currently "own" the buffer.
  useEffect(() => {
    if(backlog.length < 1) {
      return;
    }
    const curr = backlog[backlog.length - 1];
    if(dataRef.current && dataRef.current.buffer.byteLength) {
      workerRef.current.postMessage(['getTiles', {
        curr,
        xTiles,
        yTiles,
        tileSize: TILE_SIZE,
        cellOrdering,
        rows: clusters.rows,
        cols: clusters.cols,
        data: dataRef.current.buffer,
      }], [dataRef.current.buffer]);
    }
  }, [backlog]);

  // Update the heatmap tiles if:
  // - new tiles are available (`tileIteration` has changed), or
  // - the matrix bounds have changed, or
  // - the `aggSizeX` or `aggSizeY` have changed, or
  // - the cell ordering has changed.
  const heatmapLayers = useMemo(() => {
    if(!tilesRef.current || backlog.length) {
      return [];
    }
    
    function getLayer(i, j, tile) {
      return new HeatmapBitmapLayer({
        id: `heatmapLayer-${tileIteration}-${i}-${j}`,
        image: tile,
        bounds: [matrixLeft + j*tileWidth, matrixTop + i*tileHeight, matrixLeft + (j+1)*tileWidth, matrixTop + (i+1)*tileHeight],
        aggSizeX: aggSizeX,
        aggSizeY: aggSizeY,
        updateTriggers: {
          image: [cellOrdering],
          bounds: [tileHeight, tileWidth],
          aggSizeX: aggSizeX,
          aggSizeY: aggSizeY,
        }
      });
    }
    return tilesRef.current.flatMap((tileRow, i) => tileRow.map((tile, j) => getLayer(i, j, tile)));
  }, [tilesRef, tileIteration, tileWidth, tileHeight, aggSizeX, aggSizeY, cellOrdering, xTiles, yTiles, backlog]);


  // Map cell and gene names to arrays with indices,
  // to prepare to render the names in TextLayers.
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

  // Set up the constants for the axis layers.
  const labelSize = 8;
  const titleSize = 14;

  const showAxisLeftLabels = cellHeight >= labelSize;
  const showAxisTopLabels = cellWidth >= labelSize;

  const axisMargin = 3;
  const axisLabelLeft = viewState.target[0] + (axisOffsetLeft - axisMargin)/2/scaleFactor;
  const axisLabelTop = viewState.target[1] + (axisOffsetTop - axisMargin)/2/scaleFactor;

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
      getColor: themeToTextColor[theme],
      getSize: (showAxisLeftLabels ? labelSize : 0),
      getAngle: 0,
      updateTriggers: {
        getPosition: [axisLabelLeft, matrixTop, matrixHeight, viewHeight],
        getSize: [showAxisLeftLabels],
        getColor: [theme],
      }
    }),
    new TextLayer({
      id: 'axisTopLabels',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: colsData,
      getText: d => d[1],
      getPosition: d => [matrixLeft + ((d[0] + 0.5) / width) * matrixWidth, axisLabelTop],
      getTextAnchor: 'start',
      getColor: themeToTextColor[theme],
      getSize: (showAxisTopLabels ? labelSize : 0),
      getAngle: 75,
      updateTriggers: {
        getPosition: [axisLabelTop, matrixLeft, matrixWidth, viewWidth],
        getSize: [showAxisTopLabels],
        getColor: [theme],
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
      getColor: themeToTextColor[theme],
      getSize: (!showAxisLeftLabels ? titleSize : 0),
      getAngle: 90,
      updateTriggers: {
        getPosition: [axisTitleLeft, axisTitleTop],
        getSize: [showAxisLeftLabels],
        getColor: [theme],
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
      getColor: themeToTextColor[theme],
      getSize: (!showAxisTopLabels ? titleSize : 0),
      getAngle: 0,
      updateTriggers: {
        getPosition: [axisTitleLeft, axisTitleTop],
        getSize: [showAxisTopLabels],
        getColor: [theme],
      }
    }),
  ] : []);

  // Create a TextLayer for the "Loading..." indicator.
  const loadingLayers = (backlog.length ? [
    new TextLayer({
      id: 'heatmapLoading',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [{
        title: "Loading..."
      }],
      getText: d => d.title,
      getPosition: d => [viewState.target[0], viewState.target[1]],
      getTextAnchor: 'middle',
      getColor: themeToTextColor[theme],
      getSize: 13,
      getAngle: 0,
      updateTriggers: {
        getColor: [theme],
      }
    }),
  ] : []);

  // Create the cell color bar.
  const cellColorsTiles = useMemo(() => {
    if(!cellOrdering || !cellColors) {
      return null;
    }

    let cellId;
    let offset;
    let color;
    let rowI;

    const result = range(yTiles).map(i => {
      const tileData = new Uint8ClampedArray(TILE_SIZE * 1 * 4);

      range(TILE_SIZE).forEach(tileY => {
        rowI = (i * TILE_SIZE) + tileY; // the row / cell index
        if(rowI < height) {
          cellId = cellOrdering[rowI];
          color = cellColors[cellId];
          offset = (TILE_SIZE - tileY - 1) * 4;
          if(color) {
            tileData[offset + 0] = color[0];
            tileData[offset + 1] = color[1];
            tileData[offset + 2] = color[2];
            tileData[offset + 3] = 255;
          }
        }
      });

      // TODO: flip the width/height if on top rather than on left
      return new ImageData(tileData, 1, TILE_SIZE);
    });

    return result;
  }, [cellColors, cellOrdering]);

  const cellColorsLayers = useMemo(() => {
    return cellColorsTiles ? cellColorsTiles.map((tile, i) => {
      return new PixelatedBitmapLayer({
        id: `colorsLeftLayer-${i}-${uuidv4()}`,
        image: tile,
        bounds: [-matrixWidth/2, matrixTop + i*tileHeight, matrixWidth/2, matrixTop + (i+1)*tileHeight],
      });
    }) : [];
  }, [cellColorsTiles, matrixTop, tileHeight]);

  const layers = heatmapLayers.concat(axisLayers).concat(loadingLayers).concat(cellColorsLayers);

  // Set up the onHover function.
  function onHover(info, event) {
    if(!clusters || !cellOrdering) {
      return;
    }
    const mouseX = event.offsetCenter.x - offsetLeft;
    const mouseY = event.offsetCenter.y - offsetTop;

    if(mouseX >= 0 && mouseY >= 0) {
      // TODO: determine the rowI and colI values based on the current viewState.target and viewState.zoom levels.
      /*
      const sortedRowI = Math.floor(mouseY / matrixHeight * height);
      const rowI = clusters.rows.indexOf(cellOrdering[sortedRowI]);
      const colI = Math.floor(mouseX / matrixWidth * width);
      const rowId = clusters.rows[rowI];
      const colId = clusters.cols[colI];
      console.log(rowId, colId);
      */
    }
  }

  return (
    <DeckGL
      views={[
        new OrthographicView({ id: 'heatmap', controller: true, x: offsetLeft, y: offsetTop, width: matrixWidth, height: matrixHeight }),
        new OrthographicView({ id: 'axisLeft', controller: false, x: 0, y: offsetTop, width: axisOffsetLeft, height: matrixHeight }),
        new OrthographicView({ id: 'axisTop', controller: false, x: offsetLeft, y: 0, width: matrixWidth, height: offsetTop }),
        new OrthographicView({ id: 'colorsLeft', controller: false, x: axisOffsetLeft, y: offsetTop, width: colorOffsetLeft - 3, height: matrixHeight }),
      ]}
      layers={layers}
      layerFilter={layerFilter}
      getCursor={interactionState => (interactionState.isDragging ? 'grabbing' : 'default')}
      glOptions={DEFAULT_GL_OPTIONS}
      onViewStateChange={onViewStateChange}
      viewState={viewState}
      onHover={onHover}
    />
  );
}
