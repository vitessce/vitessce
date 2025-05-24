import React, {
  useMemo, useEffect, useRef, Suspense, useState,
} from 'react';
import register from 'higlass-register';
import { ZarrMultivecDataFetcher } from 'higlass-zarr-datafetchers';
import { useGridItemSize, useCoordination } from '@vitessce/vit-s';
import { COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { useStyles } from './styles.js';

// Register the zarr-multivec plugin data fetcher.
// References:
// https://github.com/higlass/higlass-register
// https://github.com/higlass/higlass-zarr-datafetchers
register(
  { dataFetcher: ZarrMultivecDataFetcher, config: ZarrMultivecDataFetcher.config },
  { pluginType: 'dataFetcher' },
);

// Lazy load the HiGlass React component,
// using a dynamic import.
const LazyHiGlassComponent = React.lazy(async () => {
  const { HiGlassComponent } = await import('higlass');
  return { default: HiGlassComponent };
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
export default function HiGlassLazy(props) {
  const {
    coordinationScopes,
    theme,
    hgViewConfig: hgViewConfigProp,
    hgOptions: hgOptionsProp,
    genomeSize,
    height,
  } = props;

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
  const [hgInstance, setHgInstance] = useState();
  const isActiveRef = useRef();

  const hgOptions = useMemo(() => ({
    ...hgOptionsProp,
    theme,
  }), [hgOptionsProp, theme]);

  const hgViewConfig = useMemo(() => {
    // HiGlass needs the start and end absolute genome coordinates
    const centerX = genomicTargetX;
    const genomesPerUnitX = genomeSize / (2 ** genomicZoomX);
    const unitX = width / HG_SIZE;
    const initialXDomain = [
      centerX - genomesPerUnitX * unitX / 2,
      centerX + genomesPerUnitX * unitX / 2,
    ];
    const centerY = genomicTargetY;
    const genomesPerUnitY = genomeSize / (2 ** genomicZoomY);
    const unitY = height / HG_SIZE;
    const initialYDomain = [
      centerY - genomesPerUnitY * unitY / 2,
      centerY + genomesPerUnitY * unitY / 2,
    ];
    return {
      editable: false,
      zoomFixed: false,
      trackSourceServers: [
        '//higlass.io/api/v1',
      ],
      exportViewUrl: '//higlass.io/api/v1/viewconfs',
      views: [
        {
          uid: 'main',
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
  }, [genomicTargetX, genomeSize, genomicZoomX, width, genomicTargetY,
    genomicZoomY, height, hgViewConfigProp]);

  useEffect(() => {
    const handleMouseEnter = () => {
      isActiveRef.current = true;
    };
    const handleMouseLeave = () => {
      isActiveRef.current = false;
    };
    const container = containerRef.current;
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseenter', handleMouseLeave);
    };
  }, [containerRef]);


  useEffect(() => {
    if (!hgInstance) {
      return () => {};
    }
    hgInstance.api.on('viewConfig', (viewConfigString) => {
      // Only set if the user mouse is over this component ("is active").
      // Otherwise, this could be an initial on viewConfig change callback from a sibling,
      // which will cause an infinite loop.
      if (!isActiveRef.current) {
        return;
      }
      const viewConfig = JSON.parse(viewConfigString);
      const xDomain = viewConfig.views[0].initialXDomain;
      const yDomain = viewConfig.views[0].initialYDomain;

      const nextGenomicZoomX = Math.log2(
        genomeSize / ((xDomain[1] - xDomain[0]) * (HG_SIZE / width)),
      );
      const nextGenomicZoomY = Math.log2(
        genomeSize / ((yDomain[1] - yDomain[0]) * (HG_SIZE / height)),
      );
      const nextGenomicTargetX = xDomain[0] + (xDomain[1] - xDomain[0]) / 2;
      const nextGenomicTargetY = yDomain[0] + (yDomain[1] - yDomain[0]) / 2;
      setGenomicZoomX(nextGenomicZoomX);
      setGenomicZoomY(nextGenomicZoomY);
      setGenomicTargetX(nextGenomicTargetX);
      setGenomicTargetY(nextGenomicTargetY);
    });
    return () => hgInstance.api.off('viewConfig');
  }, [hgInstance, genomeSize, width, height, setGenomicZoomX, setGenomicZoomY,
    setGenomicTargetX, setGenomicTargetY]);

  const { classes } = useStyles();

  return (
    <div className={classes.higlassWrapperParent}>
      <div className={classes.higlassWrapper} ref={containerRef} style={{ height: `${height}px` }}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyHiGlassComponent
            ref={setHgInstance}
            zoomFixed={false}
            viewConfig={hgViewConfig}
            options={hgOptions}
          />
        </Suspense>
      </div>
    </div>
  );
}

HiGlassLazy.defaultProps = {
  hgOptions: {
    bounded: true,
    pixelPreciseMarginPadding: true,
    containerPaddingX: 0,
    containerPaddingY: 0,
    sizeMode: 'default',
  },
  genomeSize: 3100000000,
};
