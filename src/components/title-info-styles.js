/* eslint-disable */
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  iconButton: {
    border: 'none',
    marginLeft: 0,
    background: 'none',
    color: theme.palette.primaryForeground,
    paddingLeft: '0.25em',
    paddingRight: '0.25em',
    borderRadius: '2px',
    '&:hover': {
      backgroundColor: theme.palette.primaryBackgroundLight,
    },
    '&:first-child': {
      marginLeft: '0.75em',
    },
    '&:last-child': {
      marginRight: '0.25em',
    },
    '& svg': {
      width: '0.7em',
      height: '0.7em',
      verticalAlign: 'middle',
    },
  },
  downloadLink: {
    color: theme.palette.primaryForeground,
  },
  containerBox: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
  },
  titleBox: {
    overflowX: 'hidden',
    display: 'flex !important',
    justifyContent: 'space-between !important',
    alignItems: 'baseline !important',
  },
  card: props => ({
    flex: '1 1 auto',
    minHeight: '1px',
    padding: '0.75rem',
    marginTop: '0px !important',
    marginBottom: '0.5rem !important',
    position: 'relative',
    flexDirection: 'column',
    minWidth: '0',
    wordWrap: 'break-word',
    backgroundClip: 'border-box',
    borderRadius: '0.25rem',
    display: 'flex',
    overflowY: (props.isScroll ? 'auto' : 'inherit'),
    backgroundColor: (props.isScroll
      ? theme.palette.primaryBackground
      : (props.isSpatial ? 'black' : theme.palette.secondaryBackground)
    ),
    color: theme.palette.primaryForeground,
  }),
  tab: {
    flexBasis: 'inherit',
    flexShrink: 0,
    minHeight: '0px',
  },
  labelTab: {
    textAlign: 'left',
    fontWeight: '300',
    '& span': {
      alignItems: 'start',
    }
  },
  iconTab: {
    minWidth: '0px',
    '& svg': {
      width: '20px',
      height: '20px'
    }
  },
  tabsRoot: {
    minHeight: '0px',
  },
  tabsIndicator: {
    backgroundColor: 'transparent',
    borderLeft: '2px solid #545454',
    borderTop: '2px solid #545454',
    borderRight: '2px solid #545454',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    height: '100%',
  }
}));

