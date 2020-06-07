import React, { useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';
import TitleInfo from '../TitleInfo';
import { CELL_SETS_CHANGE } from '../../events';
import VegaPlot from './VegaPlot';
import { treeToVisibleSetSizes } from '../sets/reducer';
import { createVegaLiteApi, useGridItemSize, VEGA_THEMES } from './utils';

const marginRight = 90;
const marginBottom = 120;

const vl = createVegaLiteApi();


export default function SetSizePlotSubscriber(props) {
  const {
    removeGridComponent,
    onReady,
    theme,
  } = props;

  const onReadyCallback = useCallback(onReady, []);
  const [width, height, containerRef] = useGridItemSize();
  const [data, setData] = useState([]);

  useEffect(() => {
    const cellSetsChangeToken = PubSub.subscribe(CELL_SETS_CHANGE,
      (msg, cellSets) => {
        // Add a property `keyName` which concatenates the key and the name,
        // which is both unique (for Vega-Lite) and can easily be converted
        // back to the name by taking a substring.
        const setSizes = treeToVisibleSetSizes(cellSets)
          .map(d => ({ ...d, keyName: d.key + d.name }));
        setData(setSizes);
      });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(cellSetsChangeToken);
    };
  }, [onReadyCallback]);

  // Manually set the color scale so that Vega-Lite does
  // not choose the colors automatically.
  const colors = {
    domain: data.map(d => d.key),
    range: data.map(d => d.color),
  };

  // Get an array of keys for sorting purposes.
  const keys = data.map(d => d.keyName);

  const spec = vl
    .markBar()
    .encode(
      vl.x().fieldN('keyName')
        .axis({ labelExpr: 'substring(datum.label, 36)' })
        .title('Name')
        .sort(keys),
      vl.y().fieldQ('size')
        .title('Size'),
      vl.color().fieldN('key')
        .scale(colors)
        .legend(null),
      vl.tooltip().fieldQ('size'),
    )
    .width(width - marginRight)
    .height(height - marginBottom)
    .config(VEGA_THEMES[theme])
    .toJSON();

  return (
    <TitleInfo
      title="Cell Set Size"
      removeGridComponent={removeGridComponent}
    >
      <div ref={containerRef} className="vega-container">
        <VegaPlot
          data={data}
          spec={spec}
        />
      </div>
    </TitleInfo>
  );
}
