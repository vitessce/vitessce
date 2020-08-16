import { useEffect, useContext } from 'react';
import { useStore } from './state/hooks';
import { DatasetLoaderContext } from './state/contexts';

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
export default function ViewConfigPublisher(props) {
  const {
    onConfigChange,
    onLoaderChange,
  } = props;

  const viewConfig = useStore(state => state.viewConfig);
  const loaders = useContext(DatasetLoaderContext);

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
