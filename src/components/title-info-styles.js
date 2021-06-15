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
    minWidth: '0px',
    wordWrap: 'break-word',
    backgroundClip: 'border-box',
    borderRadius: '0.25rem',
    display: 'flex',
    overflowY: (props.isScroll ? 'auto' : 'inherit'),
    backgroundColor: (props.isScroll || !props.isMainTab
      ? theme.palette.primaryBackground
      : (props.isSpatial ? 'black' : theme.palette.secondaryBackground)
    ),
    color: theme.palette.primaryForeground,
  }),
  tab: {
    flexShrink: '1',
    minHeight: '0px',
    padding: '6px 8px',
    color: `${theme.palette.primaryForeground} !important`,
  },
  labelTab: {
    textAlign: 'left',
    fontWeight: '300',
    '& span': {
      alignItems: 'start',
      fontSize: '14px',
    },
    minWidth: '0px',
    flexBasis: '1',
    flexGrow: '1',
  },
  iconTab: {
    alignItems: 'end',
    flexBasis: 'auto',
    flexGrow: '0',
    minWidth: '0px',
    '& svg': {
      width: '18px',
      height: '18px'
    }
  },
  tabsRoot: {
    minHeight: '0px',
    width: '100%',
  },
  tabsScroller: {
    width: '100%',
  },
  tabsIndicator: props => ({
    backgroundColor: 'transparent',
    borderLeft: `2px solid ${theme.palette.primaryBackground}`,
    borderTop: `2px solid ${theme.palette.primaryBackground}`,
    borderRight: `2px solid ${theme.palette.primaryBackground}`,
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    height: '100%',
    cursor: 'grab',
    opacity: (props.isMainTab ? '0' : '1'),
  }),
  info: props => ({
    position: 'absolute',
    bottom: '0',
    right: '0',
    backgroundColor: (props.isScroll
      ? theme.palette.primaryBackground
      : (props.isSpatial ? 'black' : theme.palette.secondaryBackground)
    ),
    color: (props.isScroll
      ? theme.palette.primaryForeground
      : (props.isSpatial ? 'white' : theme.palette.secondaryForeground)
    ),
    opacity: '0.8',
    fontSize: '10px',
    padding: '2px 4px',
    borderRadius: '2px',
  }),
  mainTabContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0px',
    wordWrap: 'break-word',
    backgroundClip: 'border-box',
    flex: '1 1 auto',
    minHeight: '1px',
    boxSizing: 'border-box',
    padding: '0',
    margin: '0',
    zIndex: '1'
  },
  auxTabContainer: {
    backgroundColor: 'rgb(0, 0, 0, 0.8)',
    position: 'absolute',
    top: '0',
    left: '0',
    padding: '0',
    width: '100%',
    height: '100%',
    zIndex: '2'
  },
}));

