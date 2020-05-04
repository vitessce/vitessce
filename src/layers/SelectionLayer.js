/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
// File adopted from nebula.gl's SelectionLayer
// https://github.com/uber/nebula.gl/blob/8e9c2ec8d7cf4ca7050909ed826eb847d5e2cd9c/modules/layers/src/layers/selection-layer.js
import { CompositeLayer } from 'deck.gl';
import { polygon as turfPolygon, point as turfPoint } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { EditableGeoJsonLayer, SELECTION_TYPE } from 'nebula.gl';
import { DrawRectangleMode, DrawPolygonByDraggingMode, ViewMode } from '@nebula.gl/edit-modes';

// Customize the click handlers for the rectangle and polygon tools,
// so that clicking triggers the `onEdit` callback.
class ClickableDrawRectangleMode extends DrawRectangleMode {
  // eslint-disable-next-line class-methods-use-this
  handleClick(event, props) {
    props.onEdit(null);
  }
}

class ClickableDrawPolygonByDraggingMode extends DrawPolygonByDraggingMode {
  // eslint-disable-next-line class-methods-use-this
  handleClick(event, props) {
    props.onEdit(null);
  }
}

const MODE_MAP = {
  [SELECTION_TYPE.RECTANGLE]: ClickableDrawRectangleMode,
  [SELECTION_TYPE.POLYGON]: ClickableDrawPolygonByDraggingMode,
};

const defaultProps = {
  selectionType: SELECTION_TYPE.RECTANGLE,
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
  'getRadius',
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
  _selectRectangleObjects(coordinates) {
    const { layerIds, onSelect } = this.props;

    const [x1, y1] = this.context.viewport.project(coordinates[0][0]);
    const [x2, y2] = this.context.viewport.project(coordinates[0][2]);

    const pickingInfos = this.context.deck.pickObjects({
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
      layerIds,
    });

    onSelect({ pickingInfos });
  }

  _selectPolygonObjects(coordinates) {
    const { layerIds, onSelect, getCellCoords } = this.props;
    const mousePoints = coordinates[0].map(c => this.context.viewport.project(c));

    const allX = mousePoints.map(mousePoint => mousePoint[0]);
    const allY = mousePoints.map(mousePoint => mousePoint[1]);
    const x = Math.min(...allX);
    const y = Math.min(...allY);
    const maxX = Math.max(...allX);
    const maxY = Math.max(...allY);
    const rect = {
      x,
      y,
      width: maxX - x,
      height: maxY - y,
    };
    const polygon = turfPolygon(coordinates);
    const pickingInfos = this.context.deck.pickObjects({
      ...rect,
      layerIds,
    }).filter(info => booleanPointInPolygon(turfPoint(getCellCoords(info.object[1])), polygon));

    onSelect({ pickingInfos });
  }

  renderLayers() {
    const { onSelect } = this.props;
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
          onEdit: (event) => {
            if (!event) {
              // A null event was recieved,
              // so we want to select an empty array to clear any previous selection.
              onSelect({ pickingInfos: [] });
              return;
            }
            // The event was not null, so handle it normally.
            const { updatedData, editType } = event;
            if (editType === 'addFeature') {
              const { coordinates } = updatedData.features[0].geometry;

              if (this.props.selectionType === SELECTION_TYPE.RECTANGLE) {
                this._selectRectangleObjects(coordinates);
              } else if (this.props.selectionType === SELECTION_TYPE.POLYGON) {
                this._selectPolygonObjects(coordinates);
              }
            }
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
