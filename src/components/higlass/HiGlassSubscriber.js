import React, { useMemo } from 'react';
import loadable from '@loadable/component';
import TitleInfo from '../TitleInfo';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'higlass/dist/hglib.css';

const HiGlassComponent = loadable(() => import('higlass').then(d => new Promise(resolve => resolve(d.HiGlassComponent))));

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

  const hgComponent = useMemo(() => (
    <HiGlassComponent
      zoomFixed={false}
      viewConfig={hgViewConfig}
      options={{
        ...hgOptions,
        theme: 'dark',
        onViewConfLoaded: onReady,
      }}
    />
  ), [hgViewConfig, hgOptions, onReady]);

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
