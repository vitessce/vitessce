import { PolygonLayer, LineLayer, TextLayer, COORDINATE_SYSTEM } from './deck.js';

// Target arrowhead size in screen pixels, converted to data-space at render time.
const ARROW_SCREEN_PX = 14;

// Text label styling — matches the annotation controller panel's MUI font stack.
const LABEL_FONT_FAMILY = '"Roboto", "Helvetica", "Arial", sans-serif';
const LABEL_FONT_WEIGHT = 'bold';
const LABEL_FONT_SIZE = 14;

/**
 * Compute the three vertices of an arrowhead triangle pointing in the direction (dirX, dirY).
 * The tip is at (tipX, tipY). dataSize controls the triangle's height in data units.
 * Returns null if the direction vector is zero-length.
 */
export function computeArrowhead(tipX, tipY, dirX, dirY, dataSize) {
  const len = Math.sqrt(dirX * dirX + dirY * dirY);
  if (len === 0) return null;
  const ux = dirX / len;
  const uy = dirY / len;
  const px = -uy;
  const py = ux;
  const halfBase = dataSize * 0.4;
  const bx = tipX - ux * dataSize;
  const by = tipY - uy * dataSize;
  return [
    [tipX, tipY],
    [bx + px * halfBase, by + py * halfBase],
    [bx - px * halfBase, by - py * halfBase],
  ];
}

/**
 * Convert an array of annotation shape objects into deck.gl layers.
 * Works for any CARTESIAN coordinate system view (spatial images, embedding scatterplots).
 *
 * @param {object[]} shapes - Filtered shapes for this view (already targetView-matched).
 * @param {number} zoom - Current view zoom level, keeps arrowheads a fixed screen size.
 * @returns {object[]} Array of deck.gl layer instances.
 */
export function createAnnotationLayers(shapes, zoom = 0) {
  const layers = [];

  shapes.forEach((shape, i) => {
    const {
      uid,
      type,
      strokeColor = [255, 255, 255],
      strokeWidth = 1,
    } = shape;
    // Arrowhead scales with stroke width: 4px per unit, floor at ARROW_SCREEN_PX.
    const arrowDataSize = Math.max(ARROW_SCREEN_PX, strokeWidth * 4) / Math.pow(2, zoom);
    const base = { coordinateSystem: COORDINATE_SYSTEM.CARTESIAN };

    if (type === 'rectangle') {
      const {
        x, y, width, height,
        fillColor = strokeColor,
        fillOpacity = 0,
      } = shape;
      const polygon = [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
      ];
      layers.push(new PolygonLayer({
        ...base,
        id: `annotation-rect-${uid}-${i}`,
        data: [{ polygon }],
        getPolygon: d => d.polygon,
        stroked: true,
        filled: fillOpacity > 0,
        getLineColor: strokeColor,
        getLineWidth: strokeWidth,
        lineWidthUnits: 'pixels',
        getFillColor: [...fillColor, Math.round(fillOpacity * 255)],
      }));

      if (shape.text) {
        layers.push(new TextLayer({
          ...base,
          id: `annotation-rect-text-${uid}-${i}`,
          data: [{ position: [x, y], text: shape.text }],
          getPosition: d => d.position,
          getText: d => d.text,
          getColor: strokeColor,
          getSize: LABEL_FONT_SIZE,
          sizeUnits: 'pixels',
          fontFamily: LABEL_FONT_FAMILY,
          fontWeight: LABEL_FONT_WEIGHT,
          getTextAnchor: 'start',
          getAlignmentBaseline: 'bottom',
        }));
      }
    }

    if (type === 'line') {
      const { x1, y1, x2, y2, markerStart, markerEnd } = shape;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = len > 0 ? dx / len : 0;
      const uy = len > 0 ? dy / len : 0;

      // Shorten the shaft so it meets the arrowhead base, not the tip,
      // preventing the line width from poking through the pointed arrowhead.
      const srcX = markerStart === 'Arrow' ? x1 + ux * arrowDataSize : x1;
      const srcY = markerStart === 'Arrow' ? y1 + uy * arrowDataSize : y1;
      const tgtX = markerEnd === 'Arrow' ? x2 - ux * arrowDataSize : x2;
      const tgtY = markerEnd === 'Arrow' ? y2 - uy * arrowDataSize : y2;

      layers.push(new LineLayer({
        ...base,
        id: `annotation-line-${uid}-${i}`,
        data: [{ source: [srcX, srcY], target: [tgtX, tgtY] }],
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getColor: strokeColor,
        getWidth: strokeWidth,
        widthUnits: 'pixels',
      }));

      if (markerEnd === 'Arrow') {
        const head = computeArrowhead(x2, y2, x2 - x1, y2 - y1, arrowDataSize);
        if (head) {
          layers.push(new PolygonLayer({
            ...base,
            id: `annotation-end-arrow-${uid}-${i}`,
            data: [{ polygon: head }],
            getPolygon: d => d.polygon,
            filled: true,
            stroked: false,
            getFillColor: strokeColor,
          }));
        }
      }

      if (markerStart === 'Arrow') {
        const head = computeArrowhead(x1, y1, x1 - x2, y1 - y2, arrowDataSize);
        if (head) {
          layers.push(new PolygonLayer({
            ...base,
            id: `annotation-start-arrow-${uid}-${i}`,
            data: [{ polygon: head }],
            getPolygon: d => d.polygon,
            filled: true,
            stroked: false,
            getFillColor: strokeColor,
          }));
        }
      }

      if (shape.text) {
        const pos = shape.textPosition ?? 'middle';
        const textX = pos === 'start' ? x1 : pos === 'end' ? x2 : (x1 + x2) / 2;
        const textY = pos === 'start' ? y1 : pos === 'end' ? y2 : (y1 + y2) / 2;

        let pixelOffset = [0, 0];
        let textAnchor = 'middle';
        let alignmentBaseline = 'center';

        if (pos !== 'middle') {
          const dxT = x2 - x1;
          const dyT = y2 - y1;
          const lenT = Math.sqrt(dxT * dxT + dyT * dyT);
          if (lenT > 0) {
            const uxT = dxT / lenT;
            const uyT = dyT / lenT;
            const sign = pos === 'start' ? -1 : 1;
            const bufferPx = shape.textBufferPx ?? 8;
            const offsetX = sign * uxT * bufferPx;
            const offsetY = sign * uyT * bufferPx;
            pixelOffset = [offsetX, offsetY];

            // Derive text anchor from the dominant offset direction so the label
            // extends AWAY from the line rather than back toward it.
            // Horizontal dominant → anchor by X edge; vertical dominant → anchor by Y baseline.
            const absX = Math.abs(offsetX);
            const absY = Math.abs(offsetY);
            if (absX >= absY) {
              textAnchor = offsetX > 0 ? 'start' : 'end';
            }
            if (absY >= absX) {
              alignmentBaseline = offsetY > 0 ? 'top' : 'bottom';
            }
          }
        }

        layers.push(new TextLayer({
          ...base,
          id: `annotation-line-text-${uid}-${i}`,
          data: [{ position: [textX, textY], text: shape.text }],
          getPosition: d => d.position,
          getText: d => d.text,
          getColor: strokeColor,
          getSize: LABEL_FONT_SIZE,
          sizeUnits: 'pixels',
          fontFamily: LABEL_FONT_FAMILY,
          fontWeight: LABEL_FONT_WEIGHT,
          getPixelOffset: pixelOffset,
          getTextAnchor: textAnchor,
          getAlignmentBaseline: alignmentBaseline,
        }));
      }
    }
  });

  return layers;
}
