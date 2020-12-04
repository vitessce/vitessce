/* eslint-disable */
import React, {
  useMemo, useEffect, useRef, useReducer, Suspense, useState, useCallback,
} from 'react';
import ReactDOM from 'react-dom';
import dynamicImportPolyfill from 'dynamic-import-polyfill';
import register from 'higlass-register';
import { ZarrMultivecDataFetcher } from 'higlass-zarr-datafetchers';
import TitleInfo from '../TitleInfo';
import { createWarningComponent, asEsModule } from '../utils';
import { useReady, useUrls, useGridItemSize } from '../hooks';
import {
  useCoordination, useLoaders,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

const PIXI_BUNDLE_URL = 'https://unpkg.com/window-pixi@5.3.3/dist/pixi.min.js';
const HIGLASS_BUNDLE_URL = 'https://unpkg.com/higlass@1.11.4/dist/hglib.min.js';

const HIGLASS_DATA_TYPES = [];

// Initialize the dynamic __import__() function
// if necessary.
dynamicImportPolyfill.initialize();

// Register the zarr-multivec plugin data fetcher.
// References:
// https://github.com/higlass/higlass-register
// https://github.com/higlass/higlass-zarr-datafetchers
register(
  { dataFetcher: ZarrMultivecDataFetcher, config: ZarrMultivecDataFetcher.config },
  { pluginType: 'dataFetcher' },
);

// Lazy load the HiGlass React component,
// using dynamic imports with absolute URLs.
const HiGlassComponent = React.lazy(() => {
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
        title: 'Could not load HiGlass',
        message: 'The HiGlass scripts could not be dynamically imported.',
      })));
    };
    // eslint-disable-next-line no-undef
    __import__(PIXI_BUNDLE_URL).then(() => {
      // eslint-disable-next-line no-undef
      __import__(HIGLASS_BUNDLE_URL).then(() => {
        // React.lazy promise must return an ES module with the
        // component as the default export.
        resolve(asEsModule(window.hglib.HiGlassComponent));
      }).catch(handleImportError);
    }).catch(handleImportError);
  });
});

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
export default function HiGlassSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    hgViewConfig: hgViewConfigProp,
    hgOptions: hgOptionsProp,
    genomeSize,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
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

  const [width, height, containerRef] = useGridItemSize();
  const isActive = useRef();
  const [hgInstance, setHgInstance] = useState();

  // eslint-disable-next-line no-unused-vars
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    HIGLASS_DATA_TYPES,
  );
  // eslint-disable-next-line no-unused-vars
  const [urls, addUrl, resetUrls] = useUrls();

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  const hgOptions = useMemo(() => ({
    ...hgOptionsProp,
    theme,
  }), [hgOptionsProp, theme]);

  const adjWidth = width - 10;
  const adjHeight = 600 - 10;

  const hgViewConfig = useMemo(() => {
    const initialXDomain = [
      genomicTargetX - ((genomeSize/Math.pow(2, genomicZoomX)))*((adjWidth/2)/HG_SIZE),
      genomicTargetX + ((genomeSize/Math.pow(2, genomicZoomX)))*((adjWidth/2)/HG_SIZE),
    ];
    const initialYDomain = [
      genomicTargetY - ((genomeSize/Math.pow(2, genomicZoomY)))*((adjHeight/2)/HG_SIZE),
      genomicTargetY + ((genomeSize/Math.pow(2, genomicZoomY)))*((adjHeight/2)/HG_SIZE),
    ];
    console.log("width", adjWidth, "height", adjHeight);
    console.log("received", initialXDomain, initialYDomain);
    return {
      editable: false,
      zoomFixed: false,
      trackSourceServers: [
        '//higlass.io/api/v1',
      ],
      exportViewUrl: '//higlass.io/api/v1/viewconfs',
      views: [
        {
          ...hgViewConfigProp,
          initialXDomain,
          initialYDomain,
        },
      ],
      zoomLocks: {
        locksByViewUid: {},
        locksDict: {},
      },
      locationLocks: {
        locksByViewUid: {},
        locksDict: {},
      },
      valueScaleLocks: {
        locksByViewUid: {},
        locksDict: {},
      },
    };
  }, [hgViewConfigProp, genomicZoomX, genomicZoomY, genomicTargetX, genomicTargetY, width, height]);

  useEffect(() => {
    const handleMouseEnter = () => {
      isActive.current = true;
    };
    const handleMouseLeave = () => {
      isActive.current = false;
    };
    containerRef.current.addEventListener("mouseenter", handleMouseEnter);
    containerRef.current.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      containerRef.current.removeEventListener("mouseenter", handleMouseEnter);
      containerRef.current.removeEventListener("mouseenter", handleMouseLeave);
    };
  }, [containerRef]);
  

  useEffect(() => {
    if(!hgInstance) {
      return;
    }
    hgInstance.api.on('viewConfig', (viewConfigString) => {
      const viewConfig = JSON.parse(viewConfigString);
      const xDomain = viewConfig.views[0].initialXDomain;
      const yDomain = viewConfig.views[0].initialYDomain;

      const nextGenomicZoomX = Math.log2(genomeSize / ((xDomain[1] - xDomain[0])*(HG_SIZE/adjWidth)));
      const nextGenomicZoomY = Math.log2(genomeSize / ((yDomain[1] - yDomain[0])*(HG_SIZE/adjHeight)));
      const nextGenomicTargetX = (xDomain[0] + (xDomain[1] - xDomain[0]) / 2);
      const nextGenomicTargetY = (yDomain[0] + (yDomain[1] - yDomain[0]) / 2);
      console.log("nextGenomicZoomX", nextGenomicZoomX);
      console.log("nextGenomicZoomY", nextGenomicZoomY);
      console.log("nextGenomicTargetX", nextGenomicTargetX);
      console.log("nextGenomicTargetY", nextGenomicTargetY);
      // TODO: only set if the user mouse is over this component.
      // otherwise this is just the initial on viewConfig change callback from a sibling, which will cause an infinite loop.
      if(isActive.current) {
        setGenomicZoomX(nextGenomicZoomX);
        setGenomicZoomY(nextGenomicZoomY);
        setGenomicTargetX(nextGenomicTargetX);
        setGenomicTargetY(nextGenomicTargetY);
      }
    });
    return () => {
      hgInstance.api.off('viewConfig');
    };
  }, [hgInstance, genomeSize, isActive, adjWidth, adjHeight]);

  return (
    <div className="higlass-title-wrapper">
      <TitleInfo
        title="HiGlass"
        removeGridComponent={removeGridComponent}
        theme={theme}
        isReady={isReady}
        urls={urls}
      >
        <div className="higlass-wrapper-parent">
          <div className="higlass-wrapper" ref={containerRef}>
            <Suspense fallback={<div>Loading...</div>}>
              <HiGlassComponent
                ref={setHgInstance}
                zoomFixed={false}
                viewConfig={hgViewConfig}
                options={hgOptions}
              />
            </Suspense>
          </div>
        </div>
      </TitleInfo>
    </div>
  );
}

HiGlassSubscriber.defaultProps = {
  hgOptions: {
    bounded: true,
    pixelPreciseMarginPadding: true,
    containerPaddingX: 0,
    containerPaddingY: 0,
    sizeMode: 'default',
  },
  genomeSize: 3100000000,
};
