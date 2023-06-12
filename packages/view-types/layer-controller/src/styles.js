import {
  makeStyles,
  withStyles,
  AccordionSummary,
  AccordionDetails,
  InputLabel,
  Slider,
  Grid,
} from '@material-ui/core';

const useSpanStyles = makeStyles(() => ({
  layerControllerSpan: {
    width: '70px',
    textAlign: 'center',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
}));

export function MuiSpan(props) {
  const { children } = props;
  const classes = useSpanStyles();
  return <span className={classes.layerControllerSpan}>{children}</span>;
}

export const useSelectStyles = makeStyles(() => ({
  layerControllerSelectRoot: {
    padding: 0,
    height: 'auto',
    margin: '4px 0',
  },
}));

const sharedControllerStyles = {
  width: '100%',
  flexDirection: 'column',
};

export const useControllerSectionStyles = makeStyles(() => ({
  root: {
    ...sharedControllerStyles,
    padding: '0px 8px',
  },
}));

export const StyledAccordionDetails = withStyles(() => ({
  root: {
    ...sharedControllerStyles,
    padding: '8px 8px 24px 8px',
  },
}))(AccordionDetails);

export const StyledAccordionSummary = withStyles(theme => ({
  root: {
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
}))(AccordionSummary);

export const StyledInputLabel = withStyles(() => ({
  root: {
    fontSize: '14px',
  },
}))(InputLabel);

export const OverflowEllipsisGrid = withStyles(() => ({
  item: {
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}))(Grid);

export const StyledSelectionSlider = withStyles(() => ({
  root: {
    marginTop: '7px',
  },
  markActive: {
    backgroundColor: 'rgba(128, 128, 128, 0.7)',
  },
}))(Slider);
