import React, { Suspense, useMemo } from 'react';
import { Handler } from 'vega-tooltip';
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

// https://github.com/vega/vega-tooltip/blob/main/docs/customizing_your_tooltip.md
// https://github.com/vega/vega-tooltip/blob/main/docs/APIs.md#options

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
    signalListeners,
  } = props;

  const classes = useStyles();
  
  const tooltipConfig = {
    theme: "custom",
    offsetX: 10,
    offsetY: 20,
    formatTooltip: (e) => `Name: ${e.name} Size: ${e.size}`
  };

  const tooltipHandler = new Handler(tooltipConfig);

  const originalCall = tooltipHandler.call;

  tooltipHandler.call = (handler, event, item, value) => {
    if (item && item.datum) {
      const { name, size } = item.datum;
      const modifiedValue = {"name": name, "size": size};
      originalCall.call(this, handler, event, item, modifiedValue);
    }
  };

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
      tooltip={tooltipHandler.call}
      renderer="canvas"
      scaleFactor={3}
    />
  ), [spec, data, signalListeners]);

  return (
    spec && data && data.length > 0 ? (
      <Suspense fallback={<div>Loading...</div>}>
        {vegaComponent}
      </Suspense>
    ) : null
  );
}
