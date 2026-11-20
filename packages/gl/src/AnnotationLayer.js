import { CompositeLayer } from '@deck.gl/core';
import { ViewType } from '@vitessce/constants-internal';
import { createAnnotationLayers, createPreviewLayer } from './annotation-layer-utils.js';

const defaultProps = {
  // Array of annotation shape objects (see annotationShapeObj in @vitessce/schemas).
  data: { type: 'object', value: [], compare: true },
  // UID of the shape to highlight with a selection halo.
  selectedShapeUid: { type: 'string', value: null },
  // { x, y, unit } used to format measurement labels in physical units.
  physicalPixelSize: { type: 'object', value: null, compare: true },
  // The zoom level at which the shapes were authored (reference for semantic zoom).
  authoredZoom: { type: 'number', value: null },
  // Whether to apply semantic zoom (level-of-detail) based on authoredZoom.
  semanticZoom: { type: 'boolean', value: true },
  // The view type in which the layer is rendered (affects measurement label formatting).
  viewType: { type: 'string', value: ViewType.SPATIAL },
  // In-progress shape being drawn, as { type, vertices }.
  inProgressShape: { type: 'object', value: null, compare: true },
  // Current mouse position (in data coordinates) while drawing.
  hoverCoord: { type: 'array', value: null, compare: true },
  // Stroke color [r, g, b] of the in-progress shape preview.
  previewStrokeColor: { type: 'color', value: [255, 255, 0] },
};

/**
 * A composite layer that renders annotation shapes
 * (rectangles, lines, ellipses, polygons, polylines),
 * along with their text labels, measurement labels,
 * selection halo, semantic-zoom dots/clusters,
 * and an optional preview of an in-progress shape.
 */
export default class AnnotationLayer extends CompositeLayer {
  // The semantic zoom and arrowhead sizes depend on the current zoom level,
  // so the sublayers must also be re-rendered when the viewport changes.
  // eslint-disable-next-line class-methods-use-this
  shouldUpdateState({ changeFlags }) {
    return changeFlags.propsOrDataChanged || changeFlags.viewportChanged;
  }

  /**
   * Prefix the sublayer ID with this layer's ID (so that multiple
   * AnnotationLayers can co-exist), and combine this layer's
   * opacity with the per-shape opacity of the sublayer.
   * Note: we avoid getSubLayerProps here, since it would
   * overwrite the sublayer extensions (e.g., PathStyleExtension)
   * and opacity values.
   * @param {object} layer A DeckGL layer instance.
   * @returns {object} The cloned layer instance.
   */
  wrapSubLayer(layer) {
    const { id, opacity, pickable, visible } = this.props;
    return layer.clone({
      id: `${id}-${layer.id}`,
      opacity: layer.props.opacity * opacity,
      pickable,
      visible,
    });
  }

  renderLayers() {
    const {
      data,
      selectedShapeUid,
      physicalPixelSize,
      authoredZoom,
      semanticZoom,
      viewType,
      inProgressShape,
      hoverCoord,
      previewStrokeColor,
    } = this.props;
    const zoom = this.context.viewport?.zoom ?? 0;
    const visibleShapes = (data ?? []).filter(shape => shape.visible !== false);

    const annotationLayers = createAnnotationLayers(
      visibleShapes, zoom, selectedShapeUid, physicalPixelSize,
      authoredZoom, semanticZoom, viewType,
    );
    const previewLayer = createPreviewLayer(
      inProgressShape, hoverCoord, previewStrokeColor.slice(0, 3),
    );

    return [
      ...annotationLayers,
      ...(previewLayer ? [previewLayer] : []),
    ].map(layer => this.wrapSubLayer(layer));
  }
}
AnnotationLayer.layerName = 'AnnotationLayer';
AnnotationLayer.defaultProps = defaultProps;
