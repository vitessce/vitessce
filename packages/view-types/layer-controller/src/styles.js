import { styled, css } from '@mui/material-pigment-css';

export const valueLabel = css(({ theme }) => ({
  marginTop: '7px',
  '& span': {
    color: theme.palette.secondaryForeground, // Change color here
    backgroundColor: theme.palette.secondaryBackgroundDim, // Change color here
  },
}));

export const useChannelSliderStyles = () => ({
  valueLabel,
});

export const selectRoot = css({
  padding: 0,
  height: 'auto',
  margin: '4px 0',
  fontSize: '14px',
  width: '100%',
});

export const useSelectStyles = () => ({
  selectRoot,
});

export const controllerSectionStyles = ({
  layerControllerRoot: css({
    width: '100%',
    flexDirection: 'column',
    padding: '0px 8px',
  }),
  layerControllerGrid: css({
    marginTop: '10px',
  }),
});

export const useControllerSectionStyles = () => controllerSectionStyles;
const accordionStyles = {
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
  expanded: css(({ theme }) => ({
    marginBottom: theme.spacing(-3),
    top: theme.spacing(-1),
  })),
  expandIcon: css(({ theme }) => ({
    '&$expanded': {
      top: theme.spacing(-1.3),
    },
  })),
};

export const useAccordionStyles = () => accordionStyles;

const inputLabelRoot = css({
  fontSize: '14px',
});

export const useInputLabelStyles = () => ({
  inputLabelRoot,
});

const item = css({
  width: '100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

export const useOverflowEllipsisGridStyles = () => ({
  item,
});

export const SelectionSliderRoot = styled('div')({
  marginTop: '7px',
});

export const MarkActive = styled('div')({
  backgroundColor: 'rgba(128, 128, 128, 0.7)',
});

const selectionSliderRoot = css({
  marginTop: '7px',
});

const markActive = css({
  backgroundColor: 'rgba(128, 128, 128, 0.7)',
});

export const useSelectionSliderStyles = () => ({
  selectionSliderRoot,
  markActive,
});
