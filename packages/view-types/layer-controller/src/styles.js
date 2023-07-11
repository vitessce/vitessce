import { makeStyles } from '@material-ui/core';

export const useSpanStyles = makeStyles(() => ({
  span: {
    width: '70px',
    textAlign: 'center',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
}));

export function MuiSpan(props) {
  const { children } = props;
  const classes = useSpanStyles();
  return <span className={classes.span}>{children}</span>;
}

export const useSelectStyles = makeStyles(() => ({
  selectRoot: {
    padding: 0,
    height: 'auto',
    margin: '4px 0',
  },
}));

export const useControllerSectionStyles = makeStyles(() => ({
  layerControllerRoot: {
    width: '100%',
    flexDirection: 'column',
    padding: '0px 8px',
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
