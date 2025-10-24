import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import { Handler } from 'vega-tooltip';
import { useVegaEmbed } from "react-vega";
import * as vegaImport from 'vega';
import { useTooltipStyles } from '@vitessce/tooltip';
import { getInterpolateFunction } from '@vitessce/legend';
import ReactVega from './ReactVega.js';
import { DATASET_NAME } from './utils.js';
import { VegaGlobalStyles } from './styles.js';

// Register additional colormaps using vega.scheme().
// Reference: https://vega.github.io/vega/docs/schemes/
vegaImport.scheme('jet', getInterpolateFunction('jet'));

function isVega(spec) {
  return spec.$schema === 'https://vega.github.io/schema/vega/v5.json';
}

function renderTooltipContents(tooltipText) {
  const tableRows = Object.entries(tooltipText)
    .map(([key, value]) => (
      `<tr key=${key}>
        <th>${key}</th>
        <td>${value}</td>
      </tr>`
    ))
    .join('');

  return (
    `<table>
      <tbody>
        ${tableRows}
      </tbody>
    </table>`
  );
}

/**
 * A wrapper around the react-vega Vega component.
 * @param {object} props
 * @param {object} spec A vega or vega-lite spec.
 * @param {object[]} data The plot data as an array of objects.
 * @param {object} signalListeners Vega signal listeners. Optional.
 */
export function VegaPlot(props) {
  const {
    spec: partialSpec,
    data,
    getTooltipText,
    signalListeners,
    renderer = 'svg',
    onNewView,
  } = props;

  // eslint-disable-next-line no-unused-vars
  const { classes: tooltipClasses } = useTooltipStyles();

  const tooltipHandler = useMemo(() => {
    if (typeof getTooltipText === 'function') {
      const tooltipConfig = {
        theme: 'custom',
        offsetX: 10,
        offsetY: 10,
        // Use table element to match packages/tooltip/TooltipContent implementation.
        formatTooltip: tooltipText => `
          <div class="${tooltipClasses.tooltipContent}">
            ${renderTooltipContents(tooltipText)}
          </div>
        `,
      };

      const handlerInstance = new Handler(tooltipConfig);
      const originalCall = handlerInstance.call;
      handlerInstance.call = (handler, event, item, value) => {
        if (item && item.datum && value) {
          const tooltipText = getTooltipText(item);
          originalCall.call(this, handler, event, item, tooltipText);
        } else {
          originalCall.call(this, handler, event, item, value);
        }
      };
      return handlerInstance.call;
    }
    return false;
  }, [getTooltipText, tooltipClasses.tooltipContent]);

  const spec = useMemo(() => ({
    ...partialSpec,
    data: (isVega(partialSpec)
      ? [
        { name: DATASET_NAME },
        //...partialSpec.data,
      ]
      : { name: DATASET_NAME }
    ),
  }), [partialSpec]);

  const ref = useRef();
  const embed = useVegaEmbed({
    ref,
    spec,
    options: {
      mode: "vega-lite",
      renderer,
      scaleFactor: 3,
      width: spec?.width,
      height: spec?.height,
      tooltip: tooltipHandler,
    },
    onEmbed: onNewView,
  });

  // Dynamic data.
  useEffect(() => {
    if(ref && embed && spec && data) {
      embed.view.data(DATASET_NAME, data).runAsync();
    }
  }, [ref, embed, data, spec]);

  // Dynamic width/height.
  useEffect(() => {
    if (ref && embed && spec?.width && spec?.height) {
      embed.view.width(spec.width).height(spec.height).runAsync();
    }
  }, [ref, embed, spec?.width, spec?.height]);

  // Set up signal listeners to listen for interactions.
  useEffect(() => {
    const signalListenersToCleanup = new Map();
    if (ref && embed && signalListeners) {
      Object.entries(signalListeners).forEach(([signalName, callback]) => {
        embed?.view.addSignalListener(signalName, callback);
        signalListenersToCleanup.set(signalName, callback);
      });
    }

    return () => {
      signalListenersToCleanup.forEach((callback, signalName) => {
        embed?.view.removeSignalListener(signalName, callback);
      });
    };
  }, [ref, embed, signalListeners]);

  return (
    <>
      <VegaGlobalStyles />
      {spec && data && data.length > 0 ? (
        <div ref={ref} />
      ) : null}
    </>
  );
}
