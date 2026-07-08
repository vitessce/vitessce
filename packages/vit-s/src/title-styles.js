import { makeStyles } from '@vitessce/styles';

export const useTitleStyles = makeStyles()(theme => ({
  title: {
    color: theme.palette.primaryForeground,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: '0',
  },
  // Note: This class is specified as the draggable handle for the grid layout.
  titleLeft: {
    flexShrink: '1',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  infoText: {
    color: theme.palette.primaryForeground,
    width: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: '60% !important',
    opacity: '.8',
    padding: '0',
    justifyContent: 'center',
    textAlign: 'center !important',
    borderTop: '0px',
    borderBottom: `1px solid ${theme.palette.cardInfoBorder}`,
    borderLeft: `1px solid ${theme.palette.cardInfoBorder}`,
    borderRight: `1px solid ${theme.palette.cardInfoBorder}`,
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
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
    border: `${theme.cardBorderSize} solid ${theme.palette.cardBorder}`,
    flex: '1 1 auto',
    minHeight: '1px',
    marginTop: '0',
    marginBottom: '0',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0',
    wordWrap: 'break-word',
    backgroundClip: 'border-box',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  },
  cardWithoutInfoText: {
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
  },
  paddingCard: {
    padding: '12px',
  },
  noPaddingCard: {
    padding: 0,
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
