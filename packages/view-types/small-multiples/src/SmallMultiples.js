import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
// import { pMap } from 'p-map';
import { viv, deck, DEFAULT_GL_OPTIONS } from '@vitessce/gl';
import { ImageWrapper } from '@vitessce/image-utils';






export function SmallMultiples(props) {
    const {
        deckRef,
        uuid,
        width,
        height,
        viewState,
        setViewState,

        thumbnails,
        thumbnailSize,
    } = props;

    const getBounds = useCallback((i, shapeWidth, shapeHeight) => {
      const numCols = Math.floor(width / thumbnailSize);


      const row = Math.floor(i / numCols);
      const col = i % numCols;

      const x = col * thumbnailSize;
      const y = row * thumbnailSize;

      const top = -1;
      const left = -1;

      const isPortrait = shapeHeight > shapeWidth;

      const aspectRatio = shapeWidth / shapeHeight;
      const boundsWidth = isPortrait ? thumbnailSize * aspectRatio : thumbnailSize;
      const boundsHeight = isPortrait ? thumbnailSize : thumbnailSize / aspectRatio;


      const bounds = [
        left + x,
        top + y,
        left + x + boundsWidth,
        top + y + boundsHeight,
      ];
      return bounds;

    }, [thumbnails, thumbnailSize, width, height]);


    function scaleBounds(x, y, tileWidth, tileHeight) {
      return [
        x/thumbnails.length * width,
        y/thumbnails.length * height,
        (x/thumbnails.length * width) + tileWidth,
        (y/thumbnails.length * height) + tileHeight,
      ];
    }

    const layers = useMemo(() => {
      if(!thumbnails) {
        return []
      }
      return thumbnails.map((thumbnail, i) => {
        return new viv.XRLayer({
          channelData: thumbnail.data,
          channelsVisible: [true, true, true],
          contrastLimits: [[0, 255], [0, 255], [0, 255]],
          bounds: getBounds(i, thumbnail.data.width, thumbnail.data.height),
          id: `${uuid}-GridLayer-${i}`,
          dtype: thumbnail.dtype || "Uint8", // fallback if missing,
          pickable: false,
          extensions: [new viv.ColorPaletteExtension()],
          selections: [
            { c: 0, t: 0, z: 0 },
            { c: 1, t: 0, z: 0 },
            { c: 2, t: 0, z: 0 }
          ],
        });
      })
    }, [thumbnails, getBounds]);

    const onViewStateChange = useCallback(({ viewState }) => {
      setViewState(viewState);
    }, [setViewState]);

    // TODO: use DeckGL + viv.XRLayer to render each thumbnail
    // Reference: https://github.com/hms-dbmi/vizarr/blob/456ee8d412f7138f6d6c07bab354def5e6827d5b/src/gridLayer.ts#L142C5-L155C8

  return (
    <>
      <deck.DeckGL
        id={`deckgl-overlay-${uuid}`}
        ref={deckRef}
        views={[
          new deck.OrthographicView({
            id: 'ortho',
          })
        ]} // id is a fix for https://github.com/uber/deck.gl/issues/3259
        layers={layers}
        glOptions={DEFAULT_GL_OPTIONS}
        //onWebGLInitialized={this.onWebGLInitialized}
        onViewStateChange={onViewStateChange}
        viewState={viewState}
        useDevicePixels={true}
        controller={true}
        //getCursor={tool ? getCursorWithTool : getCursor}
        //onHover={this.onHover}
      />
    </>
  );
}