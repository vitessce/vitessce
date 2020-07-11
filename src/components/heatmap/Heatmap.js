/* eslint-disable */
import React, { useRef, useState, useCallback, useMemo } from 'react';
import DeckGL, { OrthographicView } from 'deck.gl';
import BitmapHeatmapLayer from './BitmapHeatmapLayer';
import {
  DEFAULT_GL_OPTIONS,
} from '../utils';

export default function Heatmap(props) {
  const {
    uuid,
    view = {
      zoom: 9,
      target: [0.5, 0.5, 0]
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

    const width = 4096 || clusters.cols.length;
    const height = 4096 || clusters.rows.length;

    

    const imageData = new Uint8ClampedArray(width * height * 4);

    clusters.matrix.data.forEach((row, y) => {
      row.forEach((value, x) => {
        if(x < width && y < height) {
          const offset = (y * width + x) * 4;
          imageData[offset + 0] = value;
          imageData[offset + 1] = 0;
          imageData[offset + 2] = 0;
          imageData[offset + 3] = 255;
        }
      });
    });



    const image = new ImageData(imageData, width, height);

    return [
      new BitmapHeatmapLayer({
        id: 'heatmap',

        image: image,
        
        /*bounds: [
          [0, height], // left, bottom
          [0, 0], // left, top
          [width, 0], // right, top
          [width, height], // right, bottom
        ],*/
        

        /*
        bounds: {type: 'array', value: [1, 0, 0, 1], compare: true},
      
        desaturate: {type: 'number', min: 0, max: 1, value: 0},
        // More context: because of the blending mode we're using for ground imagery,
        // alpha is not effective when blending the bitmap layers with the base map.
        // Instead we need to manually dim/blend rgb values with a background color.
        transparentColor: {type: 'color', value: [0, 0, 0, 0]},
        tintColor: {type: 'color', value: [255, 255, 255]}
        */
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
