// These are methods that the community visualization hub can use
// to display UIs related to annotation of Vitessce configs.
import { ViewType, CoordinationType } from '@vitessce/constants-internal';

// The grid of views is 12 columns by 12 rows.
const NUM_GRID_COLUMNS = 12;
const NUM_GRID_ROWS = 12;
const DEFAULT_ANNOTATION_CONTROLLER_UID = 'annotation-controller';
const DEFAULT_ANNOTATION_CONTROLLER_WIDTH = 3;

/**
 * Detect whether an annotationController view already exists in a view config.
 * @param {object} config A view config object (JSON).
 * @returns {boolean} True if the layout contains an annotationController view.
 */
export function hasAnnotationControllerView(config) {
  return (config?.layout || []).some(
    view => view.component === ViewType.ANNOTATION_CONTROLLER,
  );
}

/**
 * Get a view uid that is not already used by a view in the layout.
 * @param {object[]} layout The layout array.
 * @param {string} baseUid The preferred uid.
 * @returns {string} A unique uid.
 */
function getUniqueViewUid(layout, baseUid) {
  const usedUids = new Set(layout.map(view => view.uid).filter(Boolean));
  if (!usedUids.has(baseUid)) {
    return baseUid;
  }
  let i = 1;
  while (usedUids.has(`${baseUid}-${i}`)) {
    i += 1;
  }
  return `${baseUid}-${i}`;
}

/**
 * Get the coordination scope that existing views use for a coordination type,
 * so that the annotationController is linked to the same annotation story state.
 * @param {object[]} layout The layout array.
 * @param {string} coordinationType The coordination type.
 * @returns {string|undefined} The first scope found, if any.
 */
function getExistingScope(layout, coordinationType) {
  const scope = layout
    .map(view => view.coordinationScopes?.[coordinationType])
    .find(s => typeof s === 'string');
  return scope;
}

/**
 * Append an annotationController view to a view config.
 * The annotationController is placed in a full-height column on the right side of the grid,
 * and the existing views are scaled horizontally to fit into the remaining columns.
 * The left and right edges of each view (rather than widths) are rounded to whole columns,
 * so that views which were adjacent remain adjacent (no gaps or overlaps are introduced).
 * The input config is not modified.
 * @param {object} config A view config object (JSON).
 * @param {object} options
 * @param {number} options.width The width (in grid columns) of the annotationController.
 * @param {string} options.uid The preferred uid for the annotationController view.
 * @returns {object} The new view config.
 */
export function addAnnotationControllerView(config, options = {}) {
  const {
    width = DEFAULT_ANNOTATION_CONTROLLER_WIDTH,
    uid = DEFAULT_ANNOTATION_CONTROLLER_UID,
  } = options;
  if (!Number.isInteger(width) || width < 1 || width >= NUM_GRID_COLUMNS) {
    throw new Error(`The annotationController width must be a whole number between 1 and ${NUM_GRID_COLUMNS - 1}.`);
  }
  const layout = config?.layout || [];
  const remainingColumns = NUM_GRID_COLUMNS - width;
  const scaleX = value => Math.round(
    (Math.min(Math.max(value, 0), NUM_GRID_COLUMNS) * remainingColumns) / NUM_GRID_COLUMNS,
  );

  const newLayout = layout.map((view) => {
    const x = scaleX(view.x);
    // Ensure every view keeps a width of at least one column.
    const right = Math.max(scaleX(view.x + view.w), x + 1);
    return {
      ...view,
      x: Math.min(x, remainingColumns - 1),
      w: Math.min(right, remainingColumns) - Math.min(x, remainingColumns - 1),
    };
  });

  const coordinationScopes = Object.fromEntries(
    [
      CoordinationType.ANNOTATION_STORY,
      CoordinationType.ANNOTATION_FRAME_INDEX,
      CoordinationType.ANNOTATION_OVERLAY_VISIBLE,
    ]
      .map(coordinationType => ([coordinationType, getExistingScope(layout, coordinationType)]))
      .filter(([, scope]) => scope !== undefined),
  );

  newLayout.push({
    uid: getUniqueViewUid(layout, uid),
    component: ViewType.ANNOTATION_CONTROLLER,
    ...(Object.keys(coordinationScopes).length > 0 ? { coordinationScopes } : {}),
    x: remainingColumns,
    y: 0,
    w: width,
    h: NUM_GRID_ROWS,
  });

  return {
    ...config,
    layout: newLayout,
  };
}
