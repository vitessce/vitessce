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

export const useExpansionPanelStyles = makeStyles(() => ({
  root: {
    width: '100%',
    flexDirection: 'column',
  },
}));

export const useExpansionPanelSummaryStyles = makeStyles(theme => ({
  root: {
    top: theme.spacing(-1),
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
