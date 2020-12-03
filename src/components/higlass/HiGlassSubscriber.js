/* eslint-disable */
import React, {
  useMemo, useEffect, useRef, Suspense,
} from 'react';
import ReactDOM from 'react-dom';
import dynamicImportPolyfill from 'dynamic-import-polyfill';
import register from 'higlass-register';
import { ZarrMultivecDataFetcher } from 'higlass-zarr-datafetchers';
import TitleInfo from '../TitleInfo';
import { createWarningComponent, asEsModule } from '../utils';
import { useReady, useUrls } from '../hooks';
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
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    genomicZoom,
    genomicTargetX,
    genomicTargetY,
  }, {
    setGenomicZoom,
    setGenomicTargetX,
    setGenomicTargetY,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.higlass, coordinationScopes);

  const hgRef = useRef();

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

  const hgViewConfig = useMemo(() => {
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
          initialXDomain: [
            genomicTargetX - genomicZoom,
            genomicTargetX + genomicZoom,
          ],
          initialYDomain: [
            genomicTargetY - genomicZoom,
            genomicTargetY + genomicZoom,
          ],
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
  }, [hgViewConfigProp, genomicZoom, genomicTargetX, genomicTargetY]);

  useEffect(() => {
    if(hgRef.current) {
      hgRef.current.api.on('location', (loc) => {
        setGenomicZoom(Math.log2(loc.xDomain[1] - loc.xDomain[0]));
        setGenomicTargetX((loc.xDomain[1] - loc.xDomain[0]) / 2);
        setGenomicTargetY((loc.yDomain[1] - loc.yDomain[0]) / 2);
      });
      return () => hgRef.current.api.off('location');
    } else {
      return () => {};
    }
  }, [hgRef, ]);

  const hgComponent = useMemo(() => (
    <HiGlassComponent
      ref={hgRef}
      zoomFixed={false}
      viewConfig={hgViewConfig}
      options={hgOptions}
    />
  ), [hgViewConfig, hgOptions]);

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
          <div className="higlass-wrapper">
            <Suspense fallback={<div>Loading...</div>}>
              {hgComponent}
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
};
