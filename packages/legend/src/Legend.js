import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { scaleSequential } from 'd3-scale';
import {
  interpolate,
  quantize,
  interpolateRgb,
  piecewise,
} from 'd3-interpolate';
import { rgb } from 'd3-color';
import colormaps from 'colormap/colorScale';
import { capitalize } from '@vitessce/utils';

export const useStyles = makeStyles(() => ({
  legend: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    zIndex: '100',
    fontSize: '12px !important',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(215, 215, 215, 0.2)',
    borderRadius: '4px',
    padding: '4px',
    '& svg': {
      height: '15px',
      width: '100px',
    },
  },
  continuousTitle: {
    fontWeight: 'bold',
  },
  continuousLabels: {
    position: 'relative',
    display: 'inline-block',
    width: '100px',
    height: '15px',
    fontSize: '10px !important',
  },
  continuousStart: {
    position: 'absolute',
    bottom: '0',
    left: '0',
  },
  continuousEnd: {
    position: 'absolute',
    bottom: '0',
    right: '0',
  },
}));


// Reference: https://observablehq.com/@mjmdavis/color-encoding
const getInterpolateFunction = (cmap) => {
  const colormapData = colormaps[cmap].map(d => d.rgb);
  const colormapRgb = colormapData.map(x => rgb(...x));
  // Perform piecewise interpolation between each color in the range.
  return piecewise(interpolateRgb, colormapRgb);
};

// Reference: https://observablehq.com/@d3/color-legend
function ramp(color, n = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = n;
  canvas.height = 1;
  const context = canvas.getContext('2d');
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}

export default function Legend(props) {
  const {
    visible: visibleProp,
    featureType,
    featureValueType,
    obsColorEncoding,
    featureSelection,
    featureValueColormap,
    featureValueColormapRange,
  } = props;

  const classes = useStyles();

  const svg = useMemo(() => {
    const interpolateFunc = getInterpolateFunction(featureValueColormap);
    const color = scaleSequential([0, 100], interpolateFunc);
    let n = 256;
    if (color.domain && color.range) {
      n = Math.min(color.domain().length, color.range().length);
    }
    const xlinkHref = ramp(color.copy().domain(quantize(interpolate(0, 1), n))).toDataURL();
    return (
      <svg width="100" height="15">
        <image x="0" y="0" width="100" height="15" preserveAspectRatio="none" xlinkHref={xlinkHref} />
      </svg>
    );
  }, [featureValueColormap]);

  const visible = (visibleProp && obsColorEncoding === 'geneSelection'
    && featureSelection && Array.isArray(featureSelection) && featureSelection.length === 1
  );

  const geneExpressionLegend = useMemo(() => {
    if (visible) {
      return (
        <>
          <span className={classes.continuousTitle}>
            {capitalize(featureType)} {capitalize(featureValueType)}
          </span>
          {svg}
          <span className={classes.continuousLabels}>
            <span className={classes.continuousStart}>{featureValueColormapRange[0]}</span>
            <span className={classes.continuousEnd}>{featureValueColormapRange[1]}</span>
          </span>
        </>
      );
    }
    return null;
  }, [svg, featureValueColormapRange, visible,
    featureType, featureValueType, classes,
  ]);

  return (visible ? (
    <div className={classes.legend}>
      {geneExpressionLegend}
    </div>
  ) : null);
}
