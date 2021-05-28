import { makeStyles, withStyles } from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

export const useOptionStyles = makeStyles(theme => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
  },
  span: {
    width: '70px',
    textAlign: 'center',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
  colors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    paddingLeft: '2px',
    paddingRight: '2px',
  },
  popper: {
    zIndex: 4,
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

export const StyledExpansionPanelDetails = withStyles(() => ({
  root: {
    ...sharedControllerStyles,
    padding: '8px 8px 24px 8px',
  },
}))(ExpansionPanelDetails);

export const StyledExpansionPanelSummary = withStyles(theme => ({
  root: {
    top: theme.spacing(-1),
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: '0px 8px',
  },
  expanded: {
    marginBottom: theme.spacing(-3),
    top: theme.spacing(-1),
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  expandIcon: {
    '&$expanded': {
      top: theme.spacing(-1.3),
    },
  },
}))(ExpansionPanelSummary);

export const useSmallInputLabelStyles = makeStyles(() => ({
  root: {
    fontSize: '14px',
  },
}));
