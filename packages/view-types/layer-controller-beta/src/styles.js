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
    // Truncate rather than widening the row's label cell, which would push the
    // options menu and layer type icon onto a second line in narrow containers.
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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

// Selector/label cell: absorb the top line's slack when narrow. Flex line
// breaking uses each item's flex-basis (not its shrunk size), so the cell's
// wide-layout basis of 6/12 columns would push the controls to its right onto
// a second line; a zero basis lets it take only the leftover width instead.
// Its contents therefore need to handle being narrow (see imageLayerName).
export const channelSelectorCellSx = {
  [wrapQuery]: {
    flexBasis: 0,
    flexGrow: 1,
  },
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

// Empty alignment cells: hold their column width at every container size, so a
// crowded line shrinks the neighbouring label instead of eating the alignment.
export const channelSpacerCellSx = { flexShrink: 0, minWidth: '44px' };

export {
  useSpanStyles,
  useSelectStyles,
  useControllerSectionStyles,
  useAccordionStyles,
  useInputLabelStyles,
  useOverflowEllipsisGridStyles,
  useSelectionSliderStyles,
} from '@vitessce/layer-controller';
