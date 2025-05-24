import { makeStyles } from '@vitessce/styles';

export const useSpanStyles = makeStyles()(() => ({
  span: {
    width: '70px',
    textAlign: 'center',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
}));

export const useChannelSliderStyles = makeStyles()(() => ({
  valueLabel: {
    marginTop: '7px',
  },
}));

export const useSelectStyles = makeStyles()(() => ({
  selectRoot: {
    padding: 0,
    height: 'auto',
    margin: 0,
    fontSize: '14px !important',
    width: '100%',
  },
}));

export const useControllerSectionStyles = makeStyles()(theme => ({
  layerControllerRoot: {
    width: '100%',
    flexDirection: 'column',
    padding: '0px 8px',
    backgroundColor: theme.palette.paperBackground,
  },
  accordionRoot: {
    backgroundColor: theme.palette.paperBackground,
  },
  layerControllerGrid: {
    marginTop: '10px',
  },
}));

export const useAccordionStyles = makeStyles()(theme => ({
  accordionVisibilityIconBox: {
    margin: 0,
    padding: 0,
    minWidth: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    '&:hover': {
      opacity: 0.8,
    },
    color: theme.palette.primary[500],
  },
  accordionNameBox: {
    marginLeft: '10px',
    fontSize: '14px !important',
  },
  accordionDetailsRoot: {
    width: '100%',
    flexDirection: 'column',
    padding: '8px 8px 24px 8px',
  },
  accordionSummaryRoot: {
    padding: '0px 8px',
  },
  content: {
    margin: '4px 0px !important',
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

export const useInputLabelStyles = makeStyles()(() => ({
  inputLabelRoot: {
    fontSize: '14px',
  },
}));

export const useOverflowEllipsisGridStyles = makeStyles()(() => ({
  item: {
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

export const useSelectionSliderStyles = makeStyles()(() => ({
  selectionSliderRoot: {
    marginTop: '7px',
  },
  markActive: {
    backgroundColor: 'rgba(128, 128, 128, 0.7)',
  },
}));
