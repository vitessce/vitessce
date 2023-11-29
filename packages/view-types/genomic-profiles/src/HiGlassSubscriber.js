import React from 'react';
import { TitleInfo, useGridItemSize } from '@vitessce/vit-s';
import HiGlassLazy from './HiGlassLazy.js';
import { useStyles } from './styles.js';

const urls = [];

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
export function HiGlassSubscriber(props) {
  const {
    coordinationScopes,
    theme,
    hgViewConfig,
    closeButtonVisible,
    removeGridComponent,
  } = props;

  // eslint-disable-next-line no-unused-vars
  const [width, height, containerRef] = useGridItemSize();
  const classes = useStyles();

  return (
    <div className={classes.higlassTitleWrapper}>
      <TitleInfo
        title="HiGlass"
        closeButtonVisible={closeButtonVisible}
        removeGridComponent={removeGridComponent}
        theme={theme}
        isReady
        urls={urls}
      >
        <div className={classes.higlassLazyWrapper} ref={containerRef}>
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
