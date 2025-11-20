import { makeStyles } from '@vitessce/styles';

export const useEllipsisMenuStyles = makeStyles()(() => ({
  imageLayerMenuLabel: {
    margin: '0 0.25rem',
  },
  imageLayerMenuButton: {
    backgroundColor: 'transparent',
    padding: '0.25rem 0',
  },
  imageLayerPopperContainer: {
    display: 'flex',
    marginTop: '0.25rem',
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
    marginLeft: '0.25rem',
    marginTop: '0.75rem !important',
  },
  imageLayerOpacitySlider: {
    marginTop: '7px',
  },
  menuItem: {
    paddingRight: '0.5rem',
  },
  menuItemSlider: {
  },
  menuItemCheckbox: {
    padding: '0.25rem',
  },
}));

export {
  useSpanStyles,
  useSelectStyles,
  useControllerSectionStyles,
  useAccordionStyles,
  useInputLabelStyles,
  useOverflowEllipsisGridStyles,
  useSelectionSliderStyles,
} from '@vitessce/layer-controller';
