import React, { useCallback, useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import { METADATA_ADD } from '../../events';
import TitleInfo from '../TitleInfo';
import Description from './Description';

export default function DescriptionSubscriber(props) {
  const { description, onReady, removeGridComponent } = props;

  const onReadyCallback = useCallback(onReady, []);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    function handleMetadataAdd(msg, { name, metadata: metadataRecord }) {
      setMetadata(prevMetadata => ({ ...prevMetadata, [name]: metadataRecord }));
    }
    const metadataAddToken = PubSub.subscribe(METADATA_ADD, handleMetadataAdd);
    onReadyCallback();
    return () => PubSub.unsubscribe(metadataAddToken);
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
