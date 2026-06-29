import { PolygonLayer, PathLayer, TextLayer, COORDINATE_SYSTEM, PathStyleExtension } from './deck.js';

// Target arrowhead size in screen pixels, converted to data-space at render time.
const ARROW_SCREEN_PX = 14;

// Text label styling — matches the annotation controller panel's MUI font stack.
const LABEL_FONT_FAMILY = '"Roboto", "Helvetica", "Arial", sans-serif';
const LABEL_FONT_WEIGHT = 'bold';
const LABEL_FONT_SIZE = 14;

// Parse an SVG-style dash string ("10 5", "10 20 30 10") into a [dash, gap] pair for
// deck.gl's PathStyleExtension. Returns null for "none" or invalid input.
// deck.gl only supports a 2-element array; we use the first two values of longer patterns.
function parseDashArray(strokeDashArray) {
  if (!strokeDashArray || strokeDashArray === 'none') return null;
  const nums = strokeDashArray.trim().split(/\s+/).map(Number).filter(n => !Number.isNaN(n) && n >= 0);
  return nums.length >= 2 ? [nums[0], nums[1]] : null;
}

function computeEllipsePolygon(cx, cy, rx, ry, numSegments = 64) {
  const pts = [];
  for (let i = 0; i < numSegments; i++) {
    const angle = (2 * Math.PI * i) / numSegments;
    pts.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
  }
  return pts;
}

/**
 * Build a deck.gl layer that previews the in-progress annotation shape while drawing.
 * @param {{ type: string, vertices: [number, number][] }} inProgress
 * @param {[number, number] | null} hoverCoord - current mouse position in data coords
 * @param {number[]} strokeColor - [r, g, b]
 */
export function createPreviewLayer(inProgress, hoverCoord, strokeColor = [255, 255, 0]) {
  if (!inProgress || inProgress.vertices.length === 0) return null;
  const { type, vertices } = inProgress;

  const base = { coordinateSystem: COORDINATE_SYSTEM.CARTESIAN };
  const previewColor = [...strokeColor, 160];
  const cursor = hoverCoord ?? vertices[vertices.length - 1];

  if (type === 'rectangle' && vertices.length === 1) {
    const [ax, ay] = vertices[0];
    const [bx, by] = cursor;
    const path = [[ax, ay], [bx, ay], [bx, by], [ax, by], [ax, ay]];
    return new PathLayer({
      ...base,
      id: 'annotation-preview-rectangle',
      data: [{ path }],
      getPath: d => d.path,
      getColor: previewColor,
      getWidth: 1,
      widthUnits: 'pixels',
      extensions: [new PathStyleExtension({ dash: true })],
      getDashArray: [8, 4],
    });
  }

  if (type === 'line' && vertices.length === 1) {
    const path = [vertices[0], cursor];
    return new PathLayer({
      ...base,
      id: 'annotation-preview-line',
      data: [{ path }],
      getPath: d => d.path,
      getColor: previewColor,
      getWidth: 1,
      widthUnits: 'pixels',
      extensions: [new PathStyleExtension({ dash: true })],
      getDashArray: [8, 4],
    });
  }

  if (type === 'ellipse' && vertices.length === 1) {
    const [cx, cy] = vertices[0];
    const [ex, ey] = cursor;
    const rx = Math.abs(ex - cx);
    const ry = Math.abs(ey - cy);
    if (rx < 1 && ry < 1) return null;
    const pts = computeEllipsePolygon(cx, cy, Math.max(rx, 1), Math.max(ry, 1));
    const path = [...pts, pts[0]];
    return new PathLayer({
      ...base,
      id: 'annotation-preview-ellipse',
      data: [{ path }],
      getPath: d => d.path,
      getColor: previewColor,
      getWidth: 1,
      widthUnits: 'pixels',
      extensions: [new PathStyleExtension({ dash: true })],
      getDashArray: [8, 4],
    });
  }

  if ((type === 'polygon' || type === 'polyline') && vertices.length >= 1) {
    const path = [...vertices, cursor];
    if (type === 'polygon' && vertices.length >= 2) path.push(vertices[0]);
    return new PathLayer({
      ...base,
      id: `annotation-preview-${type}`,
      data: [{ path }],
      getPath: d => d.path,
      getColor: previewColor,
      getWidth: 1,
      widthUnits: 'pixels',
      jointRounded: true,
      capRounded: true,
      extensions: [new PathStyleExtension({ dash: true })],
      getDashArray: [8, 4],
    });
  }

  return null;
}

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
 * @param {string|null} selectedShapeUid - UID of the shape to highlight (from editor selection).
 * @returns {object[]} Array of deck.gl layer instances.
 */
export function createAnnotationLayers(shapes, zoom = 0, selectedShapeUid = null) {
  // Selection halo — rendered first so the original shape draws on top of it.
  // Only the extra pixels outside the original stroke are visible, creating a subtle glow ring.
  const selectionLayers = [];
  if (selectedShapeUid) {
    const sel = shapes.find(s => s.uid === selectedShapeUid);
    if (sel) {
      const { uid: sUid, type: sType, strokeWidth: sStrokeWidth = 3 } = sel;
      const haloColor = [255, 220, 50, 70];
      const haloWidth = Math.max(sStrokeWidth + 8, 10);
      const base = { coordinateSystem: COORDINATE_SYSTEM.CARTESIAN };

      if (sType === 'rectangle') {
        const { x, y, width, height } = sel;
        selectionLayers.push(new PathLayer({
          ...base,
          id: `annotation-select-${sUid}`,
          data: [{ path: [[x, y], [x + width, y], [x + width, y + height], [x, y + height], [x, y]] }],
          getPath: d => d.path,
          getColor: haloColor,
          getWidth: haloWidth,
          widthUnits: 'pixels',
          jointRounded: true,
          capRounded: true,
        }));
      }
      if (sType === 'line') {
        const { x1, y1, x2, y2 } = sel;
        selectionLayers.push(new PathLayer({
          ...base,
          id: `annotation-select-${sUid}`,
          data: [{ path: [[x1, y1], [x2, y2]] }],
          getPath: d => d.path,
          getColor: haloColor,
          getWidth: haloWidth,
          widthUnits: 'pixels',
          capRounded: true,
        }));
      }
      if (sType === 'ellipse') {
        const polygon = computeEllipsePolygon(sel.x1, sel.y1, sel.radiusX, sel.radiusY);
        selectionLayers.push(new PathLayer({
          ...base,
          id: `annotation-select-${sUid}`,
          data: [{ path: [...polygon, polygon[0]] }],
          getPath: d => d.path,
          getColor: haloColor,
          getWidth: haloWidth,
          widthUnits: 'pixels',
          jointRounded: true,
        }));
      }
      if (sType === 'polygon' && sel.points?.length >= 3) {
        selectionLayers.push(new PathLayer({
          ...base,
          id: `annotation-select-${sUid}`,
          data: [{ path: [...sel.points, sel.points[0]] }],
          getPath: d => d.path,
          getColor: haloColor,
          getWidth: haloWidth,
          widthUnits: 'pixels',
          jointRounded: true,
        }));
      }
      if (sType === 'polyline' && sel.points?.length >= 2) {
        selectionLayers.push(new PathLayer({
          ...base,
          id: `annotation-select-${sUid}`,
          data: [{ path: sel.points }],
          getPath: d => d.path,
          getColor: haloColor,
          getWidth: haloWidth,
          widthUnits: 'pixels',
          jointRounded: true,
          capRounded: true,
        }));
      }
    }
  }

  const layers = [];

  shapes.forEach((shape, i) => {
    const {
      uid,
      type,
      strokeColor = [255, 255, 255],
      strokeWidth = 3,
      strokeDashArray,
    } = shape;
    // Arrowhead scales with stroke width: 4px per unit, floor at ARROW_SCREEN_PX.
    const arrowDataSize = Math.max(ARROW_SCREEN_PX, strokeWidth * 4) / Math.pow(2, zoom);
    const base = { coordinateSystem: COORDINATE_SYSTEM.CARTESIAN };
    const dashArray = parseDashArray(strokeDashArray);
    // Always include PathStyleExtension on outline PathLayers — adding/removing extensions
    // on a stable layer ID confuses deck.gl's reconciler. Use [0,0] for solid instead.
    const dashExt = [new PathStyleExtension({ dash: true })];
    const getDash = dashArray ?? [0, 0];

    if (type === 'rectangle') {
      const { x, y, width, height, fillColor = strokeColor, fillOpacity = 0 } = shape;
      const closedPath = [[x, y], [x + width, y], [x + width, y + height], [x, y + height], [x, y]];

      if (fillOpacity > 0) {
        layers.push(new PolygonLayer({
          ...base,
          id: `annotation-rect-fill-${uid}-${i}`,
          data: [{ polygon: [[x, y], [x + width, y], [x + width, y + height], [x, y + height]] }],
          getPolygon: d => d.polygon,
          stroked: false,
          filled: true,
          getFillColor: [...fillColor, Math.round(fillOpacity * 255)],
        }));
      }
      layers.push(new PathLayer({
        ...base,
        id: `annotation-rect-${uid}-${i}`,
        extensions: dashExt,
        getDashArray: getDash,
        data: [{ path: closedPath }],
        getPath: d => d.path,
        getColor: strokeColor,
        getWidth: strokeWidth,
        widthUnits: 'pixels',
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

      layers.push(new PathLayer({
        ...base,
        id: `annotation-line-${uid}-${i}`,
        extensions: [new PathStyleExtension({ dash: true })],
        getDashArray: dashArray ?? [0, 0],
        data: [{ path: [[srcX, srcY], [tgtX, tgtY]] }],
        getPath: d => d.path,
        getColor: strokeColor,
        getWidth: strokeWidth,
        widthUnits: 'pixels',
        capRounded: true,
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
        const pos = shape.textPosition ?? 'start';
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

    if (type === 'ellipse') {
      const { x1, y1, radiusX, radiusY, fillColor = strokeColor, fillOpacity = 0 } = shape;
      const polygon = computeEllipsePolygon(x1, y1, radiusX, radiusY);
      const closedPath = [...polygon, polygon[0]];

      if (fillOpacity > 0) {
        layers.push(new PolygonLayer({
          ...base,
          id: `annotation-ellipse-fill-${uid}-${i}`,
          data: [{ polygon }],
          getPolygon: d => d.polygon,
          stroked: false,
          filled: true,
          getFillColor: [...fillColor, Math.round(fillOpacity * 255)],
        }));
      }
      layers.push(new PathLayer({
        ...base,
        id: `annotation-ellipse-${uid}-${i}`,
        extensions: dashExt,
        getDashArray: getDash,
        data: [{ path: closedPath }],
        getPath: d => d.path,
        getColor: strokeColor,
        getWidth: strokeWidth,
        widthUnits: 'pixels',
        jointRounded: true,
      }));
      if (shape.text) {
        layers.push(new TextLayer({
          ...base,
          id: `annotation-ellipse-text-${uid}-${i}`,
          data: [{ position: [x1, y1 - radiusY], text: shape.text }],
          getPosition: d => d.position,
          getText: d => d.text,
          getColor: strokeColor,
          getSize: LABEL_FONT_SIZE,
          sizeUnits: 'pixels',
          fontFamily: LABEL_FONT_FAMILY,
          fontWeight: LABEL_FONT_WEIGHT,
          getPixelOffset: [0, -4],
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'bottom',
        }));
      }
    }

    if (type === 'polygon') {
      const { points, fillColor = strokeColor, fillOpacity = 0 } = shape;
      if (!points || points.length < 3) return;
      const closedPath = [...points, points[0]];

      if (fillOpacity > 0) {
        layers.push(new PolygonLayer({
          ...base,
          id: `annotation-polygon-fill-${uid}-${i}`,
          data: [{ polygon: points }],
          getPolygon: d => d.polygon,
          stroked: false,
          filled: true,
          getFillColor: [...fillColor, Math.round(fillOpacity * 255)],
        }));
      }
      layers.push(new PathLayer({
        ...base,
        id: `annotation-polygon-${uid}-${i}`,
        extensions: dashExt,
        getDashArray: getDash,
        data: [{ path: closedPath }],
        getPath: d => d.path,
        getColor: strokeColor,
        getWidth: strokeWidth,
        widthUnits: 'pixels',
        jointRounded: true,
      }));
      if (shape.text) {
        const minX = Math.min(...points.map(p => p[0]));
        const maxX = Math.max(...points.map(p => p[0]));
        const minY = Math.min(...points.map(p => p[1]));
        const topCenterX = (minX + maxX) / 2;
        layers.push(new TextLayer({
          ...base,
          id: `annotation-polygon-text-${uid}-${i}`,
          data: [{ position: [topCenterX, minY], text: shape.text }],
          getPosition: d => d.position,
          getText: d => d.text,
          getColor: strokeColor,
          getSize: LABEL_FONT_SIZE,
          sizeUnits: 'pixels',
          fontFamily: LABEL_FONT_FAMILY,
          fontWeight: LABEL_FONT_WEIGHT,
          getPixelOffset: [0, -4],
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'bottom',
        }));
      }
    }

    if (type === 'polyline') {
      const { points, markerStart, markerEnd } = shape;
      if (!points || points.length < 2) return;

      // Shorten the shaft at arrow endpoints so the stroke doesn't poke through the arrowhead tip.
      let pathPoints = points;
      if (markerStart === 'Arrow') {
        const [x0, y0] = points[0];
        const [x1, y1] = points[1];
        const dx = x0 - x1; const dy = y0 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          const ux = dx / len; const uy = dy / len;
          pathPoints = [[x0 - ux * arrowDataSize, y0 - uy * arrowDataSize], ...pathPoints.slice(1)];
        }
      }
      if (markerEnd === 'Arrow') {
        const last = pathPoints[pathPoints.length - 1];
        const prev = pathPoints[pathPoints.length - 2];
        const dx = last[0] - prev[0]; const dy = last[1] - prev[1];
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          const ux = dx / len; const uy = dy / len;
          pathPoints = [...pathPoints.slice(0, -1), [last[0] - ux * arrowDataSize, last[1] - uy * arrowDataSize]];
        }
      }

      layers.push(new PathLayer({
        ...base,
        id: `annotation-polyline-${uid}-${i}`,
        extensions: dashExt,
        getDashArray: getDash,
        data: [{ path: pathPoints }],
        getPath: d => d.path,
        getColor: strokeColor,
        getWidth: strokeWidth,
        widthUnits: 'pixels',
        jointRounded: true,
        capRounded: true,
      }));
      if (markerStart === 'Arrow') {
        const [x0, y0] = points[0];
        const [x1, y1] = points[1];
        const head = computeArrowhead(x0, y0, x0 - x1, y0 - y1, arrowDataSize);
        if (head) {
          layers.push(new PolygonLayer({
            ...base,
            id: `annotation-polyline-start-arrow-${uid}-${i}`,
            data: [{ polygon: head }],
            getPolygon: d => d.polygon,
            filled: true,
            stroked: false,
            getFillColor: strokeColor,
          }));
        }
      }
      if (markerEnd === 'Arrow') {
        const last = points[points.length - 1];
        const prev = points[points.length - 2];
        const head = computeArrowhead(last[0], last[1], last[0] - prev[0], last[1] - prev[1], arrowDataSize);
        if (head) {
          layers.push(new PolygonLayer({
            ...base,
            id: `annotation-polyline-end-arrow-${uid}-${i}`,
            data: [{ polygon: head }],
            getPolygon: d => d.polygon,
            filled: true,
            stroked: false,
            getFillColor: strokeColor,
          }));
        }
      }
      if (shape.text) {
        const pos = shape.textPosition ?? 'start';
        const bufferPx = shape.textBufferPx ?? 8;

        let textPt, dirX, dirY;
        if (pos === 'end') {
          const last = points[points.length - 1];
          const prev = points[points.length - 2];
          textPt = last;
          dirX = last[0] - prev[0];
          dirY = last[1] - prev[1];
        } else if (pos === 'middle') {
          const mx = points.reduce((s, p) => s + p[0], 0) / points.length;
          const my = points.reduce((s, p) => s + p[1], 0) / points.length;
          textPt = [mx, my];
          dirX = 0;
          dirY = 0;
        } else {
          textPt = points[0];
          dirX = points[0][0] - points[1][0];
          dirY = points[0][1] - points[1][1];
        }

        const [textX, textY] = textPt;
        const lenT = Math.sqrt(dirX * dirX + dirY * dirY);
        let polylinePixelOffset = [0, 0];
        let polylineTextAnchor = 'middle';
        let polylineAlignmentBaseline = pos === 'middle' ? 'center' : 'bottom';
        if (lenT > 0) {
          const uxT = dirX / lenT;
          const uyT = dirY / lenT;
          const offX = uxT * bufferPx;
          const offY = uyT * bufferPx;
          polylinePixelOffset = [offX, offY];
          if (Math.abs(offX) >= Math.abs(offY)) {
            polylineTextAnchor = offX > 0 ? 'start' : 'end';
          }
          if (Math.abs(offY) >= Math.abs(offX)) {
            polylineAlignmentBaseline = offY > 0 ? 'top' : 'bottom';
          }
        }
        layers.push(new TextLayer({
          ...base,
          id: `annotation-polyline-text-${uid}-${i}`,
          data: [{ position: [textX, textY], text: shape.text }],
          getPosition: d => d.position,
          getText: d => d.text,
          getColor: strokeColor,
          getSize: LABEL_FONT_SIZE,
          sizeUnits: 'pixels',
          fontFamily: LABEL_FONT_FAMILY,
          fontWeight: LABEL_FONT_WEIGHT,
          getPixelOffset: polylinePixelOffset,
          getTextAnchor: polylineTextAnchor,
          getAlignmentBaseline: polylineAlignmentBaseline,
        }));
      }
    }
  });

  return [...selectionLayers, ...layers];
}
