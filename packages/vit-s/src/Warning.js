import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { VITESSCE_CONTAINER } from './classNames.js';

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
    flexGrow: '1',
  },
  warningCard: {
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
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
  },
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
          <div className={classes.warningCard}>
            <h1>{title}</h1>
            {preformatted ? (<pre>{preformatted}</pre>) : null}
            <p>{unformatted}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
