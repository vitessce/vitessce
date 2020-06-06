import React from 'react';
import { Vega as VegaComponent } from 'react-vega';
import { Handler } from 'vega-tooltip';

const DATASET_NAME = 'table';

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
      <VegaComponent
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
