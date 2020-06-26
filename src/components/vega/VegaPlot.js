import React, { Suspense, useMemo } from 'react';
import { Handler } from 'vega-tooltip';

const ReactVega = React.lazy(() => import('./ReactVega'));

const DATASET_NAME = 'table';

/**
 * A wrapper around the react-vega Vega component.
 * @param {object} props
 * @param {object} spec A vega or vega-lite spec.
 * @param {object[]} data The plot data as an array of objects.
 * @param {object} signalListeners Vega signal listeners. Optional.
 */
export default function VegaPlot(props) {
  const {
    spec: partialSpec,
    data,
    signalListeners,
  } = props;

  const spec = {
    ...partialSpec,
    data: { name: DATASET_NAME },
  };

  const vegaComponent = useMemo(() => (
    <ReactVega
      spec={spec}
      data={{
        [DATASET_NAME]: data,
      }}
      signalListeners={signalListeners}
      tooltip={new Handler().call}
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
