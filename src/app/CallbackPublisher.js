import { useEffect } from 'react';
import { useViewConfigStore, useLoaders, useWarning } from './state/hooks';

/**
 * This is a dummy component which handles
 * publishing new view configs and loaders to
 * the provided callbacks on changes.
 * @param {object} props
 * @param {function} props.onConfigChange A callback function
 * to execute on each change of the Vitessce view config.
 * @param {function} props.onLoaderChange A callback function
 * to execute on each change of the loaders object.
 */
export default function CallbackPublisher(props) {
  const {
    onWarn,
    onConfigChange,
    onLoaderChange,
  } = props;

  const warning = useWarning();
  const loaders = useLoaders();

  // View config updates are often-occurring, so
  // we want to use the "transient update" approach
  // to subscribe to view config changes.
  // Reference: https://github.com/react-spring/zustand#transient-updates-for-often-occuring-state-changes
  useEffect(() => useViewConfigStore.subscribe(
    // The function to run on each publish.
    (viewConfig) => {
      if (onConfigChange && viewConfig) {
        onConfigChange(viewConfig);
      }
    },
    // The function to specify which part of the store
    // we want to subscribe to.
    state => state.viewConfig,
  ), [onConfigChange]);

  // Emit updates to the warning message.
  useEffect(() => {
    if (onWarn && warning) {
      onWarn(warning);
    }
  }, [warning, onWarn]);

  // Emit updates to the loaders.
  useEffect(() => {
    if (onLoaderChange && loaders) {
      onLoaderChange(loaders);
    }
  }, [loaders, onLoaderChange]);

  // Render nothing.
  return null;
}
