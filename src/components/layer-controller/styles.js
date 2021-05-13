import { makeStyles } from '@material-ui/core/styles';

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

export const useExpansionPanelStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    width: '100%',
    flexDirection: 'column',
  },
}));

export const useExpansionPanelSummaryStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(-2),
    top: theme.spacing(-1),
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
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
}));

export const useSmallInputLabelStyles = makeStyles(() => ({
  root: {
    fontSize: '14px',
  },
}));
