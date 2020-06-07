/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';
import TitleInfo from '../TitleInfo';
import { LAYER_ADD } from '../../events';
import VegaPlot from './VegaPlot';
import { createVegaLiteApi, useGridItemSize, VEGA_THEMES } from './utils';
import { getChannelStats } from '@hubmap/vitessce-image-viewer';
import { fromEntries } from '../utils';

const marginRight = 90;
const marginBottom = 120;

const vl = createVegaLiteApi();


export default function LayerHistogramSubscriber(props) {
  const {
    removeGridComponent,
    onReady,
    theme,
  } = props;

  const onReadyCallback = useCallback(onReady, []);
  const [width, height, containerRef] = useGridItemSize();
  const [data, setData] = useState([]);

  useEffect(() => {
    const layerAddToken = PubSub.subscribe(LAYER_ADD,
      (msg, layerData) => {
        const { loader, layerId } = layerData;
        const defaultSelection = fromEntries(loader.dimensions.map(dim => ([dim.field, 0])));
        getChannelStats({ loader, loaderSelection: [defaultSelection] }).then((stats) => {
            const statsObj = 
                {
                    layerId,
                    min: stats[0].domain[0],
                    max: stats[0].domain[1],
                    mean: stats[0].mean,
                    median: stats[0].median,
                    q1: stats[0].q1,
                    q3: stats[0].q3,
                    sd: stats[0].sd,
                };
            setData(prev => ({ ...prev, [layerId]: statsObj }));
        });
      });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(layerAddToken);
    };
  }, [onReadyCallback]);

  const spec = vl.layer(
        vl
            .markRule({
                "color": "white",
                "style": "boxplot-rule",
            })
            .encode(
                vl.x().fieldQ('min'),
                vl.x2().fieldQ('max'),
                vl.y().fieldN('layerId')
            ),
        vl
            .markBar({
                "size": 24,
                "orient": "horizontal",
                "style": "boxplot-box",
            })
            .encode(
                vl.x().fieldQ('q1'),
                vl.x2().fieldQ('q3'),
                vl.y().fieldN('layerId')
            ),
        vl
            .markTick({
                "size": 24,
                "color": "white",
                "orient": "vertical",
                "style": "boxplot-median"
            })
            .transform(
                vl.fold(['min', 'max', 'mean', 'median'])
            )
            .encode(
                vl.x().fieldQ('value'),
                vl.y().fieldN('layerId').axis({ labelExpr: 'substring(datum.label, 0, 5)' })
            ),
    )
    .width(width - marginRight)
    .height(height - marginBottom)
    .config(VEGA_THEMES[theme])
    .toJSON();

console.log(spec);

  return (
    <TitleInfo
      title="Layer Histogram"
      removeGridComponent={removeGridComponent}
    >
      <div ref={containerRef} className="vega-container">
        <VegaPlot
          data={Object.values(data)}
          spec={spec}
        />
      </div>
    </TitleInfo>
  );
}
