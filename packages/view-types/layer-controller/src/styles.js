import { makeStyles } from '@material-ui/core';

export const useSpanStyles = makeStyles(() => ({
  span: {
    width: '70px',
    textAlign: 'center',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
}));

export const useChannelSliderStyles = makeStyles(theme => ({
  valueLabel: {
    marginTop: '7px',
    '& span': {
      color: theme.palette.secondaryForeground, // Change color here
      backgroundColor: theme.palette.secondaryBackgroundDim, // Change color here
    },
  },
}));

export const useSelectStyles = makeStyles(() => ({
  selectRoot: {
    padding: 0,
    height: 'auto',
    margin: '4px 0',
    fontSize: '14px',
    width: '100%',
  },
}));

export const useControllerSectionStyles = makeStyles(() => ({
  layerControllerRoot: {
    width: '100%',
    flexDirection: 'column',
    padding: '0px 8px',
  },
  layerControllerGrid: {
    marginTop: '10px',
  },
}));

export const useAccordionStyles = makeStyles(theme => ({
  accordionDetailsRoot: {
    width: '100%',
    flexDirection: 'column',
    padding: '8px 8px 24px 8px',
  },
  accordionSummaryRoot: {
    padding: '0px 8px',
  },
  content: {
    margin: '4px 0px',
    minWidth: '0px',
  },
  expanded: {
    marginBottom: theme.spacing(-3),
    top: theme.spacing(-1),
  },
  expandIcon: {
    '&$expanded': {
      top: theme.spacing(-1.3),
    },
  },
}));

export const useInputLabelStyles = makeStyles(() => ({
  inputLabelRoot: {
    fontSize: '14px',
  },
}));

export const useOverflowEllipsisGridStyles = makeStyles(() => ({
  item: {
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

export const useSelectionSliderStyles = makeStyles(() => ({
  selectionSliderRoot: {
    marginTop: '7px',
  },
  markActive: {
    backgroundColor: 'rgba(128, 128, 128, 0.7)',
  },
}));
