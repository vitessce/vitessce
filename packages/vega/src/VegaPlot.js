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

  if (tooltipProps && Object.keys(tooltipProps).length > 0) {
    const tooltipConfig = {
      theme: 'custom',
      offsetX: 10,
      offsetY: 10,
      // Use table element to match packages/tooltip/TooltipContent implementation.
      formatTooltip: value => `
        <div class="${clsx(classes.tooltipContainer, tooltipClasses.tooltipContent)}">
          <table>
            <tbody>
              <tr>
                <th>${tooltipProps.tooltipKeys[0]} Set</th>
                <td>${value[0]}</td>
              </tr>
              <tr>
                <th>${tooltipProps.tooltipKeys[1]} Set Size</th>
                <td>${value[1]}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
    };

    tooltipHandler = new Handler(tooltipConfig);
    const originalCall = tooltipHandler.call;
    tooltipHandler.call = (handler, event, item) => {
      if (item && item.datum) {
        const modifiedValue = tooltipProps.tooltipVals(item);
        originalCall.call(this, handler, event, item, modifiedValue);
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
