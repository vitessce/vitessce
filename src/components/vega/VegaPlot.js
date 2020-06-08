import React from 'react';
import { Vega as ReactVega } from 'react-vega';
import { Handler } from 'vega-tooltip';

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

  return (
    spec && data && data.length > 0 ? (
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
    ) : null
  );
}
