import { css } from '@emotion/react';

const imageLayerMenuLabel = css({
  margin: '0 5px',
});

const imageLayerMenuButton = css({
  backgroundColor: 'transparent',
  padding: '3px 0',
});

const imageLayerPopperContainer = css({
  display: 'flex',
  marginTop: '5px',
  justifyContent: 'space-around',
});

const imageLayerVisibleButton = css({
  marginLeft: 0,
  height: '100%',
  padding: 0,
  minWidth: 0,
});

const imageLayerName = css({
  padding: 0,
  marginBottom: '0 !important',
  marginLeft: '4px',
  marginTop: '10px !important',
});

const imageLayerOpacitySlider = css({
  marginTop: '7px',
});

const menuItemSlider = css({
  width: '100px',
});

export const useEllipsisMenuStyles = () => ({
  imageLayerMenuLabel,
  imageLayerMenuButton,
  imageLayerPopperContainer,
  imageLayerVisibleButton,
  imageLayerName,
  imageLayerOpacitySlider,
  menuItemSlider,
});


export {
  useSelectStyles,
  useInputLabelStyles,
  useOverflowEllipsisGridStyles,
  useSelectionSliderStyles,
  useControllerSectionStyles,
} from '@vitessce/layer-controller';
