import React, { Suspense, useMemo } from 'react';
import { Handler } from 'vega-tooltip';
import * as vegaImport from 'vega';
import { useTooltipStyles } from '@vitessce/tooltip';
import { getInterpolateFunction } from '@vitessce/legend';
import ReactVega from './ReactVega.js';
import { DATASET_NAME } from './utils.js';
import { VegaGlobalStyles } from './styles.js';

// Register additional colormaps using vega.scheme().
// Reference: https://vega.github.io/vega/docs/schemes/
vegaImport.scheme('jet', getInterpolateFunction('jet'));

// TODO: React.lazy is not working with Vitessce in the portal-ui.
// For now, we can work around this by not using React.lazy,
// but for performance benefits that come with lazy-loading
// we should eventually try to resolve this issue.
// const ReactVega = React.lazy(() => import('./ReactVega'));

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
        ...partialSpec.data,
      ]
      : { name: DATASET_NAME }
    ),
  }), [partialSpec]);

  const vegaComponent = useMemo(() => (
    <>
      <VegaGlobalStyles />
      <ReactVega
        spec={spec}
        data={{
          [DATASET_NAME]: data,
        }}
        signalListeners={signalListeners}
        tooltip={tooltipHandler}
        renderer={renderer}
        scaleFactor={3}
        // We need to force a re-render when the spec
        // is the same except for changed width/height
        // (to support responsive plots).
        key={JSON.stringify({ width: spec.width, height: spec.height })}
        onNewView={onNewView}
      />
    </>
  ), [spec, data, signalListeners, tooltipHandler, renderer, onNewView]);

  return (
    spec && data && data.length > 0 ? (
      <Suspense fallback={<div>Loading...</div>}>
        {vegaComponent}
      </Suspense>
    ) : null
  );
}
