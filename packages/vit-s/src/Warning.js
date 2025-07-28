import clsx from 'clsx';
import { useStyles } from './shared-warning-styles.js';
import { VITESSCE_CONTAINER } from './classNames.js';

export function Warning(props) {
  const {
    title,
    preformatted,
    unformatted,
  } = props;
  const { classes } = useStyles();
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
