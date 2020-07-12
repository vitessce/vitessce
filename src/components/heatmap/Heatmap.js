/* eslint-disable */
import React, { useRef, useState, useCallback, useMemo } from 'react';
import DeckGL, { OrthographicView, TileLayer } from 'deck.gl';
import BitmapHeatmapLayer from './BitmapHeatmapLayer';
import range from 'lodash/range';
import {
  DEFAULT_GL_OPTIONS,
} from '../utils';

export default function Heatmap(props) {
  const {
    uuid,
    view = {
      zoom: 0,
      target: [128, 128, 0]
    },
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

  const deckRef = useRef();
  const viewRef = useRef({
    viewport: null,
    width: null,
    height: null,
    uuid,
  });
  const [gl, setGl] = useState(null);

  const onInitializeViewInfo = useCallback(({ width, height, viewport }) => {
    viewRef.current.viewport = viewport;
    viewRef.current.width = width;
    viewRef.current.height = height;
    updateViewInfo(viewRef.current);

  }, [viewRef, updateViewInfo]);

  const layers = useMemo(() => {
    if(!clusters) {
      return [];
    }

    const width = clusters.cols.length;
    const height = clusters.rows.length;

    const tileSize = 4096;

    const xTiles = Math.ceil(width / tileSize);
    const yTiles = Math.ceil(height / tileSize);

    let value;
    let offset;

    const tiles = range(yTiles).map(i => {
      return range(xTiles).map(j => {
        const tileData = new Uint8ClampedArray(tileSize * tileSize * 4);

        range(tileSize).forEach(tileY => {
          const rowI = (i * tileSize) + tileY;

          range(tileSize).forEach(tileX => {
            const colI = (j * tileSize) + tileX;

            if(rowI < height && colI < width) {
              value = clusters.matrix.data[rowI][colI];
            } else {
              value = 0;
            }
            offset = ((tileSize - tileY - 1) * tileSize + tileX) * 4;

            tileData[offset + 0] = value;
            tileData[offset + 1] = 0;
            tileData[offset + 2] = 0;
            tileData[offset + 3] = 255;

            // Draw a white left and top edge.
            if(tileX === 0 || tileY === 0) {
              tileData[offset + 0] = 255;
              tileData[offset + 1] = 255;
              tileData[offset + 2] = 255;
            }
          });
        });

        return new ImageData(tileData, tileSize, tileSize);
      });
    });
    
    console.log(tiles);

    //const image = new ImageData(imageData, width, height);

    return [
      new TileLayer({

        maxZoom: 2,
        tileSize: tileSize,
        extent: [0, 0, xTiles, yTiles],

        getTileData: ({ x, y, z, bbox }) => {
          const {left, top, right, bottom} = bbox;

          console.log(x, y, z, bbox);

          if(x >= 0 && x < xTiles && y >= 0 && y < yTiles) {
            return tiles[y][x];
          }
          
          return new ImageData(tileSize, tileSize);
        },

        renderSubLayers: props => {
          const { tile, data } = props;
          const { left, top, right, bottom } = tile.bbox;

    
          return new BitmapHeatmapLayer(props, {
            image: data,
            bounds: [left, top, right, bottom],
          });
        }


      }),
    ];
  }, [clusters]);


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
        ref={deckRef}
        onWebGLInitialized={setGl}
        glOptions={DEFAULT_GL_OPTIONS}
        {...deckProps}
      >
        {onInitializeViewInfo}
      </DeckGL>
    </>
  );
}
