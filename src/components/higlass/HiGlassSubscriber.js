import React, {
  useMemo, useEffect, useCallback, Suspense, useState,
} from 'react';
import register from 'higlass-register';
import { ZarrMultivecDataFetcher } from 'higlass-zarr-datafetchers';
import PubSub from 'pubsub-js';
import { CELL_SETS_CHANGE } from '../../events';
import { treeToVisibleSetSizes } from '../sets/reducer';
import { colorArrayToString } from '../sets/utils';
import TitleInfo from '../TitleInfo';

// Register the zarr-multivec plugin data fetcher.
// References:
// - https://github.com/higlass/higlass-register
// - https://github.com/higlass/higlass-zarr-datafetchers
register(
  { dataFetcher: ZarrMultivecDataFetcher, config: ZarrMultivecDataFetcher.config },
  { pluginType: 'dataFetcher' },
);

// Reference: https://stackoverflow.com/a/55161634
const HiGlassComponent = React.lazy(() => import('./HiGlass').then(({ default: Component }) => ({
  default: React.forwardRef((props, ref) => (
    <Component ref={ref} {...props} />
  )),
})));

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
 * @prop {string} theme The current Vitessce theme name.
 */
export default function HiGlassSubscriber(props) {
  const {
    hgViewConfig,
    hgOptions = {
      bounded: true,
      pixelPreciseMarginPadding: true,
      containerPaddingX: 0,
      containerPaddingY: 0,
      sizeMode: 'default',
    },
    removeGridComponent,
    onReady,
    theme,
  } = props;

  const onReadyCallback = useCallback(onReady, []);

  const [hgApi, setHgApi] = useState();
  const [cellSets, setCellSets] = useState([]);

  // Listen for updates to the cell-sets tree.
  useEffect(() => {
    const cellSetsChangeToken = PubSub.subscribe(CELL_SETS_CHANGE,
      (msg, data) => {
        const setSizes = treeToVisibleSetSizes(data);
        setCellSets(setSizes);
      });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(cellSetsChangeToken);
    };
  }, [onReadyCallback]);

  // Upon updates to the cell-sets tree, check if any tracks have
  // matching names with the clusters, and if so,
  // apply the colors from the matching sets to the corresponding track's
  // barFillColor option.
  useEffect(() => {
    if (hgApi) {
      const vc = hgApi.getViewConfig();
      if (vc.views.length === 1 && vc.views[0].tracks.top) {
        vc.views[0].tracks.top.forEach((track) => {
          const matchingCellSet = cellSets.find(s => s.name === track.options.name);
          if (matchingCellSet) {
            // eslint-disable-next-line no-param-reassign
            track.options.barFillColor = colorArrayToString(matchingCellSet.color);
          }
        });
        hgApi.setViewConfig(vc);
      }
    } else {
      console.warn('HiGlass API was not available.');
    }
  }, [hgApi, cellSets]);

  // Reference: https://reactjs.org/docs/refs-and-the-dom.html#caveats-with-callback-refs
  const hgRefCallback = useCallback((hgRef) => {
    if (hgRef && hgRef.api) {
      setHgApi(hgRef.api);
    }
  }, [setHgApi]);

  // Memoize the higlass component since it only needs to be rendered once,
  // and then can be manipulated via the API functions.
  const hgComponent = useMemo(() => (
    <Suspense fallback={<div>Loading...</div>}>
      <HiGlassComponent
        ref={hgRefCallback}
        zoomFixed={false}
        viewConfig={hgViewConfig}
        options={{
          ...hgOptions,
          theme,
        }}
      />
    </Suspense>
  ), [hgRefCallback, hgViewConfig, hgOptions, theme]);

  return (
    <div className="higlass-title-wrapper">
      <TitleInfo
        title="HiGlass"
        removeGridComponent={removeGridComponent}
      >
        <div className="higlass-wrapper-parent">
          <div className="higlass-wrapper">
            {hgComponent}
          </div>
        </div>
      </TitleInfo>
    </div>
  );
}
