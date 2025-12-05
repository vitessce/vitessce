
/**
 * Enum for info placement types.
 * Used to specify where to position info overlays in view props.
 * Mimics the naming convention of Popper.js placements,
 * excludes 'auto' placements, and adds a 'title' placement type.
 */
export const InfoPlacementTypes = {
  TITLE: 'title',
  TOP_START: 'top-start',
  TOP: 'top',
  TOP_END: 'top-end',
  RIGHT_START: 'right-start',
  RIGHT: 'right',
  RIGHT_END: 'right-end',
  BOTTOM_START: 'bottom-start',
  BOTTOM: 'bottom',
  BOTTOM_END: 'bottom-end',
  LEFT_START: 'left-start',
  LEFT: 'left',
  LEFT_END: 'left-end',
} as const;

export type InfoPlacementType = typeof InfoPlacementTypes[keyof typeof InfoPlacementTypes];
