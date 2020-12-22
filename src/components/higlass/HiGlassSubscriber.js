import React from 'react';
import TitleInfo from '../TitleInfo';
import { useReady, useUrls, useGridItemSize } from '../hooks';
import HiGlassLazy from './HiGlassLazy';

const HIGLASS_DATA_TYPES = [];

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
    theme,
    hgViewConfig,
    removeGridComponent,
  } = props;

  // eslint-disable-next-line no-unused-vars
  const [width, height, containerRef] = useGridItemSize();

  // eslint-disable-next-line no-unused-vars
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    HIGLASS_DATA_TYPES,
  );
  // eslint-disable-next-line no-unused-vars
  const [urls, addUrl, resetUrls] = useUrls();

  return (
    <div className="higlass-title-wrapper">
      <TitleInfo
        title="HiGlass"
        removeGridComponent={removeGridComponent}
        theme={theme}
        isReady={isReady}
        urls={urls}
      >
        <div className="higlass-lazy-wrapper" ref={containerRef}>
          <HiGlassLazy
            coordinationScopes={coordinationScopes}
            theme={theme}
            hgViewConfig={hgViewConfig}
            height={height}
          />
        </div>
      </TitleInfo>
    </div>
  );
}
