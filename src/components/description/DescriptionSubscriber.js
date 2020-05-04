import React, { useCallback, useEffect } from 'react';
import PubSub from 'pubsub-js';
import { RASTER_ADD } from '../../events';
import TitleInfo from '../TitleInfo';
import Description from './Description';

export default function DescriptionSubscriber(props) {
  const { description, onReady, removeGridComponent } = props;

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    function handleRasterAdd(msg, raster) {
      // eslint-disable-next-line
          console.log(raster);
    }
    onReadyCallback();
    const token = PubSub.subscribe(RASTER_ADD, handleRasterAdd);
    return () => PubSub.unsubscribe(token);
  }, [onReadyCallback]);

  return (
    <TitleInfo
      title="Data Set"
      removeGridComponent={removeGridComponent}
      isScroll
    >
      <Description
        description={description}
      />
    </TitleInfo>
  );
}
