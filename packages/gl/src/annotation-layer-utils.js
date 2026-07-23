import { PolygonLayer, PathLayer, TextLayer, ScatterplotLayer, COORDINATE_SYSTEM, PathStyleExtension } from './deck.js';

// Target arrowhead size in screen pixels, converted to data-space at render time.
const ARROW_SCREEN_PX = 14;

// Text label styling — matches the annotation controller panel's MUI font stack.
const LABEL_FONT_FAMILY = '"Roboto", "Helvetica", "Arial", sans-serif';
const LABEL_FONT_WEIGHT = 'bold';
const LABEL_FONT_SIZE = 14;
// Ratio-based thresholds relative to authored zoom: zoomRatio = 2^(currentZoom - authoredZoom).
// ratio=1 → exactly at authored zoom; ratio=0.5 → one stop zoomed out; etc.
const RATIO_CLUSTER = 0.10;    // below → clustered dots (~3.3 stops out)
const RATIO_DOT = 0.30;        // below → individual dots (~1.74 stops out)
const RATIO_GEO_FADE = 0.55;   // dot↔geometry crossfade zone top (~0.86 stops out)
const RATIO_TIPS = 0.70;       // above → arrow/tick caps visible (fades to 0 at RATIO_GEO_FADE)
const RATIO_LABEL = 0.55;      // labels start appearing (~0.86 stops out)
const RATIO_LABEL_FULL = 0.75; // labels reach full opacity (~0.42 stops out)

// Pick a background color that contrasts with the stroke color.
// Dark stroke (H&E / light images) → light bg; light stroke (fluorescence) → dark bg.
function textBgColor(strokeColor) {
  const [r, g, b] = strokeColor;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.45 ? [20, 20, 20, 210] : [245, 245, 245, 210];
}

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
 * Compute the two endpoints of a tick-cap (perpendicular crossbar) at (tipX, tipY).
 * dirX/dirY is the line direction (the tick is perpendicular to it).
 * Returns null if the direction vector is zero-length.
 */
export function computeTickCap(tipX, tipY, dirX, dirY, dataSize) {
  const len = Math.sqrt(dirX * dirX + dirY * dirY);
  if (len === 0) return null;
  const ux = dirX / len;
  const uy = dirY / len;
  // Perpendicular unit vector
  const px = -uy;
  const py = ux;
  const half = dataSize * 0.55;
  return [
    [tipX + px * half, tipY + py * half],
    [tipX - px * half, tipY - py * half],
  ];
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
// Insert thousand-separator commas for large integers (no locale API needed).
function fmtCommas(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getMeasurementLabel(shape, physicalPixelSize) {
  const pps = physicalPixelSize;
  const px = pps?.x ?? 1;
  const py = pps?.y ?? 1;
  // Replace µ / μ with u so deck.gl's default ASCII font atlas renders it.
  const unit = pps ? (pps.unit ?? '').replace(/[µμ]/g, 'u') : null;
  const hasPhys = !!pps;

  const fmtDist = d => hasPhys
    ? `${d.toFixed(2)} ${unit}`
    : `${d.toFixed(1)} px`;
  const fmtArea = a => hasPhys
    ? `${a.toFixed(2)} ${unit}^2`
    : `${fmtCommas(a)} px^2`;

  if (shape.type === 'line') {
    const dx = (shape.x2 ?? 0) - (shape.x1 ?? 0);
    const dy = (shape.y2 ?? 0) - (shape.y1 ?? 0);
    const dist = hasPhys
      ? Math.sqrt((dx * px) ** 2 + (dy * py) ** 2)
      : Math.sqrt(dx * dx + dy * dy);
    return fmtDist(dist);
  }
  if (shape.type === 'rectangle') {
    return fmtArea(hasPhys
      ? Math.abs(shape.width ?? 0) * px * Math.abs(shape.height ?? 0) * py
      : Math.abs((shape.width ?? 0) * (shape.height ?? 0)));
  }
  if (shape.type === 'ellipse') {
    const rx = Math.abs(shape.radiusX ?? 0);
    const ry = Math.abs(shape.radiusY ?? 0);
    return fmtArea(hasPhys ? Math.PI * rx * px * ry * py : Math.PI * rx * ry);
  }
  if (shape.type === 'polygon' && shape.points?.length >= 3) {
    const pts = shape.points;
    let shoelace = 0;
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      shoelace += (hasPhys ? ax * px : ax) * (hasPhys ? by * py : by)
        - (hasPhys ? bx * px : bx) * (hasPhys ? ay * py : ay);
    }
    return fmtArea(Math.abs(shoelace / 2));
  }
  if (shape.type === 'polyline' && shape.points?.length >= 2) {
    let total = 0;
    for (let i = 0; i < shape.points.length - 1; i++) {
      const [ax, ay] = shape.points[i];
      const [bx, by] = shape.points[i + 1];
      total += hasPhys
        ? Math.sqrt(((bx - ax) * px) ** 2 + ((by - ay) * py) ** 2)
        : Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
    }
    return fmtDist(total);
  }
  return null;
}

// Pick the perpendicular direction (unit vec) that points "below" the line (more +y in image coords).
function pickBelowPerp(ux, uy) {
  const rp = [uy, -ux];
  const lp = [-uy, ux];
  return (rp[1] > lp[1] || (rp[1] === lp[1] && rp[0] > lp[0])) ? rp : lp;
}

// Normalize angle (degrees) so text reads left-to-right, not upside-down.
function readableAngle(deg) {
  let a = deg;
  if (a > 90) a -= 180;
  if (a < -90) a += 180;
  return a;
}


function getShapeCentroid(shape) {
  if (shape.type === 'rectangle') {
    return [(shape.x ?? 0) + (shape.width ?? 0) / 2, (shape.y ?? 0) + (shape.height ?? 0) / 2];
  }
  if (shape.type === 'line') {
    return [((shape.x1 ?? 0) + (shape.x2 ?? 0)) / 2, ((shape.y1 ?? 0) + (shape.y2 ?? 0)) / 2];
  }
  if (shape.type === 'ellipse') {
    return [shape.x1 ?? 0, shape.y1 ?? 0];
  }
  if ((shape.type === 'polygon' || shape.type === 'polyline') && shape.points?.length >= 1) {
    const mx = shape.points.reduce((s, p) => s + p[0], 0) / shape.points.length;
    const my = shape.points.reduce((s, p) => s + p[1], 0) / shape.points.length;
    return [mx, my];
  }
  return [0, 0];
}

function computeClusters(shapeList, zoom, cellPx = 50) {
  // Snap to integer zoom stops so cluster membership is stable during continuous
  // scrolling — groups only change at discrete zoom-level crossings, not every frame.
  const cellSize = cellPx / Math.pow(2, Math.floor(zoom));
  const cells = new Map();
  shapeList.forEach(({ shape }) => {
    const [cx, cy] = getShapeCentroid(shape);
    const key = `${Math.floor(cx / cellSize)},${Math.floor(cy / cellSize)}`;
    if (!cells.has(key)) cells.set(key, { sumX: 0, sumY: 0, count: 0, color: shape.strokeColor ?? [255, 255, 255] });
    const c = cells.get(key);
    c.sumX += cx; c.sumY += cy; c.count++;
  });
  return Array.from(cells.values()).map(c => ({
    position: [c.sumX / c.count, c.sumY / c.count, 0],
    count: c.count,
    color: c.color,
  }));
}

export function createAnnotationLayers(shapes, zoom = 0, selectedShapeUid = null, physicalPixelSize = null, authoredZoom = null, semanticZoom = true) {
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
  const dotShapes = [];
  const clusterDotShapes = [];

  shapes.forEach((shape, i) => {
    const {
      uid,
      type,
      strokeColor = [255, 255, 255],
      strokeWidth = 3,
      strokeDashArray,
    } = shape;
    // LOD: compute geometry + label opacity, demote tiny shapes to dots.
    // Selected shapes always render at full detail regardless of zoom.
    const isSelected = uid === selectedShapeUid;
    let shapeOpacity = 1;
    let tipsOpacity = 1;
    let labelOpacity = 0;

    if (isSelected || !semanticZoom || authoredZoom === null) {
      // No LOD: selected shapes always render fully; LOD disabled; or no reference zoom available.
      tipsOpacity = 1;
      labelOpacity = 1;
    } else {
      // Ratio-based LOD relative to the frame's captured zoom.
      // ratio=1 → at authored zoom; <1 → zoomed out; >1 → zoomed in (always full detail).
      const zoomRatio = Math.pow(2, zoom - authoredZoom);
      if (zoomRatio < RATIO_CLUSTER) {
        clusterDotShapes.push({ shape });
        return;
      }
      if (zoomRatio < RATIO_DOT) {
        dotShapes.push({ shape, alpha: 200 });
        return;
      }
      if (zoomRatio < RATIO_GEO_FADE) {
        const t = (zoomRatio - RATIO_DOT) / (RATIO_GEO_FADE - RATIO_DOT);
        shapeOpacity = t;
        dotShapes.push({ shape, alpha: Math.round((1 - t) * 200) });
      }
      tipsOpacity = zoomRatio >= RATIO_TIPS
        ? shapeOpacity
        : Math.max(0, ((zoomRatio - RATIO_GEO_FADE) / (RATIO_TIPS - RATIO_GEO_FADE)) * shapeOpacity);
      if (zoomRatio >= RATIO_LABEL_FULL) {
        labelOpacity = shapeOpacity;
      } else if (zoomRatio >= RATIO_LABEL) {
        labelOpacity = ((zoomRatio - RATIO_LABEL) / (RATIO_LABEL_FULL - RATIO_LABEL)) * shapeOpacity;
      }
    }
    // Arrowhead scales with stroke width: 4px per unit, floor at ARROW_SCREEN_PX.
    const arrowDataSize = Math.max(ARROW_SCREEN_PX, strokeWidth * 4) / Math.pow(2, zoom);
    const base = { coordinateSystem: COORDINATE_SYSTEM.CARTESIAN, opacity: shapeOpacity };
    const tipsBase = { coordinateSystem: COORDINATE_SYSTEM.CARTESIAN, opacity: tipsOpacity };
    const labelBase = { coordinateSystem: COORDINATE_SYSTEM.CARTESIAN, opacity: labelOpacity };
    const labelBgProps = shape.labelBackground
      ? { background: true, getBackgroundColor: textBgColor(strokeColor), backgroundPadding: [3, 1, 3, 2] }
      : {};
    const labelProps = { ...labelBgProps };
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

      if (shape.text && labelOpacity > 0) {
        layers.push(new TextLayer({
          ...labelBase,
          ...labelProps,
          id: `annotation-rect-text-${uid}-${i}`,
          data: [{ position: [x, y], text: shape.text }],
          getPosition: d => d.position,
          getText: d => d.text,
          getColor: strokeColor,
          getSize: LABEL_FONT_SIZE,
          sizeUnits: 'pixels',
          fontFamily: LABEL_FONT_FAMILY,
          fontWeight: LABEL_FONT_WEIGHT,
          getPixelOffset: [3, -7],
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
      // Tick caps sit perpendicular at the endpoint so no shortening is needed.
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

      if (markerEnd === 'Arrow' && tipsOpacity > 0) {
        const head = computeArrowhead(x2, y2, x2 - x1, y2 - y1, arrowDataSize);
        if (head) {
          layers.push(new PolygonLayer({
            ...tipsBase,
            id: `annotation-end-arrow-${uid}-${i}`,
            data: [{ polygon: head }],
            getPolygon: d => d.polygon,
            filled: true,
            stroked: false,
            getFillColor: strokeColor,
          }));
        }
      }

      if (markerStart === 'Arrow' && tipsOpacity > 0) {
        const head = computeArrowhead(x1, y1, x1 - x2, y1 - y2, arrowDataSize);
        if (head) {
          layers.push(new PolygonLayer({
            ...tipsBase,
            id: `annotation-start-arrow-${uid}-${i}`,
            data: [{ polygon: head }],
            getPolygon: d => d.polygon,
            filled: true,
            stroked: false,
            getFillColor: strokeColor,
          }));
        }
      }

      if (markerEnd === 'Tick' && tipsOpacity > 0) {
        const tick = computeTickCap(x2, y2, x2 - x1, y2 - y1, arrowDataSize);
        if (tick) {
          layers.push(new PathLayer({
            ...tipsBase,
            id: `annotation-end-tick-${uid}-${i}`,
            data: [{ path: tick }],
            getPath: d => d.path,
            getColor: strokeColor,
            getWidth: strokeWidth,
            widthUnits: 'pixels',
            capRounded: true,
          }));
        }
      }

      if (markerStart === 'Tick' && tipsOpacity > 0) {
        const tick = computeTickCap(x1, y1, x1 - x2, y1 - y2, arrowDataSize);
        if (tick) {
          layers.push(new PathLayer({
            ...tipsBase,
            id: `annotation-start-tick-${uid}-${i}`,
            data: [{ path: tick }],
            getPath: d => d.path,
            getColor: strokeColor,
            getWidth: strokeWidth,
            widthUnits: 'pixels',
            capRounded: true,
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
        } else if (len > 0) {
          // Middle: float on the TOP side of the line, parallel to it (avoids conflicting with
          // the measurement label which sits on the bottom side).
          const belowPerp = pickBelowPerp(ux, uy);
          const bufferPx = shape.textBufferPx ?? 14;
          pixelOffset = [-belowPerp[0] * bufferPx, -belowPerp[1] * bufferPx];
          textAnchor = 'middle';
          alignmentBaseline = 'center';
        }

        const middleAngle = pos === 'middle' && len > 0
          ? -readableAngle(Math.atan2(dy, dx) * 180 / Math.PI)
          : null;

        if (labelOpacity <= 0) return;
        layers.push(new TextLayer({
          ...labelBase,
          ...labelProps,
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
          ...(middleAngle !== null && { getAngle: middleAngle }),
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
      if (shape.text && labelOpacity > 0) {
        layers.push(new TextLayer({
          ...labelBase,
          ...labelProps,
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
      if (shape.text && labelOpacity > 0) {
        const minX = Math.min(...points.map(p => p[0]));
        const maxX = Math.max(...points.map(p => p[0]));
        const minY = Math.min(...points.map(p => p[1]));
        const topCenterX = (minX + maxX) / 2;
        layers.push(new TextLayer({
          ...labelBase,
          ...labelProps,
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
      // Tick caps are perpendicular so no shortening needed for those.
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
      if (markerStart === 'Arrow' && tipsOpacity > 0) {
        const [x0, y0] = points[0];
        const [x1, y1] = points[1];
        const head = computeArrowhead(x0, y0, x0 - x1, y0 - y1, arrowDataSize);
        if (head) {
          layers.push(new PolygonLayer({
            ...tipsBase,
            id: `annotation-polyline-start-arrow-${uid}-${i}`,
            data: [{ polygon: head }],
            getPolygon: d => d.polygon,
            filled: true,
            stroked: false,
            getFillColor: strokeColor,
          }));
        }
      }
      if (markerEnd === 'Arrow' && tipsOpacity > 0) {
        const last = points[points.length - 1];
        const prev = points[points.length - 2];
        const head = computeArrowhead(last[0], last[1], last[0] - prev[0], last[1] - prev[1], arrowDataSize);
        if (head) {
          layers.push(new PolygonLayer({
            ...tipsBase,
            id: `annotation-polyline-end-arrow-${uid}-${i}`,
            data: [{ polygon: head }],
            getPolygon: d => d.polygon,
            filled: true,
            stroked: false,
            getFillColor: strokeColor,
          }));
        }
      }

      if (markerStart === 'Tick' && tipsOpacity > 0) {
        const [x0, y0] = points[0];
        const [x1, y1] = points[1];
        const tick = computeTickCap(x0, y0, x0 - x1, y0 - y1, arrowDataSize);
        if (tick) {
          layers.push(new PathLayer({
            ...tipsBase,
            id: `annotation-polyline-start-tick-${uid}-${i}`,
            data: [{ path: tick }],
            getPath: d => d.path,
            getColor: strokeColor,
            getWidth: strokeWidth,
            widthUnits: 'pixels',
            capRounded: true,
          }));
        }
      }

      if (markerEnd === 'Tick' && tipsOpacity > 0) {
        const last = points[points.length - 1];
        const prev = points[points.length - 2];
        const tick = computeTickCap(last[0], last[1], last[0] - prev[0], last[1] - prev[1], arrowDataSize);
        if (tick) {
          layers.push(new PathLayer({
            ...tipsBase,
            id: `annotation-polyline-end-tick-${uid}-${i}`,
            data: [{ path: tick }],
            getPath: d => d.path,
            getColor: strokeColor,
            getWidth: strokeWidth,
            widthUnits: 'pixels',
            capRounded: true,
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
        if (labelOpacity <= 0) return;
        layers.push(new TextLayer({
          ...labelBase,
          ...labelProps,
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

  if (dotShapes.length > 0) {
    layers.push(new ScatterplotLayer({
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      id: 'annotation-dots',
      data: dotShapes.map(({ shape: s, alpha }) => ({
        position: getShapeCentroid(s),
        color: [...(s.strokeColor ?? [255, 255, 255]), alpha],
      })),
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: 4,
      radiusUnits: 'pixels',
      filled: true,
      stroked: false,
    }));
  }

  if (clusterDotShapes.length > 0) {
    const clusters = computeClusters(clusterDotShapes, zoom);
    layers.push(new ScatterplotLayer({
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      id: 'annotation-clusters',
      data: clusters,
      getPosition: d => d.position,
      getFillColor: d => [...d.color, 180],
      getRadius: d => Math.max(6, 4 + Math.sqrt(d.count) * 2),
      radiusUnits: 'pixels',
      filled: true,
      stroked: true,
      getLineColor: d => [...d.color, 220],
      lineWidthMinPixels: 1.5,
    }));
    const multiClusters = clusters.filter(c => c.count > 1);
    if (multiClusters.length > 0) {
      layers.push(new TextLayer({
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        id: 'annotation-cluster-counts',
        data: multiClusters,
        getPosition: d => d.position,
        getText: d => String(d.count),
        getColor: [255, 255, 255],
        getSize: 10,
        sizeUnits: 'pixels',
        fontWeight: 'bold',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
      }));
    }
  }

  // Measurement labels for shapes with showMeasure: true
  const measureLayers = [];
  shapes.forEach((shape) => {
    if (!shape.showMeasure) return;
    const mIsSelected = shape.uid === selectedShapeUid;
    const label = getMeasurementLabel(shape, physicalPixelSize);
    if (!label) return;
    const color = shape.strokeColor ?? [255, 255, 255];
    let mShapeOpacity = 1;
    let mLabelFactor = 0;

    if (mIsSelected || !semanticZoom || authoredZoom === null) {
      mLabelFactor = 1;
    } else {
      const mZoomRatio = Math.pow(2, zoom - authoredZoom);
      if (mZoomRatio < RATIO_DOT) return;
      if (mZoomRatio < RATIO_GEO_FADE) {
        mShapeOpacity = (mZoomRatio - RATIO_DOT) / (RATIO_GEO_FADE - RATIO_DOT);
      }
      if (mZoomRatio >= RATIO_LABEL_FULL) {
        mLabelFactor = 1;
      } else if (mZoomRatio >= RATIO_LABEL) {
        mLabelFactor = (mZoomRatio - RATIO_LABEL) / (RATIO_LABEL_FULL - RATIO_LABEL);
      }
    }
    const measureOpacity = mShapeOpacity * mLabelFactor;
    if (measureOpacity <= 0) return;
    const base = {
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      opacity: measureOpacity,
      getText: d => d.text,
      getPosition: d => d.position,
      getColor: color,
      getSize: 13,
      sizeUnits: 'pixels',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      ...(shape.measureBackground ? { background: true, getBackgroundColor: textBgColor(color), backgroundPadding: [3, 1, 3, 2] } : {}),
    };

    if (shape.type === 'line') {
      const mx = ((shape.x1 ?? 0) + (shape.x2 ?? 0)) / 2;
      const my = ((shape.y1 ?? 0) + (shape.y2 ?? 0)) / 2;
      const dx = (shape.x2 ?? 0) - (shape.x1 ?? 0);
      const dy = (shape.y2 ?? 0) - (shape.y1 ?? 0);
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return;
      const perp = pickBelowPerp(dx / len, dy / len);
      const angle = readableAngle(Math.atan2(dy, dx) * 180 / Math.PI);
      measureLayers.push(new TextLayer({
        ...base,
        id: `annotation-measure-${shape.uid}`,
        data: [{ position: [mx, my], text: label }],
        getAngle: -angle,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        getPixelOffset: [perp[0] * 16, perp[1] * 16],
      }));
    } else if (shape.type === 'polyline' && shape.points?.length >= 2) {
      const pts = shape.points;
      const mi = Math.floor((pts.length - 1) / 2);
      const [ax, ay] = pts[mi];
      const [bx, by] = pts[mi + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return;
      const perp = pickBelowPerp(dx / len, dy / len);
      const angle = readableAngle(Math.atan2(dy, dx) * 180 / Math.PI);
      measureLayers.push(new TextLayer({
        ...base,
        id: `annotation-measure-${shape.uid}`,
        data: [{ position: [(ax + bx) / 2, (ay + by) / 2], text: label }],
        getAngle: -angle,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        getPixelOffset: [perp[0] * 16, perp[1] * 16],
      }));
    } else if (shape.type === 'rectangle') {
      // Bottom-right of the actual drawn rect (handles negative width/height)
      const x0 = shape.x ?? 0;
      const y0 = shape.y ?? 0;
      const w = shape.width ?? 0;
      const h = shape.height ?? 0;
      const rx = x0 + (w >= 0 ? w : 0);
      const ry = y0 + (h >= 0 ? h : 0);
      measureLayers.push(new TextLayer({
        ...base,
        id: `annotation-measure-${shape.uid}`,
        data: [{ position: [rx, ry], text: label }],
        getTextAnchor: 'end',
        getAlignmentBaseline: 'bottom',
        getPixelOffset: [-6, -6],
      }));
    } else if (shape.type === 'ellipse') {
      // Just outside the bottom of the ellipse
      const cx = shape.x1 ?? 0;
      const cy = shape.y1 ?? 0;
      const ry = Math.abs(shape.radiusY ?? 0);
      measureLayers.push(new TextLayer({
        ...base,
        id: `annotation-measure-${shape.uid}`,
        data: [{ position: [cx, cy + ry], text: label }],
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'top',
        getPixelOffset: [0, 8],
      }));
    } else if (shape.type === 'polygon' && shape.points?.length >= 3) {
      // Just outside the bottom edge of the bounding box
      const xs = shape.points.map(p => p[0]);
      const ys = shape.points.map(p => p[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const maxY = Math.max(...ys);
      measureLayers.push(new TextLayer({
        ...base,
        id: `annotation-measure-${shape.uid}`,
        data: [{ position: [cx, maxY], text: label }],
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'top',
        getPixelOffset: [0, 8],
      }));
    }
  });

  return [...selectionLayers, ...layers, ...measureLayers];
}
