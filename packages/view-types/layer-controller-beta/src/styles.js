import { makeStyles } from '@vitessce/styles';

export const useEllipsisMenuStyles = makeStyles()(() => ({
  imageLayerMenuLabel: {
    margin: '0 5px',
  },
  imageLayerMenuButton: {
    backgroundColor: 'transparent',
    padding: '4px 0',
  },
  imageLayerPopperContainer: {
    display: 'flex',
    marginTop: '5px',
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
  menuItemSlider: {
    width: '100px',
  },
  menuItemCheckbox: {
    padding: '4px',
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
