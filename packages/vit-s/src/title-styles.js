import { makeStyles } from '@material-ui/core';

export const useTitleStyles = makeStyles(theme => ({
  title: {
    color: theme.palette.primaryForeground,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: '0',
  },
  titleLeft: {
    flexShrink: '1',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  titleInfo: {
    width: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: '80% !important',
    opacity: '.8',
    padding: '0 4px',
    justifyContent: 'center',
    lineHeight: '25px !important',
    flexShrink: '1',
    textAlign: 'right !important',
  },
  titleButtons: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    flexShrink: '0',
    justifyContent: 'right',
    '& div': {
      display: 'inline-block',
    },
  },
  card: {
    border: `1px solid ${theme.palette.cardBorder}`,
    flex: '1 1 auto',
    minHeight: '1px',
    padding: '12px',
    marginTop: '8px',
    marginBottom: '8px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0',
    wordWrap: 'break-word',
    backgroundClip: 'border-box',
    borderRadius: '4px',
  },
  noScrollCard: {
    backgroundColor: theme.palette.secondaryBackground,
    color: theme.palette.secondaryForeground,
  },
  scrollCard: {
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
    '& a': {
      color: theme.palette.primaryForegroundActive,
    },
    overflowY: 'auto',
  },
  spatialCard: {
    backgroundColor: theme.palette.black,
    color: theme.palette.white,
    '& a': {
      color: theme.palette.white,
    },
  },
}));
