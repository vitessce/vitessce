// These are methods that the community visualization hub can use
// to display UIs related to annotation of Vitessce configs.
import {
  ViewType,
  CoordinationType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';

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
 * Only single (string) scope mappings are considered; array-valued mappings are ignored.
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
 * Get the height of the tallest column of views in the layout,
 * i.e., the maximum bottom edge (y + h) of any view.
 * Falls back to the full grid height if the layout has no views with valid dimensions.
 * @param {object[]} layout The layout array.
 * @returns {number} The height in grid rows.
 */
function getMaxColumnHeight(layout) {
  const bottoms = layout
    .map(view => view.y + view.h)
    .filter(bottom => Number.isFinite(bottom) && bottom >= 1);
  return bottoms.length > 0 ? Math.max(...bottoms) : NUM_GRID_ROWS;
}

/**
 * Append an annotationController view to a view config.
 * The annotationController is placed in a column on the right side of the grid,
 * with a height equal to that of the tallest column of existing views,
 * and the existing views are scaled horizontally to fit into the remaining columns.
 * The left and right edges of each view (rather than widths) are rounded to whole columns,
 * so that views which were adjacent remain adjacent (no gaps or overlaps are introduced).
 * If existing views are mapped to annotationStory, annotationFrameIndex, or
 * annotationOverlayVisible coordination scopes, the annotationController
 * is mapped to the same scopes.
 * The input config is not modified.
 * @param {object} config A view config object (JSON).
 * @param {object} [options] Optional parameters.
 * @param {number} [options.width=3] The width (in grid columns) of the annotationController.
 * Must be a whole number between 1 and 11.
 * @param {string} [options.uid='annotation-controller'] The preferred uid for the
 * annotationController view. If this uid is already used by another view,
 * a numeric suffix is appended (e.g., 'annotation-controller-1').
 * @param {boolean} [options.closeButtonVisible] The value of the new view's
 * props.closeButtonVisible. If not provided, props.closeButtonVisible
 * is not defined for the new view (i.e., the view's default is used).
 * @returns {object} The new view config.
 * @throws {Error} If options.width is not a whole number between 1 and 11.
 */
export function addAnnotationControllerView(config, options = {}) {
  const {
    width = DEFAULT_ANNOTATION_CONTROLLER_WIDTH,
    uid = DEFAULT_ANNOTATION_CONTROLLER_UID,
    closeButtonVisible,
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
    ...(closeButtonVisible !== undefined ? { props: { closeButtonVisible } } : {}),
    x: remainingColumns,
    y: 0,
    w: width,
    h: getMaxColumnHeight(layout),
  });

  return {
    ...config,
    layout: newLayout,
  };
}

/**
 * Remove all annotationController views from a view config.
 * The remaining views are scaled horizontally to take up all of the available
 * horizontal space: grid columns that are no longer occupied by any view
 * (e.g., the column previously occupied by the annotationController) are removed,
 * and the views are stretched to fill the full width of the grid.
 * The left and right edges of each view (rather than widths) are rounded to whole columns,
 * so that views which were adjacent remain adjacent (no gaps or overlaps are introduced).
 * Coordination scopes and values are not modified.
 * The input config is not modified.
 * @param {object} config A view config object (JSON).
 * @returns {object} The new view config.
 */
export function removeAnnotationControllerView(config) {
  const layout = (config?.layout || [])
    .filter(view => view.component !== ViewType.ANNOTATION_CONTROLLER);
  const clampX = value => Math.min(Math.max(value, 0), NUM_GRID_COLUMNS);

  // Determine which grid columns are occupied by at least one of the remaining views.
  const isColumnOccupied = Array.from(
    { length: NUM_GRID_COLUMNS },
    (_, col) => layout.some(view => clampX(view.x) <= col && col < clampX(view.x + view.w)),
  );
  const numOccupiedColumns = isColumnOccupied.filter(Boolean).length;
  if (numOccupiedColumns === 0) {
    return {
      ...config,
      layout,
    };
  }

  // Map an edge position to its position after removing unoccupied columns,
  // and then stretch to the full width of the grid.
  const scaleX = (value) => {
    const edge = clampX(value);
    const numOccupiedBefore = isColumnOccupied.filter((isOccupied, col) => isOccupied && col < edge)
      .length;
    return Math.round((numOccupiedBefore * NUM_GRID_COLUMNS) / numOccupiedColumns);
  };

  const newLayout = layout.map((view) => {
    const x = Math.min(scaleX(view.x), NUM_GRID_COLUMNS - 1);
    // Ensure every view keeps a width of at least one column.
    const right = Math.min(Math.max(scaleX(view.x + view.w), x + 1), NUM_GRID_COLUMNS);
    return {
      ...view,
      x,
      w: right - x,
    };
  });

  return {
    ...config,
    layout: newLayout,
  };
}

/**
 * Detect whether a view config contains a non-empty annotation story,
 * i.e., whether any annotationStory coordination value contains at least one frame
 * (in any coordination scope, or defined directly by any view).
 * @param {object} config A view config object (JSON).
 * @returns {boolean} True if any annotationStory value is non-empty.
 */
export function hasAnyAnnotationStory(config) {
  const type = CoordinationType.ANNOTATION_STORY;
  const scopeValues = Object.values(config?.coordinationSpace?.[type] || {});
  const viewValues = (config?.layout || [])
    .map(view => view.coordinationValues?.[type]);
  return [...scopeValues, ...viewValues]
    .some(value => Array.isArray(value?.frames) && value.frames.length > 0);
}

/**
 * Detect whether annotation editing is enabled anywhere in a view config,
 * i.e., whether any annotationEditable coordination value is true
 * (in any coordination scope, or defined directly by any view).
 * The default value of annotationEditable is false.
 * @param {object} config A view config object (JSON).
 * @returns {boolean} True if any annotationEditable value is true.
 */
export function isAnyAnnotationEditing(config) {
  const type = CoordinationType.ANNOTATION_EDITABLE;
  const scopeValues = Object.values(config?.coordinationSpace?.[type] || {});
  const viewValues = (config?.layout || [])
    .map(view => view.coordinationValues?.[type]);
  return [...scopeValues, ...viewValues].some(value => value === true);
}

/**
 * Determine whether a view is mapped to a coordination scope for a coordination type,
 * either directly or via meta-coordination.
 * @param {object} view A view definition from the layout.
 * @param {object} coordinationSpace The coordination space.
 * @param {string} coordinationType The coordination type.
 * @returns {boolean} True if the view is mapped to a scope.
 */
function hasScopeMapping(view, coordinationSpace, coordinationType) {
  if (view.coordinationScopes?.[coordinationType] !== undefined) {
    return true;
  }
  const metaScopes = view.coordinationScopes?.[CoordinationType.META_COORDINATION_SCOPES];
  const metaScopesArr = Array.isArray(metaScopes) ? metaScopes : [metaScopes].filter(Boolean);
  const metaSpace = coordinationSpace?.[CoordinationType.META_COORDINATION_SCOPES] || {};
  return metaScopesArr.some(metaScope => metaSpace[metaScope]?.[coordinationType] !== undefined);
}

/**
 * Get a coordination scope name that is not already used for a coordination type.
 * @param {object} config A view config object (JSON).
 * @param {string} coordinationType The coordination type.
 * @returns {string} An unused scope name.
 */
function getUnusedScopeName(config, coordinationType) {
  const usedScopes = new Set([
    ...Object.keys(config?.coordinationSpace?.[coordinationType] || {}),
    ...(config?.layout || []).map(view => view.coordinationScopes?.[coordinationType]),
  ]);
  let i = 0;
  // Use A, B, ..., Z, then AA, AB, ...
  const toName = n => (n < 26
    ? String.fromCharCode(65 + n)
    : toName(Math.floor(n / 26) - 1) + String.fromCharCode(65 + (n % 26)));
  while (usedScopes.has(toName(i))) {
    i += 1;
  }
  return toName(i);
}

/**
 * Set all annotationEditable coordination values in a view config.
 * Views which support annotationEditable (including the annotationController)
 * but are not mapped to an annotationEditable scope (directly or via meta-coordination),
 * and do not define the value directly, are mapped to a shared scope.
 * The scope of the annotationController is reused for this, if it has one;
 * otherwise, a new scope is created.
 * The input config is not modified.
 * @param {object} config A view config object (JSON), which must contain an annotationController.
 * @param {boolean} value The value to set.
 * @returns {object} The new view config.
 * @throws {Error} If the config does not contain an annotationController view.
 */
function setAnnotationEditing(config, value) {
  if (!hasAnnotationControllerView(config)) {
    throw new Error('The view config does not contain an annotationController view. Call addAnnotationControllerView first.');
  }
  const type = CoordinationType.ANNOTATION_EDITABLE;
  const coordinationSpace = config.coordinationSpace || {};
  const supportsEditable = view => (
    view.component === ViewType.ANNOTATION_CONTROLLER
    || COMPONENT_COORDINATION_TYPES[view.component]?.includes(type)
  );
  // Views which support annotationEditable but are not yet mapped to a scope for it
  // (and do not define the value directly) are mapped to a shared scope, so that
  // editing is enabled/disabled for the annotationController and those views together.
  const needsScope = view => supportsEditable(view)
    && view.coordinationValues?.[type] === undefined
    && !hasScopeMapping(view, coordinationSpace, type);

  // Reuse the scope of the annotationController (if any), otherwise create a new scope.
  const existingControllerScope = config.layout
    .filter(view => view.component === ViewType.ANNOTATION_CONTROLLER)
    .map(view => view.coordinationScopes?.[type])
    .find(scope => typeof scope === 'string');
  const newScope = config.layout.some(needsScope)
    ? (existingControllerScope ?? getUnusedScopeName(config, type))
    : undefined;

  const newLayout = config.layout.map((view) => {
    if (needsScope(view)) {
      return {
        ...view,
        coordinationScopes: { ...view.coordinationScopes, [type]: newScope },
      };
    }
    if (view.coordinationValues?.[type] !== undefined) {
      // Values defined directly by a view would otherwise take precedence over the scopes.
      return {
        ...view,
        coordinationValues: { ...view.coordinationValues, [type]: value },
      };
    }
    return view;
  });

  const newScopeValues = Object.fromEntries(
    [...Object.keys(coordinationSpace[type] || {}), ...(newScope ? [newScope] : [])]
      .map(scope => ([scope, value])),
  );

  return {
    ...config,
    coordinationSpace: {
      ...coordinationSpace,
      [type]: newScopeValues,
    },
    layout: newLayout,
  };
}

/**
 * Enable annotation editing, by setting all annotationEditable coordination values
 * in the view config to true (in all coordination scopes, and in values defined
 * directly by views). Views which support annotationEditable but are not yet
 * mapped to a scope for it (including the annotationController) are mapped
 * to a shared annotationEditable scope.
 * The input config is not modified.
 * @param {object} config A view config object (JSON), which must contain an annotationController.
 * @returns {object} The new view config.
 * @throws {Error} If the config does not contain an annotationController view.
 */
export function enableAnnotationEditing(config) {
  return setAnnotationEditing(config, true);
}

/**
 * Disable annotation editing, by setting all annotationEditable coordination values
 * in the view config to false (in all coordination scopes, and in values defined
 * directly by views). Views which support annotationEditable but are not yet
 * mapped to a scope for it (including the annotationController) are mapped
 * to a shared annotationEditable scope.
 * The input config is not modified.
 * @param {object} config A view config object (JSON), which must contain an annotationController.
 * @returns {object} The new view config.
 * @throws {Error} If the config does not contain an annotationController view.
 */
export function disableAnnotationEditing(config) {
  return setAnnotationEditing(config, false);
}
