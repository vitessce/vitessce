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
    marginTop: '0.5rem !important',
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
}));

