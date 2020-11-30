import React, {
  useMemo, useEffect, Suspense,
} from 'react';
import ReactDOM from 'react-dom';
import dynamicImportPolyfill from 'dynamic-import-polyfill';
import register from 'higlass-register';
import { ZarrMultivecDataFetcher } from 'higlass-zarr-datafetchers';
import TitleInfo from '../TitleInfo';
import { useReady, useUrls } from '../hooks';
import { useCellSetsData } from '../data-hooks';
import {
  useCoordination, useLoaders,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

// Initialize the dynamic __import__() function before
// doing any importing.
dynamicImportPolyfill.initialize();

// Register the zarr-multivec plugin data fetcher.
// References:
// - https://github.com/higlass/higlass-register
// - https://github.com/higlass/higlass-zarr-datafetchers
register(
  { dataFetcher: ZarrMultivecDataFetcher, config: ZarrMultivecDataFetcher.config },
  { pluginType: 'dataFetcher' },
);

const HiGlassComponent = React.lazy(() => {
  window.React = React;
  window.ReactDOM = ReactDOM;
  return new Promise((resolve) => {
    // eslint-disable-next-line no-undef
    __import__('http://localhost:9000/pixi.js').then(() => {
      // eslint-disable-next-line no-undef
      __import__('http://unpkg.com/higlass@1.11.4/dist/hglib.js').then(() => {
        resolve({
          __esModule: true,
          default: window.hglib.HiGlassComponent,
        });
      });
    });
  });
});

const HIGLASS_DATA_TYPES = ['cell-sets'];

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
    hgViewConfig,
    hgOptions = {
      bounded: true,
      pixelPreciseMarginPadding: true,
      containerPaddingX: 0,
      containerPaddingY: 0,
      sizeMode: 'default',
    },
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.higlass, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    HIGLASS_DATA_TYPES,
  );
  const [urls, addUrl, resetUrls] = useUrls();

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // eslint-disable-next-line no-unused-vars
  const [cellSets] = useCellSetsData(loaders, dataset, setItemIsReady, addUrl, false);

  const hgComponent = useMemo(() => (
    <HiGlassComponent
      zoomFixed={false}
      viewConfig={hgViewConfig}
      options={{
        ...hgOptions,
        theme,
      }}
    />
  ), [hgViewConfig, hgOptions, theme]);

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
