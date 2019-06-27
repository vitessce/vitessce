/* eslint-disable no-underscore-dangle */
// File adopted from nebula.gl's SelectionLayer
// https://github.com/uber/nebula.gl/blob/8e9c2ec8d7cf4ca7050909ed826eb847d5e2cd9c/modules/layers/src/layers/selection-layer.js
import { CompositeLayer } from 'deck.gl';
import { polygon as turfPolygon, point as turfPoint } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

import { EditableGeoJsonLayer, SELECTION_TYPE } from 'nebula.gl';

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
    const mode = {
      [SELECTION_TYPE.RECTANGLE]: 'drawRectangle',
      [SELECTION_TYPE.POLYGON]: 'drawPolygon',
    }[this.props.selectionType] || 'view';

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
          selectedFeatureIndexes: [],
          data: EMPTY_DATA,
          onEdit: ({ updatedData, editType }) => {
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
