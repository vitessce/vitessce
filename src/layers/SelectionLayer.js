/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
// File adopted from nebula.gl's SelectionLayer
// https://github.com/uber/nebula.gl/blob/8e9c2ec8d7cf4ca7050909ed826eb847d5e2cd9c/modules/layers/src/layers/selection-layer.js
import { CompositeLayer } from 'deck.gl';
import { polygon as turfPolygon, point as turfPoint } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import bboxPolygon from '@turf/bbox-polygon';
import { EditableGeoJsonLayer, SELECTION_TYPE } from 'nebula.gl';
import { ModeHandler } from '@nebula.gl/layers/dist/mode-handlers/mode-handler';
import { ViewHandler } from '@nebula.gl/layers/dist/mode-handlers/view-handler';
import { ModifyHandler } from '@nebula.gl/layers/dist/mode-handlers/modify-handler';
import { ElevationHandler } from '@nebula.gl/layers/dist/mode-handlers/elevation-handler';
import { ExtrudeHandler } from '@nebula.gl/layers/dist/mode-handlers/extrude-handler';
import { RotateHandler } from '@nebula.gl/layers/dist/mode-handlers/rotate-handler';
import { SnappableHandler } from '@nebula.gl/layers/dist/mode-handlers/snappable-handler';
import { TranslateHandler } from '@nebula.gl/layers/dist/mode-handlers/translate-handler';
import { DuplicateHandler } from '@nebula.gl/layers/dist/mode-handlers/duplicate-handler';
import { ScaleHandler } from '@nebula.gl/layers/dist/mode-handlers/scale-handler';
import { DrawPointHandler } from '@nebula.gl/layers/dist/mode-handlers/draw-point-handler';
import { DrawLineStringHandler } from '@nebula.gl/layers/dist/mode-handlers/draw-line-string-handler';
import { DrawPolygonHandler } from '@nebula.gl/layers/dist/mode-handlers/draw-polygon-handler';
import { Draw90DegreePolygonHandler } from '@nebula.gl/layers/dist/mode-handlers/draw-90degree-polygon-handler';
import { SplitPolygonHandler } from '@nebula.gl/layers/dist/mode-handlers/split-polygon-handler';
import { DrawRectangleUsingThreePointsHandler } from '@nebula.gl/layers/dist/mode-handlers/draw-rectangle-using-three-points-handler';
import { DrawCircleFromCenterHandler } from '@nebula.gl/layers/dist/mode-handlers/draw-circle-from-center-handler';
import { DrawCircleByBoundingBoxHandler } from '@nebula.gl/layers/dist/mode-handlers/draw-circle-by-bounding-box-handler';
import { DrawEllipseByBoundingBoxHandler } from '@nebula.gl/layers/dist/mode-handlers/draw-ellipse-by-bounding-box-handler';
import { DrawEllipseUsingThreePointsHandler } from '@nebula.gl/layers/dist/mode-handlers/draw-ellipse-using-three-points-handler';

class DrawRectangleByDraggingHandler extends ModeHandler {
  constructor() {
    super();
    this.corner1 = undefined;
    this.isDragging = false;
  }

  handleStartDragging(event) {
    const result = { editAction: null, cancelMapPan: false };
    this.isDragging = true;
    const corner1 = event.groundCoords;
    const corner2 = event.groundCoords;
    this._setTentativeFeature(bboxPolygon([corner1[0], corner1[1], corner2[0], corner2[1]]));
    this.corner1 = corner1;
    return result;
  }

  handlePointerMove(event) {
    const result = { editAction: null, cancelMapPan: false };
    const { isDragging, corner1 } = this;

    if (!isDragging || !corner1) {
      // nothing to do yet
      return result;
    }

    const corner2 = event.groundCoords;
    this._setTentativeFeature(bboxPolygon([corner1[0], corner1[1], corner2[0], corner2[1]]));
    return result;
  }

  handleStopDraggingOrClick(event) {
    const result = { editAction: null, cancelMapPan: false };
    const { isDragging, corner1 } = this;

    if (!isDragging || !corner1) {
      // nothing to do yet
      return result;
    }

    const corner2 = event.groundCoords;
    this._setTentativeFeature(bboxPolygon([corner1[0], corner1[1], corner2[0], corner2[1]]));
    const tentativeFeature = this.getTentativeFeature();
    const editAction = this.getAddFeatureOrBooleanPolygonAction(tentativeFeature.geometry);
    this._setTentativeFeature(null);
    this.corner1 = undefined;
    this.isDragging = false;
    return editAction;
  }

  handleStopDragging(event) {
    return this.handleStopDraggingOrClick(event);
  }

  handleClick(event) {
    return this.handleStopDraggingOrClick(event);
  }
}

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
    const mode = {
      [SELECTION_TYPE.RECTANGLE]: 'drawRectangle',
      [SELECTION_TYPE.POLYGON]: 'drawPolygon',
    }[this.props.selectionType] || 'view';

    const inheritedProps = {
      // Need to instantiate our own mode handler objects each time, otherwise
      // they will be singletons and shared across all EditableGeoJsonLayer instances.
      // See the following line for more details:
      // https://github.com/uber/nebula.gl/blob/7a88b5240e4bea4e7d4530c0885d595e730146a3/modules/layers/src/layers/editable-geojson-layer.js#L147
      modeHandlers: {
        view: new ViewHandler(),
        modify: new ModifyHandler(),
        elevation: new ElevationHandler(),
        extrude: new ExtrudeHandler(),
        rotate: new RotateHandler(),
        translate: new SnappableHandler(new TranslateHandler()),
        duplicate: new DuplicateHandler(),
        scale: new ScaleHandler(),
        drawPoint: new DrawPointHandler(),
        drawLineString: new DrawLineStringHandler(),
        drawPolygon: new DrawPolygonHandler(),
        draw90DegreePolygon: new Draw90DegreePolygonHandler(),
        split: new SplitPolygonHandler(),
        drawRectangle: new DrawRectangleByDraggingHandler(),
        drawRectangleUsing3Points: new DrawRectangleUsingThreePointsHandler(),
        drawCircleFromCenter: new DrawCircleFromCenterHandler(),
        drawCircleByBoundingBox: new DrawCircleByBoundingBoxHandler(),
        drawEllipseByBoundingBox: new DrawEllipseByBoundingBoxHandler(),
        drawEllipseUsing3Points: new DrawEllipseUsingThreePointsHandler(),
      },
    };
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
