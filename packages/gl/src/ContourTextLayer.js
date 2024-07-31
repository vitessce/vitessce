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

// Reference: https://github.com/visgl/deck.gl/blob/v8.8.27/modules/aggregation-layers/src/contour-layer/contour-layer.ts
import { ContourLayer } from '@deck.gl/aggregation-layers';

const DEFAULT_THRESHOLD = 1;

const defaultProps = {
  // Props from ContourLayer
  // grid aggregation
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: 1},
  gpuAggregation: true,
  aggregation: 'SUM',
  // contour lines
  contours: [{threshold: DEFAULT_THRESHOLD}],
  zOffset: 0.005,

  onContourDataChange: { type: 'function', value: null },
};

export default class ContourTextLayer extends ContourLayer {

  _generateContours() {
    super._generateContours();
    // TODO: is there a better way than a callback?
    // Maybe using promises that resolve upon first render?
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
    this.props.onContourDataChange(this.state.contourData);
  }
}

ContourTextLayer.layerName = 'ContourTextLayer';
ContourTextLayer.defaultProps = defaultProps;
