import React, { useCallback, useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import { METADATA_ADD, METADATA_REMOVE } from '../../events';
import TitleInfo from '../TitleInfo';
import Description from './Description';

export default function DescriptionSubscriber(props) {
  const { description, onReady, removeGridComponent } = props;

  const onReadyCallback = useCallback(onReady, []);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    function handleMetadataAdd(msg, { layerId, layerName, layerMetadata }) {
      setMetadata(prevMetadata => ({ ...prevMetadata, [layerId]: { layerName, layerMetadata } }));
    }
    function handleMetadataRemove(msg, layerId) {
      setMetadata(prevMetadata => ({ ...prevMetadata, [layerId]: undefined }));
    }
    const metadataAddToken = PubSub.subscribe(METADATA_ADD, handleMetadataAdd);
    const metadataRemoveToken = PubSub.subscribe(METADATA_REMOVE, handleMetadataRemove);
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(metadataAddToken);
      PubSub.unsubscribe(metadataRemoveToken);
    };
  }, [onReadyCallback]);

  return (
    <TitleInfo
      title="Data Set"
      removeGridComponent={removeGridComponent}
      isScroll
    >
      <Description
        description={description}
        metadata={metadata}
      />
    </TitleInfo>
  );
}
