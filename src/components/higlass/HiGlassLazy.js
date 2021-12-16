/* eslint-disable */
import React, { useRef, Suspense } from 'react';
import ReactDOM from 'react-dom';
import dynamicImportPolyfill from 'dynamic-import-polyfill';
import packageJson from '../../../package.json';
import { createWarningComponent, asEsModule } from '../utils';
import { useGridItemSize } from '../hooks';
import { useCoordination } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

import mySpec from './spec.json';

const PIXI_BUNDLE_VERSION = packageJson.dependencies['window-pixi'];
const HIGLASS_BUNDLE_VERSION = packageJson.dependencies['higlass'];
const GOSLING_BUNDLE_VERSION = '0.9.14';
const BUNDLE_FILE_EXT = process.env.NODE_ENV === 'development' ? 'js' : 'min.js';
const PIXI_BUNDLE_URL = `https://unpkg.com/window-pixi@${PIXI_BUNDLE_VERSION}/dist/pixi.${BUNDLE_FILE_EXT}`;
const HIGLASS_BUNDLE_URL = `https://unpkg.com/higlass@${HIGLASS_BUNDLE_VERSION}/dist/hglib.${BUNDLE_FILE_EXT}`;
const GOSLING_BUNDLE_URL = `https://unpkg.com/gosling.js@${GOSLING_BUNDLE_VERSION}/dist/gosling.${BUNDLE_FILE_EXT}`;

// Initialize the dynamic __import__() function.
if (dynamicImportPolyfill) {
  dynamicImportPolyfill.initialize();
}

// Lazy load the HiGlass React component,
// using dynamic imports with absolute URLs.
const LazyGoslingComponent = React.lazy(() => {
  if (!window.React) {
    window.React = React;
  }
  if (!window.ReactDOM) {
    window.ReactDOM = ReactDOM;
  }
  return new Promise((resolve) => {
    const handleImportError = (e) => {
      console.warn(e);
      resolve(asEsModule(createWarningComponent({
        title: 'Could not load Gosling',
        message: 'The Gosling scripts could not be dynamically imported.',
      })));
    };
    // eslint-disable-next-line no-undef
    __import__(PIXI_BUNDLE_URL).then(() => {
      // eslint-disable-next-line no-undef
      __import__(HIGLASS_BUNDLE_URL).then(() => {
        // eslint-disable-next-line no-undef
        __import__(GOSLING_BUNDLE_URL).then(() => {
          // React.lazy promise must return an ES module with the
          // component as the default export.
          resolve(asEsModule(window.gosling.GoslingComponent));
        }).catch(handleImportError);
      }).catch(handleImportError);
    }).catch(handleImportError);
  });
});

// Use an arbitrary size for normalization of the zoom level.
// (800 means 800 px width for the full genome)
const HG_SIZE = 800;

/**
   * A wrapper around HiGlass (http://higlass.io/).
   * The HiGlassComponent react component is loaded lazily.
   * @prop {object} hgViewConfig A HiGlass viewconfig object to pass
   * to the HiGlassComponent viewConfig prop.
   * @prop {object} hgOptions An optional HiGlass object to pass
   * to the HiGlassComponent hgOptions prop.
   * @prop {function} removeGridComponent A grid component removal handler
   * to pass to the TitleInfo component.
   * @prop {function} onReady A callback function to signal that the component is ready.
   */
export default function GoslingLazy(props) {
  const {
    coordinationScopes,
    theme,
    hgViewConfig: hgViewConfigProp,
    hgOptions: hgOptionsProp,
    genomeSize,
    height,
  } = props;

  const gosRef = useRef();

  // Get "props" from the coordination space.
  const [{
    genomicZoomX,
    genomicZoomY,
    genomicTargetX,
    genomicTargetY,
  }, {
    setGenomicZoomX,
    setGenomicZoomY,
    setGenomicTargetX,
    setGenomicTargetY,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.higlass, coordinationScopes);

  // eslint-disable-next-line no-unused-vars
  const [width, computedHeight, containerRef] = useGridItemSize();

  return (
    <div className="higlass-wrapper-parent">
      <div className="higlass-wrapper" ref={containerRef} style={{ height: `${height}px` }}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyGoslingComponent
            ref={gosRef}
            spec={mySpec}
            experimental={{ reactive: true }}
          />
        </Suspense>
      </div>
    </div>
  );
}

GoslingLazy.defaultProps = {
  hgOptions: {
    bounded: true,
    pixelPreciseMarginPadding: true,
    containerPaddingX: 0,
    containerPaddingY: 0,
    sizeMode: 'default',
  },
  genomeSize: 3100000000,
};
