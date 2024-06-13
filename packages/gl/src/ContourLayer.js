// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { LineLayer, SolidPolygonLayer } from '@deck.gl/layers';
import { FillStyleExtension } from '@deck.gl/extensions';
import { ContourLayer } from '@deck.gl/aggregation-layers';
import { quantile } from 'd3-array';
import { isEqual } from 'lodash-es';

const DEFAULT_COLOR = [255, 255, 255, 255];
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_THRESHOLD = 1;

const defaultProps = {
  // grid aggregation
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: 1 },
  gpuAggregation: true,
  aggregation: 'MEAN', // TODO: use MEAN so that point density does not result in misleading contours.

  // contour lines
  contours: [{threshold: DEFAULT_THRESHOLD}],
  percentiles: { type: 'array', value: [0.09, 0.9, 0.99, 0.999], compare: true },
  thresholds: { type: 'array', value: [], compare: true },
  contourColor: { type: 'array', value: [0, 0, 0], compare: true },

  zOffset: 0.005,
  filled: { type: 'boolean', value: false, compare: false },
  pattern: { type: 'boolean', value: false, compare: false },
  getFillPattern: { type: 'accessor', compare: false },
  getFillPatternScale: { type: 'accessor', compare: false },
};

export default class ContourPatternLayer extends ContourLayer {

  getThresholds(percentiles) {
    // How to convert positions to XY coordinates
    // Reference: https://github.com/visgl/deck.gl/blob/89189f4e9ecb2f1b9b619f9a66c246690948fd19/modules/aggregation-layers/src/cpu-grid-layer/grid-aggregator.ts#L173
    
    // How to get weights
    // Reference: https://github.com/visgl/deck.gl/blob/89189f4e9ecb2f1b9b619f9a66c246690948fd19/modules/aggregation-layers/src/contour-layer/contour-layer.ts#L349
    
    const attributes = this.getAttributes();
    const positions = attributes.positions.value;
    const { size: positionSize } = attributes.positions.getAccessor();

    const weights = attributes.count.value;
    const { size: weightSize } = attributes.count.getAccessor();

    const numInstances = this.props.data.length;

    const { viewport } = this.context;
    const { width, height } = viewport;

    const weightValues = new Float32Array(numInstances);

    // Note: could potentially use a <1 cellSize
    // Reference: https://github.com/d3/d3-contour/issues/63#issuecomment-1224930141

    const thresholds = percentiles.map(p => quantile(weights, p))
      .map((t) => Math.max(t, 1.0))
      .filter((t, i) => i === 0 || t > 1.0);
    return thresholds;
  }

  updateState(opts) {
    super.updateState(opts);
    const { oldProps, props } = opts;

    if(
      oldProps.width !== props.width
      || oldProps.height !== props.height
      || oldProps.cellSize !== props.cellSize
      || oldProps.getPosition !== props.getPosition
      || oldProps.getWeight !== props.getWeight
      || oldProps.data !== props.data
      // The inclusion of contours and zOffset are necessary to overwrite the _updateThresholdData call of the superclass.
      // Reference: https://github.com/visgl/deck.gl/blob/03ce925107a63830e48e706c521000a08e20a02c/modules/aggregation-layers/src/contour-layer/contour-layer.ts#L201C9-L201C83
      || oldProps.contours !== props.contours
      || oldProps.filled !== props.filled
      || oldProps.thresholds !== props.thresholds
      || oldProps.zOffset !== props.zOffset
      || !isEqual(oldProps.percentiles, props.percentiles)
      || !isEqual(oldProps.contourColor, props.contourColor)
    ) {
      const thresholds = props.thresholds ? props.thresholds : [];
      const contours = thresholds.map((threshold, i) => ({
        threshold: (props.filled ? [threshold, threshold[i+1] || Infinity] : threshold),
        // TODO: should the opacity steps be uniform? Should align with human perception.
        color: [...props.contourColor, (props.filled ? ((i+0.5)/thresholds.length * 255) : ((i+1)/(thresholds.length)) * 255)],
        strokeWidth: 2,
      }));
      this._updateThresholdData({ contours, zOffset: props.zOffset, fromSubclass: true });
      super._generateContours();
    }
  }

  _updateThresholdData(params) {
    const { contours, zOffset, fromSubclass = false } = params;
    if(fromSubclass) {
      super._updateThresholdData({ contours, zOffset });
    } else {
      // We never want to call super._updateThresholdData to be called with contours that we did not compute.
      super._updateThresholdData({ contours: [], zOffset });
    }
  }
  
  renderLayers() {
    const {
      filled,
      pattern,
      getFillPatternScale,
      getFillPattern,
    } = this.props;

    const {contourSegments, contourPolygons} = this.state.contourData;

    const LinesSubLayerClass = this.getSubLayerClass('lines', LineLayer);
    const BandsSubLayerClass = this.getSubLayerClass('bands', SolidPolygonLayer);

    // Contour lines layer
    const lineLayer =
      contourSegments &&
      contourSegments.length > 0 &&
      new LinesSubLayerClass(
        this.getSubLayerProps({
          id: 'lines'
        }),
        {
          data: this.state.contourData.contourSegments,
          getSourcePosition: d => d.start,
          getTargetPosition: d => d.end,
          getColor: d => d.contour.color || DEFAULT_COLOR,
          getWidth: d => d.contour.strokeWidth || DEFAULT_STROKE_WIDTH
        }
      );

    // Contour bands layer
    const bandsLayer =
      contourPolygons &&
      contourPolygons.length > 0 &&
      new BandsSubLayerClass(
        this.getSubLayerProps({
          id: 'bands'
        }),
        {
          parameters: {depthTest: false},
          data: this.state.contourData.contourPolygons,
          filled: filled,
          getPolygon: d => d.vertices,
          getFillColor: d => d.contour.color || DEFAULT_COLOR,
          ...(pattern ? {
             // props added by FillStyleExtension
            fillPatternMask: true,
            fillPatternAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl/master/examples/layer-browser/data/pattern.png',
            fillPatternMapping: {
              "hatch-1x": {
                "x": 4,
                "y": 4,
                "width": 120,
                "height": 120,
                "mask": true
              },
              "hatch-2x": {
                "x": 132,
                "y": 4,
                "width": 120,
                "height": 120,
                "mask": true
              },
              "hatch-cross": {
                "x": 4,
                "y": 132,
                "width": 120,
                "height": 120,
                "mask": true
              },
              "dots": {
                "x": 132,
                "y": 132,
                "width": 120,
                "height": 120,
                "mask": true
              }
            },
            getFillPattern,
            getFillPatternScale,
            getFillPatternOffset: [0, 0],
            extensions: [
              new FillStyleExtension({ pattern: true }),
            ],
          } : {}),
        }
      );

    return [lineLayer, bandsLayer];
  }

}

ContourPatternLayer.layerName = 'ContourPatternLayer';
ContourPatternLayer.defaultProps = defaultProps;
