import React, { useCallback, useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import { METADATA_ADD, METADATA_REMOVE, RESET } from '../../events';
import TitleInfo from '../TitleInfo';
import Description from './Description';

export default function DescriptionSubscriber(props) {
  const {
    description,
    onReady,
    removeGridComponent,
    theme,
  } = props;

  const onReadyCallback = useCallback(onReady, []);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    function handleMetadataAdd(msg, { layerId, layerName, layerMetadata }) {
      setMetadata((prevMetadata) => {
        if (prevMetadata[layerName]) {
          // Metadata for this layer has already been added. Just append the layer ID.
          prevMetadata[layerName].ids.add(layerId);
          return prevMetadata;
        }
        return {
          ...prevMetadata,
          [layerName]: {
            ids: new Set([layerId]),
            metadata: layerMetadata,
          },
        };
      });
    }
    function handleMetadataRemove(msg, { layerId, layerName }) {
      setMetadata((prevMetadata) => {
        prevMetadata[layerName].ids.delete(layerId);
        if (prevMetadata[layerName].ids.size < 1) {
          return {
            ...prevMetadata,
            [layerName]: undefined,
          };
        }
        return prevMetadata;
      });
    }
    const metadataAddToken = PubSub.subscribe(METADATA_ADD, handleMetadataAdd);
    const metadataRemoveToken = PubSub.subscribe(METADATA_REMOVE, handleMetadataRemove);
    const resetToken = PubSub.subscribe(RESET, () => setMetadata({}));
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(metadataAddToken);
      PubSub.unsubscribe(metadataRemoveToken);
      PubSub.unsubscribe(resetToken);
    };
  }, [onReadyCallback]);

  return (
    <TitleInfo
      title="Data Set"
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      isReady
    >
      <Description
        description={description}
        metadata={metadata}
      />
    </TitleInfo>
  );
}
