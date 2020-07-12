/* eslint-disable */
import React, { useRef, useState, useCallback, useMemo } from 'react';
import DeckGL, { OrthographicView } from 'deck.gl';
import BitmapHeatmapLayer from './BitmapHeatmapLayer';
import range from 'lodash/range';
import {
  DEFAULT_GL_OPTIONS,
} from '../utils';

const tileSize = 4096;

export default function Heatmap(props) {
  const {
    uuid,
    view = {
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
      console.warn(`Heatmap updateViewInfo: ${message}`);
    },
  } = props;
  if (clearPleaseWait && clusters) {
    clearPleaseWait('clusters');
  }

  const viewRef = useRef({
    viewport: null,
    width: null,
    height: null,
    uuid,
  });

  const onInitializeViewInfo = useCallback(({ width, height, viewport }) => {
    viewRef.current.viewport = viewport;
    viewRef.current.width = width;
    viewRef.current.height = height;

    updateViewInfo(viewRef.current);
    
  }, [viewRef, updateViewInfo]);

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

            tileData[offset + 0] = 0;
            tileData[offset + 1] = 0;
            tileData[offset + 2] = 0;
            tileData[offset + 3] = value;

            // Draw a blue left and top edge.
            if(tileX === 0 || tileY === 0) {
              tileData[offset + 0] = 0;
              tileData[offset + 1] = 0;
              tileData[offset + 2] = 255;
              tileData[offset + 3] = 255;
            }
          });
        });

        return new ImageData(tileData, tileSize, tileSize);
      });
    });

    return result;
  }, [clusters]);

  const layers = useMemo(() => {
    if(!tiles) {
      return [];
    }
    
    function getLayer(i, j) {
      return new BitmapHeatmapLayer({
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


  const deckProps = {
    views: [new OrthographicView({ id: 'ortho' })], // id is a fix for https://github.com/uber/deck.gl/issues/3259
    // gl needs to be initialized for us to use it in Texture creation
    layers: layers,
    initialViewState: view,
    controller: true,
    getCursor: interactionState => (interactionState.isDragging ? 'grabbing' : 'default'),
  };

  return (
    <>
      <DeckGL
        glOptions={DEFAULT_GL_OPTIONS}
        {...deckProps}
      >
        {onInitializeViewInfo}
      </DeckGL>
    </>
  );
}
