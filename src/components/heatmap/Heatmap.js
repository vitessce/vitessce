/* eslint-disable */
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import DeckGL from 'deck.gl';
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import BitmapHeatmapLayer from './BitmapHeatmapLayer';
import { LineLayer, TextLayer } from '@deck.gl/layers';
import range from 'lodash/range';
import clamp from 'lodash/clamp';
import {
  DEFAULT_GL_OPTIONS,
} from '../utils';

const tileSize = 4096;

function layerFilter({ layer, viewport }) {
  if(viewport.id === 'axisLeft') {
    return layer.id.startsWith('axisLeft');
  } else if(viewport.id === 'axisTop') {
    return layer.id.startsWith('axisTop');
  } else if(viewport.id === 'heatmap') {
    return layer.id.startsWith('heatmapLayer');
  }
  return false;
}

export default function Heatmap(props) {
  const {
    uuid,
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

  const width = clusters && clusters.cols ? clusters.cols.length : 0;
  const height = clusters && clusters.rows ? clusters.rows.length : 0;

  const offsetTop = 60;
  const offsetLeft = 60;


  const matrixLeft = -viewWidth/2 + offsetLeft;
  const matrixRight = viewWidth/2;
  const matrixTop = -viewHeight/2 + offsetTop;
  const matrixBottom = viewHeight/2;

  const matrixWidth = matrixRight - matrixLeft;
  const matrixHeight = matrixBottom - matrixTop;

  const xTiles = Math.ceil(width / tileSize);
  const yTiles = Math.ceil(height / tileSize);

  const widthRatio = (xTiles*tileSize - (tileSize - (width % tileSize))) / (xTiles*tileSize);
  const heightRatio = (yTiles*tileSize - (tileSize - (height % tileSize))) / (yTiles*tileSize);

  const tileWidth = (matrixWidth / widthRatio) / (xTiles);
  const tileHeight = (matrixHeight / heightRatio) / (yTiles);

  const onViewStateChange = useCallback(({ viewState }) => {
    // Always called for "axisLeft", since that layer is on top.

    const { target, zoom } = viewState;


    const scaleFactor = Math.pow(2, zoom);

    const minTargetX = zoom === 0 ? 0 : -(matrixRight - (matrixRight / scaleFactor));
    const maxTargetX = -1 * minTargetX;

    const minTargetY = zoom === 0 ? 0 : -(matrixBottom - (matrixBottom / scaleFactor));
    const maxTargetY = -1 * minTargetY;

    const minAxisTargetX = zoom === 0 ? 0 : - (matrixRight / scaleFactor);
    const minAxisTargetY = zoom === 0 ? 0 : - (matrixBottom / scaleFactor);
    //console.log(viewState);

    // Manipulate view state
    viewState.target[0] = clamp(viewState.target[0], minTargetX, maxTargetX);
    viewState.target[1] = clamp(viewState.target[1], minTargetY, maxTargetY);

    setViewState(viewState);
    
  }, [matrixRight, matrixBottom]);

  const tiles = useMemo(() => {
    if(!clusters) {
      return null;
    }

    let value;
    let alpha;
    let offset;

    const result = range(yTiles).map(i => {
      return range(xTiles).map(j => {
        const tileData = new Uint8ClampedArray(tileSize * tileSize * 4);

        range(tileSize).forEach(tileY => {
          const rowI = (i * tileSize) + tileY;

          range(tileSize).forEach(tileX => {
            const colI = (j * tileSize) + tileX;

            if(rowI < height && colI < width) {
              value = clusters.matrix.data[rowI][colI];
              alpha = 255;
            } else {
              value = 0;
              alpha = 0;
            }
            offset = ((tileSize - tileY - 1) * tileSize + tileX) * 4;

            tileData[offset + 0] = value;
            tileData[offset + 1] = 0;
            tileData[offset + 2] = 0;
            tileData[offset + 3] = value;

            // Draw a blue left and top edge.
            /*if(tileX === 0 || tileY === 0) {
              tileData[offset + 0] = 0;
              tileData[offset + 1] = 0;
              tileData[offset + 2] = 255;
              tileData[offset + 3] = 255;
            }*/
          });
        });

        return new ImageData(tileData, tileSize, tileSize);
      });
    });

    return result;
  }, [clusters]);

  const heatmapLayers = useMemo(() => {
    if(!tiles) {
      return [];
    }
    
    function getLayer(i, j) {
      return new BitmapHeatmapLayer({
        id: `heatmapLayer-${i}-${j}`,
        image: tiles[i][j],
        bounds: [matrixLeft + j*tileWidth, matrixTop + i*tileHeight, matrixLeft + (j+1)*tileWidth, matrixTop + (i+1)*tileHeight],
      });
    }

    return [
      getLayer(0, 0),
      getLayer(0, 1),
      getLayer(0, 2),
      getLayer(1, 0),
      getLayer(1, 1),
      getLayer(1, 2),
    ];
  }, [tiles, viewHeight, viewWidth]);

  const colsData = useMemo(() => {
    if(!clusters) {
      return [];
    }
    return clusters.cols.map((d, i) => [i, d]);
  }, [clusters]);

  const rowsData = useMemo(() => {
    if(!clusters) {
      return [];
    }
    return clusters.rows.map((d, i) => [i, d]);
  }, [clusters]);

  
  if(viewState.width) {
    const viewport = new OrthographicView().makeViewport({
      // From the current `detail` viewState, we need its projection matrix (actually the inverse).
      viewState,
      height: viewState.height,
      width: viewState.width
    });
    // Use the inverse of the projection matrix to map screen to the view space.
    const unprojectedCoords = [
      viewport.unproject([offsetLeft, offsetTop]),
      viewport.unproject([viewport.width, viewport.height]),
    ];
    const unprojectedBbox = {
      x: unprojectedCoords[0][0],
      y: unprojectedCoords[0][1],
      width: unprojectedCoords[1][0] - unprojectedCoords[0][0],
      height: unprojectedCoords[1][1] - unprojectedCoords[0][1]
    };
    
    
    

    
    //console.log(textHeight, viewport.height);
  }

  const cellHeight = (matrixHeight * Math.pow(2, viewState.zoom)) / height;
  const cellWidth = (matrixWidth * Math.pow(2, viewState.zoom)) / width;

  const axisLayers = (clusters && clusters.rows && clusters.cols ? 
    [
      new TextLayer({
        id: 'axisLeftText',
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: rowsData,
        getText: d => d[1],
        getPosition: d => [matrixLeft, matrixTop + ((d[0] + 0.5) / height) * matrixHeight],
        getTextAnchor: 'end',
        getColor: [128, 128, 128, 255],
        getSize: 9, //(cellHeight > 12 ? cellHeight : 0),
        getAngle: 0,
      }),
      new TextLayer({
        id: 'axisTopText',
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: colsData,
        getText: d => d[1],
        getPosition: d => [matrixLeft + ((d[0] + 0.5) / width) * matrixWidth, matrixTop],
        getTextAnchor: 'start',
        getColor: [128, 128, 128, 255],
        getSize: 9, //(cellWidth > 12 ? cellWidth : 0),
        getAngle: 75,
      }),
    ]
  : []);

  const layers = heatmapLayers.concat(axisLayers);


  return (
    <DeckGL
      views={[
        // top z-index
        new OrthographicView({ id: 'axisLeft' }),
        new OrthographicView({ id: 'axisTop' }),
        new OrthographicView({ id: 'heatmap' }),
        // bottom z-index
      ]}
      layers={layers}
      layerFilter={layerFilter}
      controller={true}
      getCursor={interactionState => (interactionState.isDragging ? 'grabbing' : 'default')}
      glOptions={DEFAULT_GL_OPTIONS}
      onViewStateChange={onViewStateChange}
      viewState={viewState}
    />
  );
}
