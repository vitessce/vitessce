import { makeStyles } from '@vitessce/styles';

export const useEllipsisMenuStyles = makeStyles()(() => ({
  imageLayerMenuLabel: {
    margin: '0 4px',
  },
  imageLayerMenuButton: {
    backgroundColor: 'transparent',
    padding: '4px 0',
  },
  imageLayerPopperContainer: {
    display: 'flex',
    marginTop: '4px',
    justifyContent: 'space-around',
  },
  imageLayerVisibleButton: {
    marginLeft: 0,
    height: '100%',
    padding: 0,
    minWidth: 0,
  },
  imageLayerName: {
    padding: 0,
    marginBottom: '0 !important',
    marginLeft: '4px',
    marginTop: '12px !important',
  },
  imageLayerOpacitySlider: {
    marginTop: '7px',
  },
  menuItem: {
    paddingRight: '8px',
  },
  menuItemSlider: {
  },
  menuItemCheckbox: {
    padding: '4px',
  },
}));

// Below this container width, the channel row's slider wraps onto its own line
// so it stops overlapping the selector, color picker, and options controls.
// ponytail: threshold is a visual calibration knob — tune against the panel.
export const CHANNEL_ROW_WRAP_WIDTH = 450; // px

const wrapQuery = `@container (max-width: ${CHANNEL_ROW_WRAP_WIDTH}px)`;

// Make each channel row a container-query context.
export const channelRowContainerSx = { containerType: 'inline-size' };

// Slider cell: full width + ordered last => wraps to its own line when narrow.
// The horizontal padding insets the slider so its thumbs don't push the row
// past its container's edge when full-width (Grid items are border-box).
export const channelSliderCellSx = {
  [wrapQuery]: {
    width: '100%',
    order: 1,
    paddingLeft: '12px',
    paddingRight: '12px',
  },
};

// Selector/label cell: grow to absorb the top line's slack when narrow.
export const channelSelectorCellSx = {
  [wrapQuery]: { flexGrow: 1 },
};

// Small control cells (checkbox, color swatch, options, type icon): size to
// their content when narrow so they don't collapse below it and overlap the
// neighbouring label/selector.
export const channelControlCellSx = {
  [wrapQuery]: {
    width: 'auto',
    flexGrow: 0,
    flexShrink: 0,
  },
};

// Segmentation-only narrow layout: instead of the opacity slider getting its own
// full-width line, the square+circle type icon and the slider share the second
// line => [type icon][slider]. A zero-height full-width break (order 1) forces
// that new line so a short label can't let the icon float back up to line 1;
// the icon (order 2) and slider (order 3) then follow on it.
export const channelRowBreakSx = {
  display: 'none',
  [wrapQuery]: {
    display: 'block',
    flexBasis: '100%',
    height: 0,
    order: 1,
  },
};

export const channelSegmentationIconCellSx = {
  [wrapQuery]: {
    width: 'auto',
    flexGrow: 0,
    flexShrink: 0,
    order: 2,
    paddingLeft: '12px',
  },
};

export const channelSegmentationSliderCellSx = {
  [wrapQuery]: {
    order: 3,
    flexGrow: 1,
    paddingLeft: '8px',
    paddingRight: '12px',
  },
};

export {
  useSpanStyles,
  useSelectStyles,
  useControllerSectionStyles,
  useAccordionStyles,
  useInputLabelStyles,
  useOverflowEllipsisGridStyles,
  useSelectionSliderStyles,
} from '@vitessce/layer-controller';
