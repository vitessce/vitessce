import React, { Suspense, useMemo } from 'react';
import { Handler } from 'vega-tooltip';
import clsx from 'clsx';
import { useTooltipStyles } from '@vitessce/tooltip';
import ReactVega from './ReactVega';
import { DATASET_NAME } from './utils';
import { useStyles } from './styles';


// TODO: React.lazy is not working with Vitessce in the portal-ui.
// For now, we can work around this by not using React.lazy,
// but for performance benefits that come with lazy-loading
// we should eventually try to resolve this issue.
// const ReactVega = React.lazy(() => import('./ReactVega'));

function isVega(spec) {
  return spec.$schema === 'https://vega.github.io/schema/vega/v5.json';
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
    tooltipProps,
    signalListeners,
  } = props;

  // eslint-disable-next-line no-unused-vars
  const classes = useStyles();
  const tooltipClasses = useTooltipStyles();

  let tooltipHandler = false;

  const renderTooltipContents = (tooltipObj) => {
    const tableRows = Object.entries(tooltipObj)
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

  if (tooltipProps && Object.keys(tooltipProps).length > 0) {
    const tooltipConfig = {
      theme: 'custom',
      offsetX: 10,
      offsetY: 10,
      // Use table element to match packages/tooltip/TooltipContent implementation.
      formatTooltip: tooltipObj => `
        <div class="${clsx(classes.tooltipContainer, tooltipClasses.tooltipContent)}">
          ${renderTooltipContents(tooltipObj)}
        </div>
      `,
    };

    tooltipHandler = new Handler(tooltipConfig);
    const originalCall = tooltipHandler.call;
    tooltipHandler.call = (handler, event, item) => {      
      if (item && item.datum) {
        const tooltipObj = {}
        Object.entries(tooltipProps.tooltipContents).map(([key, value]) => {
          tooltipObj[key] = tooltipProps.tooltipValuesGetter(item, value);
        });
        originalCall.call(this, handler, event, item, tooltipObj);
      }
    };
    tooltipHandler = tooltipHandler.call;
  }

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
    <ReactVega
      spec={spec}
      data={{
        [DATASET_NAME]: data,
      }}
      signalListeners={signalListeners}
      tooltip={tooltipHandler}
      renderer="canvas"
      scaleFactor={3}
    />
  ), [spec, data, signalListeners, tooltipHandler]);

  return (
    spec && data && data.length > 0 ? (
      <Suspense fallback={<div>Loading...</div>}>
        {vegaComponent}
      </Suspense>
    ) : null
  );
}
