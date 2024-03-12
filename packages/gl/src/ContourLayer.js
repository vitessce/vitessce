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

const DEFAULT_COLOR = [255, 255, 255, 255];
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_THRESHOLD = 1;

const defaultProps = {
  // grid aggregation
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: 1},
  gpuAggregation: true,
  aggregation: 'SUM',

  // contour lines
  contours: [{threshold: DEFAULT_THRESHOLD}],

  zOffset: 0.005,
  filled: { type: 'boolean', compare: false },
  pattern: { type: 'boolean', compare: false },
  getFillPattern: { type: 'accessor', compare: false },
  getFillPatternScale: { type: 'accessor', compare: false },
};

export default class ContourPatternLayer extends ContourLayer {
  
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
