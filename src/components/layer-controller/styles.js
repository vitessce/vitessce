import { makeStyles, withStyles } from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';


export const useOptionStyles = withStyles(theme => ({
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
}))(ExpansionPanelSummary);

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
