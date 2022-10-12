import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { VITESSCE_CONTAINER } from './classNames';

const useStyles = makeStyles(theme => ({
  warningLayout: {
    backgroundColor: theme.palette.gridLayoutBackground,
    position: 'absolute',
    width: '100%',
    height: '100vh',
  },
  containerFluid: {
    width: '100%',
    padding: '15px',
    marginRight: 'auto',
    marginLeft: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
  },
  row: {
    flexGrow: '1'
  },
  card: {
    border: `1px solid ${theme.palette.cardBorder}`,
    flex: '1 1 auto',
    minHeight: '1px',
    padding: '0.75rem',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0',
    wordWrap: 'break-word',
    backgroundClip: 'border-box',
    borderRadius: '0.25rem',
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
  }
}));

export function Warning(props) {
  const {
    title,
    preformatted,
    unformatted,
  } = props;
  const classes = useStyles();
  return (
    <div className={VITESSCE_CONTAINER}>
      <div className={clsx(classes.warningLayout, classes.containerFluid)}>
        <div className={classes.row}>
          <div className={classes.card}>
            <h1>{title}</h1>
            {preformatted ? (<pre>{preformatted}</pre>) : null}
            <p>{unformatted}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
