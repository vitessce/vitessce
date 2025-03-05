import React, { useCallback, useMemo } from 'react';
import { clamp } from 'lodash-es';
import { VegaPlot, VEGA_THEMES } from '@vitessce/vega';
import { colorArrayToString } from '@vitessce/sets-utils';
import { capitalize, getDefaultColor } from '@vitessce/utils';

/**
 * Cell set sizes displayed as a bar chart,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {object[]} props.data The set size data, an array
 * of objects with properties `name`, `key`, `color`, and `size`.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {number} props.width The container width.
 * @param {number} props.height The container height.
 * @param {number} props.marginRight The size of the margin
 * on the right side of the plot, to account for the vega menu button.
 * By default, 90.
 * @param {number} props.marginBottom The size of the margin
 * on the bottom of the plot, to account for long x-axis labels.
 * By default, 120.
 * @param {number} props.keyLength The length of the `key` property of
 * each data point. Assumes all key strings have the same length.
 * By default, 36.
 */
export default function CellSetCompositionBarPlot(props) {
  const {
    data,
    theme,
    width,
    height,
    marginRight = 200,
    marginBottom = 120,
    keyLength = 36,
    obsType,
    onBarSelect,
  } = props;

  const computedData = useMemo(() => {
    if(Array.isArray(data) && data.length === 1) {
      // We expect only one returned data frame.
      const { df, metadata } = data[0];
      // Return in array-of-objects form that Vega-Lite likes.


      console.log(metadata);
      return df.obsSetId.map((obsSetId, i) => ({
        obsSetId,
        // TODO: swap direction of foldChange/logFC if necessary
        obsSetFoldChange: df.obsSetFoldChange[i],
        logFoldChange: Math.log2(df.obsSetFoldChange[i]),
        interceptExpectedSample: df.interceptExpectedSample[i],
        effectExpectedSample: df.effectExpectedSample[i],
        isCredibleEffect: df.isCredibleEffect[i],
        // TODO: boolean flag for wasReferenceObsSet (check metadata)

        // TODO: color per bar

        // TODO: unique key per bar
      }));
    }
    return null;
  }, [data]);

  console.log(computedData);

  // Add a property `keyName` which concatenates the key and the name,
  // which is both unique and can easily be converted
  // back to the name by taking a substring.
  // Add a property `colorString` which contains the `[r, g, b]` color
  // after converting to a color hex string.
  /*const data = rawData.map(d => ({
    ...d,
    keyName: d.key + d.name,
    colorString: colorArrayToString(d.color),
  }));

  // Get an array of keys for sorting purposes.
  const keys = data.map(d => d.keyName);

  const colorScale = {
    // Manually set the color scale so that Vega-Lite does
    // not choose the colors automatically.
    domain: data.map(d => d.key),
    range: data.map((d) => {
      const [r, g, b] = !d.isGrayedOut ? d.color : getDefaultColor(theme);
      return `rgba(${r}, ${g}, ${b}, 1)`;
    }),
  };*/
  const captializedObsType = capitalize(obsType);

  const spec = {
    mark: { type: 'bar', stroke: 'black', cursor: 'pointer' },
    /*params: [
      {
        name: 'highlight',
        select: {
          type: 'point',
          on: 'mouseover',
        },
      },
      {
        name: 'select',
        select: 'point',
      },
      {
        name: 'bar_select',
        select: {
          type: 'point',
          on: 'click[event.shiftKey === false]',
          fields: ['setNamePath', 'isGrayedOut'],
          empty: 'none',
        },
      },
      {
        name: 'shift_bar_select',
        select: {
          type: 'point',
          on: 'click[event.shiftKey]',
          fields: ['setNamePath', 'isGrayedOut'],
          empty: 'none',
        },
      },
    ],*/
    encoding: {
      /*x: {
        field: 'keyName',
        type: 'nominal',
        axis: { labelExpr: `substring(datum.label, ${keyLength})` },
        title: `${captializedObsType} Set`,
        sort: keys,
      },*/
      y: {
        field: 'obsSetId',
        type: 'nominal',
        title: 'Obs Set'
      },
      x: {
        // TODO: which field to use here? intercept+effect instead?
        field: 'logFoldChange',
        type: 'quantitative',
        title: `Log fold-change`,
      },
      /*color: {
        field: 'key',
        type: 'nominal',
        scale: colorScale,
        legend: null,
      },
      */
      color: {
        field: 'isCredibleEffect',
        type: 'nominal',
      },
      /*tooltip: {
        field: 'size',
        type: 'quantitative',
      },

      fillOpacity: {
        condition: {
          param: 'select',
          value: 1,
        },
        value: 0.3,
      },
      strokeWidth: {
        condition: [
          {
            param: 'select',
            empty: false,
            value: 1,
          },
          {
            param: 'highlight',
            empty: false,
            value: 2,
          },
        ],
        value: 0,
      },
      */
    },
    // TODO: for width, also subtract length of longest y-axis set name label.
    width: clamp(width - marginRight, 10, Infinity),
    height: clamp(height - marginBottom, 10, Infinity),
    config: VEGA_THEMES[theme],
  };

  const handleSignal = (name, value) => {
    if (name === 'bar_select') {
      onBarSelect(value.setNamePath, value.isGrayedOut[0]);
    } else if (name === 'shift_bar_select') {
      const isGrayedOut = false;
      const selectOnlyEnabled = true;
      onBarSelect(value.setNamePath, isGrayedOut, selectOnlyEnabled);
    }
  };

  const signalListeners = { bar_select: handleSignal, shift_bar_select: handleSignal };
  const getTooltipText = useCallback(item => ({
    [`${captializedObsType} Set`]: item.datum.name,
    [`${captializedObsType} Set Size`]: item.datum.size,
  }
  ), [captializedObsType]);

  return (
    <VegaPlot
      data={computedData}
      spec={spec}
      signalListeners={signalListeners}
      getTooltipText={getTooltipText}
    />
  );
}
