import { useEffect } from 'react';
import { useWarning, useViewConfig, useLoaders } from './state/hooks';

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
  const viewConfig = useViewConfig();
  const loaders = useLoaders();

  // Emit updates to the warning message.
  useEffect(() => {
    if (onWarn && warning) {
      onWarn(warning);
    }
  }, [warning, onWarn]);

  // Emit updates to the view config.
  useEffect(() => {
    if (onConfigChange && viewConfig) {
      onConfigChange(viewConfig);
    }
  }, [viewConfig, onConfigChange]);

  // Emit updates to the loaders.
  useEffect(() => {
    if (onLoaderChange && loaders) {
      onLoaderChange(loaders);
    }
  }, [loaders, onLoaderChange]);

  // Render nothing.
  return null;
}
