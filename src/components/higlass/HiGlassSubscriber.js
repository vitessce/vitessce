import React, { useMemo, useEffect, useCallback } from 'react';
import loadable from '@loadable/component';
import TitleInfo from '../TitleInfo';

 const HiGlassComponent = loadable(() => import('higlass').then(d => Promise.resolve(d.HiGlassComponent)));

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
  } = props;

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    onReadyCallback();
  }, [onReadyCallback]);

  const hgComponent = useMemo(() => (
    <HiGlassComponent
      zoomFixed={false}
      viewConfig={hgViewConfig}
      options={{
        ...hgOptions,
        theme: 'dark',
      }}
    />
  ), [hgViewConfig, hgOptions]);

  return (
    <div className="v-higlass-title-wrapper">
      <TitleInfo
        title="HiGlass"
        removeGridComponent={removeGridComponent}
      >
        <div className="v-higlass-wrapper-parent">
          <div className="v-higlass-wrapper">
            {hgComponent}
          </div>
        </div>
      </TitleInfo>
    </div>
  );
}
