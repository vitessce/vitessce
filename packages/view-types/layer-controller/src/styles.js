import { css, useTheme } from '@emotion/react';

export const useChannelSliderStyles = () => {
  const theme = useTheme();
  return ({
    valueLabel: css({
      marginTop: '7px',
      '& span': {
        color: theme.palette.secondaryForeground, // Change color here
        backgroundColor: theme.palette.secondaryBackgroundDim, // Change color here
      },
    }),
  });
};

export const useSelectStyles = () => ({
  selectRoot: css({
    padding: 0,
    height: 'auto',
    margin: '4px 0',
    fontSize: '14px',
    width: '100%',
  }),
});

export const useControllerSectionStyles = () => ({
  layerControllerRoot: css({
    width: '100%',
    flexDirection: 'column',
    padding: '0px 8px',
  }),
  layerControllerGrid: css({
    marginTop: '10px',
  }),
});

export const useAccordionStyles = () => {
  const theme = useTheme();
  return {
    accordionDetailsRoot: css({
      width: '100%',
      flexDirection: 'column',
      padding: '8px 8px 24px 8px',
    }),
    accordionSummaryRoot: css({
      padding: '0px 8px',
    }),
    content: css({
      margin: '4px 0px',
      minWidth: '0px',
    }),
    expanded: css({
      marginBottom: theme.spacing(-3),
      top: theme.spacing(-1),
    }),
    expandIcon: css({
      '&$expanded': {
        top: theme.spacing(-1.3),
      },
    }),
  };
};

const inputLabelRoot = css({
  fontSize: '14px',
});

export const useInputLabelStyles = () => ({
  inputLabelRoot,
});
 

export const useOverflowEllipsisGridStyles = () => ({
  item: css({
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
});
  
export const useSelectionSliderStyles = () => ({
  selectionSliderRoot:  css({
    marginTop: '7px',
  }),
  markActive : css({
    backgroundColor: 'rgba(128, 128, 128, 0.7)',
  }),
});
