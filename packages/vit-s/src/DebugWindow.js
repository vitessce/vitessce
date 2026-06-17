import clsx from 'clsx';
import { useStyles } from './shared-warning-styles.js';
import { VITESSCE_CONTAINER } from './classNames.js';

export function DebugWindow({ debugErrors }) {
  const { classes } = useStyles();
  return (
    <div className={VITESSCE_CONTAINER}>
      <div className={clsx(classes.warningLayout, classes.containerFluid)}>
        <div className={classes.row}>
          <div className={classes.warningCard}>
            {debugErrors.map((error, index) => (
              <div key={error.message || index}>
                {index === 0 && (
                  <div>
                    <h1>Error Type: {error.name}</h1>
                    {Object.keys(error).map(
                      key => key !== 'name'
                        && key !== 'message' && (
                          <p key={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}: {error[key]}
                          </p>
                      ),
                    )}
                  </div>
                )}
                <p>Error: {error.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
