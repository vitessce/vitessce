/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
// File adopted from nebula.gl's SelectionLayer
// https://github.com/uber/nebula.gl/blob/8e9c2ec8d7cf4ca7050909ed826eb847d5e2cd9c/modules/layers/src/layers/selection-layer.js
import { CompositeLayer } from 'deck.gl';
import { polygon as turfPolygon, point as turfPoint } from '@turf/helpers';
import { booleanWithin } from '@turf/boolean-within';
import { booleanContains } from '@turf/boolean-contains';
import { booleanOverlap } from '@turf/boolean-overlap';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { ScatterplotLayer } from '@deck.gl/layers';
import { SELECTION_TYPE } from 'nebula.gl';
import { EditableGeoJsonLayer } from '@nebula.gl/layers';
import { DrawPolygonByDraggingMode, ViewMode } from '@nebula.gl/edit-modes';

const EDIT_TYPE_ADD = 'addFeature';
const EDIT_TYPE_CLEAR = 'clearFeatures';

class ClickableDrawPolygonByDraggingMode extends DrawPolygonByDraggingMode {
  // eslint-disable-next-line class-methods-use-this
  handleClick(event, props) {
    props.onEdit({ editType: EDIT_TYPE_CLEAR });
  }
}

const MODE_MAP = {
  [SELECTION_TYPE.POLYGON]: ClickableDrawPolygonByDraggingMode,
};

const defaultProps = {
  layerIds: [],
  onSelect: () => {},
};

const EMPTY_DATA = {
  type: 'FeatureCollection',
  features: [],
};

const LAYER_ID_GEOJSON = 'selection-geojson';

const PASS_THROUGH_PROPS = [
  'lineWidthScale',
  'lineWidthMinPixels',
  'lineWidthMaxPixels',
  'lineWidthUnits',
  'lineJointRounded',
  'lineMiterLimit',
  'pointRadiusScale',
  'pointRadiusMinPixels',
  'pointRadiusMaxPixels',
  'lineDashJustified',
  'getLineColor',
  'getFillColor',
  'getPointRadius',
  'getLineWidth',
  'getLineDashArray',
  'getTentativeLineDashArray',
  'getTentativeLineColor',
  'getTentativeFillColor',
  'getTentativeLineWidth',
  'editHandlePointRadiusScale',
  'editHandlePointRadiusMinPixels',
  'editHandlePointRadiusMaxPixels',
  'getEditHandlePointColor',
  'getEditHandlePointRadius',
  'modeHandlers',
];

export default class SelectionLayer extends CompositeLayer {
  _selectPolygonObjects(coordinates) {
    const {
      flipY,
      obsLayers,
    } = this.props;

    const flippedCoordinates = (flipY
      ? coordinates.map(poly => poly.map(p => ([p[0], -p[1]])))
      : coordinates);

    // Convert the selection to a turf polygon object.
    const selectedPolygon = turfPolygon(flippedCoordinates);

    // quadtree.visit() takes a callback that returns a boolean:
    // If true returned, then the children of the node are _not_ visited.
    // If false returned, then the children of the node are visited.
    // Reference: https://github.com/d3/d3-quadtree#quadtree_visit
    obsLayers.forEach((obsLayer) => {
      const {
        getObsCoords,
        obsQuadTree,
        obsIndex,
        onSelect: layerOnSelect,
      } = obsLayer;

      // Create an array to store the results.
      // Clear the array before checking each new layer.
      const pickingInfos = [];

      // It is possible for a layer to not have an obsQuadTree,
      // for example if the layer is a segmentation bitmask without associated
      // obsLocations.
      obsQuadTree?.visit((node, x0, y0, x1, y1) => {
        const nodePoints = [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]];
        const nodePolygon = turfPolygon(nodePoints);

        const nodePolygonContainsSelectedPolygon = booleanContains(nodePolygon, selectedPolygon);
        const nodePolygonWithinSelectedPolygon = booleanWithin(nodePolygon, selectedPolygon);
        const nodePolygonOverlapsSelectedPolgyon = booleanOverlap(nodePolygon, selectedPolygon);

        if (!nodePolygonContainsSelectedPolygon
          && !nodePolygonWithinSelectedPolygon
          && !nodePolygonOverlapsSelectedPolgyon) {
          // We are not interested in anything below this node,
          // so return true because we are done with this node.
          return true;
        }

        // This node made it past the above return statement, so it must either
        // contain, be within, or overlap with the selected polygon.

        // Check if this is a leaf node.
        if (node.data) {
          let current = node;
          while (current) {
            const pointCoords = [].slice.call(getObsCoords(current.data));
            if (booleanPointInPolygon(turfPoint(pointCoords), selectedPolygon)) {
              pickingInfos.push(current.data);
            }
            current = current.next;
          }
        }

        // Return false because we are not done.
        // We want to visit the children of this node.
        return false;
      });
      const pickingIds = pickingInfos.map(obsI => obsIndex[obsI]);
      layerOnSelect(pickingIds);
    });
  }

  _selectEmpty() {
    const { obsLayers } = this.props;
    obsLayers.forEach((obsLayer) => {
      const { onSelect: layerOnSelect } = obsLayer;
      layerOnSelect([]);
    });
  }

  renderLayers() {
    const mode = MODE_MAP[this.props.selectionType] || ViewMode;

    const inheritedProps = {};
    PASS_THROUGH_PROPS.forEach((p) => {
      if (this.props[p] !== undefined) inheritedProps[p] = this.props[p];
    });
    const layers = [
      new EditableGeoJsonLayer(
        this.getSubLayerProps({
          id: LAYER_ID_GEOJSON,
          pickable: true,
          mode,
          modeConfig: {
            dragToDraw: true,
          },
          selectedFeatureIndexes: [],
          data: EMPTY_DATA,
          onEdit: ({ updatedData, editType }) => {
            if (editType === EDIT_TYPE_ADD) {
              const { coordinates } = updatedData.features[0].geometry;
              this._selectPolygonObjects(coordinates);
            } else if (editType === EDIT_TYPE_CLEAR) {
              // We want to select an empty array to clear any previous selection.
              this._selectEmpty();
            }
          },
          _subLayerProps: {
            guides: {
              pointType: 'circle',
              _subLayerProps: {
                'points-circle': {
                  // Styling for editHandles goes here.
                  // Reference: https://github.com/uber/nebula.gl/issues/618#issuecomment-898466319
                  type: ScatterplotLayer,
                  radiusScale: 1,
                  stroked: true,
                  getLineWidth: 1,
                  radiusMinPixels: 1,
                  radiusMaxPixels: 3,
                  getPointRadius: 2,
                },
              },
            },
          },
          ...inheritedProps,
        }),
      ),
    ];

    return layers;
  }
}

SelectionLayer.layerName = 'SelectionLayer';
SelectionLayer.defaultProps = defaultProps;
