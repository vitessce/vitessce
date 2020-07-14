/* eslint-disable */
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import DeckGL from 'deck.gl';
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import HeatmapBitmapLayer from './HeatmapBitmapLayer';
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
    return layer.id.startsWith('heatmap');
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
            tileData[offset + 3] = 255;

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
      return new HeatmapBitmapLayer({
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
        getPosition: [axisLabelLeft, matrixTop, matrixHeight]
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
        getPosition: [axisLabelTop, matrixLeft, matrixWidth]
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
        getPosition: [axisTitleLeft, axisTitleTop]
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
        getPosition: [axisTitleLeft, axisTitleTop]
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
