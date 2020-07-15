/* eslint-disable */
import React, { useRef, useState, useCallback, useMemo, useEffect, useReducer } from 'react';
import uuidv4 from 'uuid/v4';
import DeckGL from 'deck.gl';
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import HeatmapBitmapLayer from './HeatmapBitmapLayer';
import { LineLayer, TextLayer } from '@deck.gl/layers';
import range from 'lodash/range';
import clamp from 'lodash/clamp';
import isEqual from 'lodash/isEqual';
import {
  DEFAULT_GL_OPTIONS,
} from '../utils';

import HeatmapWorker from 'worker-loader!./vitessce.worker';

const tileSize = 4096;
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
      console.log("cell ordering changed");
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
    setBacklog(prev => ([...prev, uuidv4()]));
  }, [dataRef, clusters, cellOrdering]);

  useEffect(() => {
    console.log("backlog", backlog);
    if(backlog.length < 1) {
      return;
    }
    const curr = backlog[backlog.length - 1];
    if(dataRef.current && dataRef.current.buffer.byteLength) {
      workerRef.current.postMessage(['getTiles', {
        curr,
        xTiles,
        yTiles,
        tileSize,
        cellOrdering,
        rows: clusters.rows,
        cols: clusters.cols,
        data: dataRef.current.buffer,
      }], [dataRef.current.buffer]);
    }
  }, [backlog]);

  const heatmapLayers = useMemo(() => {
    if(!tilesRef.current || backlog.length) {
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
  }, [tilesRef, tileIteration, tileWidth, tileHeight, cellOrdering, xTiles, yTiles, backlog]);

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

  // Cell color bar
  const cellColorsTiles = useMemo(() => {
    if(!cellOrdering || !cellColors) {
      return null;
    }

    let cellId;
    let offset;
    let color;
    let rowI;

    const result = range(yTiles).map(i => {
      const tileData = new Uint8ClampedArray(tileSize * 1 * 4);

      range(tileSize).forEach(tileY => {
        rowI = (i * tileSize) + tileY; // the row / cell index
        if(rowI < height) {
          cellId = cellOrdering[rowI];
          color = cellColors[cellId];
          offset = (tileSize - tileY - 1) * 4;
          if(color) {
            tileData[offset + 0] = color[0];
            tileData[offset + 1] = color[1];
            tileData[offset + 2] = color[2];
            tileData[offset + 3] = 255;
          }
        }
      });

      // TODO: flip the width/height if on top rather than on left
      return new ImageData(tileData, 1, tileSize);
    });

    return result;
  }, [cellColors, cellOrdering]);

  const cellColorsLayers = useMemo(() => {
    return cellColorsTiles ? cellColorsTiles.map((tile, i) => {
      return new HeatmapBitmapLayer({
        id: `colorsLeftLayer-${i}-${uuidv4()}`,
        image: tile,
        bounds: [-matrixWidth/2, matrixTop + i*tileHeight, matrixWidth/2, matrixTop + (i+1)*tileHeight],
      });
    }) : [];
  }, [cellColorsTiles, matrixTop, tileHeight]);


  const layers = heatmapLayers.concat(axisLayers).concat(loadingLayers).concat(cellColorsLayers);

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
    />
  );
}
