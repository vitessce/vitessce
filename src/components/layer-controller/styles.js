import { makeStyles } from '@material-ui/core/styles';

export const useExpansionPanelStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: '100%',
    flexDirection: 'column',
  },
}));

export const useExpansionPanelSummaryStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(-2),
    top: theme.spacing(-1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
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

export const useCheckboxStyles = makeStyles(() => ({
  root: {
    // height attribute needed to solve: https://github.com/vitessce/vitessce/issues/833
    '& input': {
      height: '100% !important',
    },
  },
}));
