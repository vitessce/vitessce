import { ContourLayer } from '@deck.gl/aggregation-layers';
import { LineLayer } from '@deck.gl/layers';
import { polygon as turfPolygon, point as turfPoint, polygons } from '@turf/helpers';
import { getGeom } from "@turf/invariant";
import { flattenReduce } from '@turf/meta';
import { circle } from '@turf/circle';
import { union } from '@turf/union';
import { area } from '@turf/area';
import { distance } from '@turf/distance';
import { range } from 'lodash-es';


const DEFAULT_THRESHOLD = 1;

const defaultProps = {
  // for text
  obsSetPath: { type: 'object' },
  sampleSetPath: { type: 'object' },
  originalViewState: { type: 'object' },
  viewWidth: {type: 'number'},
  viewHeight: {type: 'number'},
  // grid aggregation
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: 1},
  gpuAggregation: true,
  aggregation: 'SUM',

  // contour lines
  contours: {
    type: 'object',
    value: [{threshold: DEFAULT_THRESHOLD}],
    optional: true,
    compare: 3
  },

  zOffset: 0.005
};

// Reference: https://github.com/visgl/deck.gl/blob/v8.9.36/modules/aggregation-layers/src/contour-layer/contour-layer.ts
export default class ContourLayerWithText extends ContourLayer {


  getLineAndTextLayers() {
    const lineAndTextLayers = [];

    // TODO: cache the text position point per
    // cell set, sample set, and feature selection?

    const { contourPolygons } = this.state.contourData;
    const { originalViewState, obsSetPath, viewWidth, viewHeight } = this.props;
    const obsSetName = obsSetPath?.at(-1);
    const l0 = contourPolygons?.filter(d => d.contour.i === 0) ?? [];
    const l1 = contourPolygons?.filter(d => d.contour.i === 1) ?? [];
    const l2 = contourPolygons?.filter(d => d.contour.i === 2) ?? [];
    //console.log("generateContours", obsSetName, l1, l2, originalViewState);

    // Get a circle polygon which outlines the whole plot.
    const center = [
      originalViewState.target[0],
      originalViewState.target[1],
    ];
    const scaleFactor = (2 ** originalViewState.zoom);
    const radius = Math.min(viewWidth, viewHeight) / 2 / scaleFactor;
    const options = { steps: 96, units: "degrees" };
    const circlePolygon = circle(center, radius, options);

    if(l0.length > 0) {
      const l2p = l0.map(d => (
        [
          // The vertices are 3D, but we only need 2D.
          [
            ...d.vertices.map(v => ([v[0], v[1]])),
            // Need four vertices (not 3), so repeat the first vertex.
            [d.vertices[0][0], d.vertices[0][1]],
          ]
        ]
      ));
      const l2u = union(polygons(l2p));
      const [maxAreaValue, maxAreaPolygon] = flattenReduce(
        l2u,
        (previousValue, currentFeature) => {
          if(getGeom(currentFeature).type ===  'Polygon') {
            const currArea = area(currentFeature);
            if(currArea >= previousValue[0]) {
              return [currArea, currentFeature];
            }
          }
          return previousValue;
        },
        // Initial value
        [0, null],
      );
      if (Math.log10(maxAreaValue) >= 10) {
      
        let minDist = Infinity;
        let minCirclePoint;
        let minPolygonPoint;

        const numVertices = maxAreaPolygon.geometry.coordinates[0].length;
        
        const polygonVertices = numVertices > 36
          ? range(36).map(i => maxAreaPolygon.geometry.coordinates[0][Math.floor(i * numVertices / 36)])
          : [...maxAreaPolygon.geometry.coordinates[0]];

        circlePolygon.geometry.coordinates[0].forEach((circleCoord) => {
          const circlePoint = turfPoint(circleCoord);
          polygonVertices.forEach((polyCoord) => {
            const polyPoint = turfPoint(polyCoord);
            const dist = distance(circlePoint, polyPoint);
            if(dist < minDist) {
              minDist = dist;
              minCirclePoint = circleCoord;
              minPolygonPoint = polyCoord;
            }
          });
        });

        lineAndTextLayers.push(new LineLayer({
          id: `line-${obsSetName}`,
          data: [
            {
              from: minPolygonPoint,
              to: minCirclePoint,
              color: [...this.state.contourData.contourPolygons[0].contour.color],
            },
          ],
          getColor: d => d.color,
          getSourcePosition: d => d.from,
          getTargetPosition: d => d.to,
          getWidth: 4,
        }));
      }
    }

    return lineAndTextLayers;
  }

  renderLayers() {
    const contourLayers = super.renderLayers();
    const lineAndTextLayers = this.getLineAndTextLayers();
    return [
      ...contourLayers,
      ...lineAndTextLayers,
    ];
  }
}
ContourLayerWithText.layerName = 'ContourLayerWithText';
ContourLayerWithText.defaultProps = defaultProps;
