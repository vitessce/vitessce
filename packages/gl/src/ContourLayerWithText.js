import { ContourLayer } from '@deck.gl/aggregation-layers';
import { LineLayer, TextLayer } from '@deck.gl/layers';
import { point as turfPoint, polygons } from '@turf/helpers';
import { getGeom } from '@turf/invariant';
import { flattenReduce } from '@turf/meta';
import { union } from '@turf/union';
import { area } from '@turf/area';
import { distance } from '@turf/distance';
import { range } from 'lodash-es';
import { AXIS_FONT_FAMILY } from './heatmap-constants.js';


const DEFAULT_THRESHOLD = 1;

const defaultProps = {
  // for text
  obsSetPath: { type: 'object' },
  sampleSetPath: { type: 'object' },
  circleInfo: { type: 'object' },
  circlePointSet: { type: 'object' },
  obsSetLabelsVisible: { type: 'boolean' },
  obsSetLabelSize: { type: 'number', min: 1, max: 100, value: 12 },

  // grid aggregation
  cellSize: { type: 'number', min: 1, max: 1000, value: 1000 },
  getPosition: { type: 'accessor', value: x => x.position },
  getWeight: { type: 'accessor', value: 1 },
  gpuAggregation: true,
  aggregation: 'SUM',

  // contour lines
  contours: {
    type: 'object',
    value: [{ threshold: DEFAULT_THRESHOLD }],
    optional: true,
    compare: 3,
  },

  zOffset: 0.005,
};

const MIN_AREA_THRESHOLD = 10;
const MAX_NUM_VERTICES = 36;

/**
 * Get the polygon with the maximum area,
 * and also return its area value.
 * @param {{contour, vertices}[]} levelToUse The
 * contourPolygons array filtered to a given level.
 * @returns {[number, object]} A tuple of
 * [area value, Turf polygon object].
 */
function getMaxAreaPolygon(levelToUse) {
  if (levelToUse.length === 0) {
    return [0, null];
  }
  const levelPolygons = levelToUse.map(d => (
    [
      // The vertices are 3D, but we only need 2D.
      [
        ...d.vertices.map(v => ([v[0], v[1]])),
        // Need four vertices (not 3), so repeat the first vertex.
        [d.vertices[0][0], d.vertices[0][1]],
      ],
    ]
  ));
  const levelPolygonsUnion = union(polygons(levelPolygons));
  const [maxAreaValue, maxAreaPolygon] = flattenReduce(
    levelPolygonsUnion,
    (previousValue, currentFeature) => {
      if (getGeom(currentFeature).type === 'Polygon') {
        const currArea = area(currentFeature);
        if (currArea >= previousValue[0]) {
          return [currArea, currentFeature];
        }
      }
      return previousValue;
    },
    // Initial value
    [0, null],
  );
  return [maxAreaValue, maxAreaPolygon];
}

/**
 * Get the area, polygon, and level associated with
 * the "polygon of maximum area". (Not actually maximum
 * among all levels but the max within a given level)
 * @param {{contour, vertices}[]} contourPolygons The
 * contourPolygons value within state.contourData
 * @returns {[number, object, number]} A tuple of
 * [area value, Turf polygon object, level index].
 */
function getMaxAreaPolygonAndLevel(contourPolygons) {
  const l2 = contourPolygons?.filter(d => d.contour.i === 2) ?? [];
  const [l2area, l2polygon] = getMaxAreaPolygon(l2);
  if (Math.log10(l2area) >= MIN_AREA_THRESHOLD) {
    return [l2area, l2polygon, 2];
  }
  const l1 = contourPolygons?.filter(d => d.contour.i === 1) ?? [];
  const [l1area, l1polygon] = getMaxAreaPolygon(l1);
  if (Math.log10(l1area) >= MIN_AREA_THRESHOLD) {
    return [l1area, l1polygon, 1];
  }
  const l0 = contourPolygons?.filter(d => d.contour.i === 0) ?? [];
  const [l0area, l0polygon] = getMaxAreaPolygon(l0);
  return [l0area, l0polygon, 0];
}

// Reference: https://github.com/visgl/deck.gl/blob/v8.9.36/modules/aggregation-layers/src/contour-layer/contour-layer.ts
export default class ContourLayerWithText extends ContourLayer {
  /**
   * Construct line and text layers to render.
   * @returns {object[]} Array of DeckGL layers.
   */
  getLineAndTextLayers() {
    const lineAndTextLayers = [];

    const { contourPolygons } = this.state.contourData;
    const { obsSetPath, contours, circleInfo, circlePointSet, obsSetLabelSize } = this.props;

    if (!circleInfo) {
      return lineAndTextLayers;
    }

    const obsSetName = obsSetPath?.at(-1);
    const [maxAreaValue, maxAreaPolygon, levelI] = getMaxAreaPolygonAndLevel(contourPolygons);

    // Get a circle polygon which outlines the whole plot.
    const { center, steps, polygon: circlePolygon } = circleInfo;

    if (maxAreaValue > 0 && maxAreaPolygon) {
      let minDist = Infinity;
      let minCirclePoint;
      let minCirclePointI;
      let minPolygonPoint;

      const numVertices = maxAreaPolygon.geometry.coordinates[0].length;

      // Only consider a maximum of 36 vertices from the polygon,
      // since it may be complex with many vertices.
      const polygonVertices = numVertices > MAX_NUM_VERTICES
        ? range(MAX_NUM_VERTICES).map(
          i => maxAreaPolygon
            .geometry
            .coordinates[0][Math.floor(i * numVertices / MAX_NUM_VERTICES)],
        )
        : [...maxAreaPolygon.geometry.coordinates[0]];

      // Find the pair (vertex on circle, vertex on contourPolygon) which
      // have the shortest distance.
      circlePolygon.geometry.coordinates[0].forEach((circleCoord, circlePointI) => {
        const circlePoint = turfPoint(circleCoord);
        polygonVertices.forEach((polyCoord) => {
          const polyPoint = turfPoint(polyCoord);
          const dist = distance(circlePoint, polyPoint);
          if (dist < minDist) {
            minDist = dist;
            minCirclePoint = circleCoord;
            minCirclePointI = circlePointI;
            minPolygonPoint = polyCoord;
          }
        });
      });

      // If this circle vertex has already been used, then its index
      // will be in the circlePointSet, so we instead try the subsequent
      // vertex until we find one that is unused
      // (or until the set is full, in which case we must reuse a vertex).
      while (circlePointSet.size < steps && circlePointSet.has(minCirclePointI)) {
        const nextCirclePointI = (minCirclePointI + 1) % steps;
        minCirclePointI = nextCirclePointI;
      }
      circlePointSet.add(minCirclePointI);
      minCirclePoint = circlePolygon.geometry.coordinates[0][minCirclePointI];

      // Compute the angle formed by the line
      // (from the circle's center point).
      const angleRadians = Math.atan2(
        minCirclePoint[1] - center[1],
        minCirclePoint[0] - center[0],
      );
      let angleDegrees = angleRadians * 180 / Math.PI;

      // Create the line and text layers.
      lineAndTextLayers.push(new LineLayer({
        id: `line-${obsSetName}`,
        data: [
          {
            from: minPolygonPoint,
            to: minCirclePoint,
            color: contours[levelI].color,
          },
        ],
        getColor: d => d.color,
        getSourcePosition: d => d.from,
        getTargetPosition: d => d.to,
        getWidth: levelI + 0.5,
      }));

      // Determine textAnchor based on angle formed on circle.
      let textAnchor = 'start';
      if (angleDegrees < 0) {
        angleDegrees += 360;
      }
      if (angleDegrees > 90 && angleDegrees < 270) {
        angleDegrees -= 180;
        textAnchor = 'end';
      }
      lineAndTextLayers.push(new TextLayer({
        id: `text-${obsSetName}`,
        data: [
          {
            label: obsSetName,
            to: minCirclePoint,
            color: contours[levelI].color,
          },
        ],
        getPosition: d => d.to,
        getText: d => d.label,
        getColor: d => d.color,
        getSize: obsSetLabelSize,
        getAngle: -angleDegrees,
        getTextAnchor: textAnchor,
        getAlignmentBaseline: 'center',
        fontFamily: AXIS_FONT_FAMILY,
        fontWeight: 'normal',
        // maxWidth: 80 * obsSetLabelSize,
      }));
    }

    return lineAndTextLayers;
  }

  /**
   * Overrides the ContourLayer renderLayers function,
   * so that the custom text/line layers can be
   * appended to the contour line/polygon layers.
   * @returns {object[]} Array of DeckGL layers.
   */
  renderLayers() {
    const { obsSetLabelsVisible } = this.props;
    const contourLayers = super.renderLayers();
    const lineAndTextLayers = obsSetLabelsVisible
      ? this.getLineAndTextLayers()
      : [];
    return [
      ...contourLayers,
      ...lineAndTextLayers,
    ];
  }
}
ContourLayerWithText.layerName = 'ContourLayerWithText';
ContourLayerWithText.defaultProps = defaultProps;
