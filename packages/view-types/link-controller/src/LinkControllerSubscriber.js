import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import {
  TitleInfo,
  useViewConfigStoreApi,
} from '@vitessce/vit-s';
import LinkController from './LinkController.js';

const send = true;

export function LinkControllerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Link Controller',
    closeButtonVisible,
  } = props;

  const [socketOpen, setSocketOpen] = useState(false);
  const connection = useRef(null);

  const id = useMemo(() => {
    return 'id_' + (Math.floor(Math.random() * 1000));
  }, []);

  const viewConfigStoreApi = useViewConfigStoreApi();

  // Reference: https://github.com/pmndrs/zustand/tree/v3.7.2?tab=readme-ov-file#readingwriting-state-and-reacting-to-changes-outside-of-components
  //const config = viewConfigStoreApi.getState().viewConfig;
  const setConfig = useCallback((newConfig) => {
    viewConfigStoreApi.setState({ viewConfig: newConfig });
  }, [viewConfigStoreApi]);

  const onConfigChange = useCallback((configValue) => {
    if (send && socketOpen) {
      let configString = id + ';' + btoa(JSON.stringify(configValue));
      console.log("Send Message")
      connection.current?.send('{"action": "sendMessage","message": "' + configString + '"}');
    }
  }, [id]);

  useEffect(() => viewConfigStoreApi.subscribe(
    // The function to run on each publish.
    (viewConfig) => {
      if (onConfigChange && viewConfig) {
        onConfigChange(viewConfig);
      }
    },
    // The function to specify which part of the store
    // we want to subscribe to.
    state => state.viewConfig,
  ), [viewConfigStoreApi, onConfigChange]);



  useEffect(() => {
    const ws = new WebSocket('ws://something');
    ws.addEventListener('open', (event) => {
      console.log('Open', event);
      ws.send('test');
      setSocketOpen(true);
    });
    ws.addEventListener('error', (event) => {
      console.log("Error", event)
    });
    ws.addEventListener('close', (event) => {
      console.log("Close", event)
    });
    ws.addEventListener('message', (event) => {
      console.log('Message', event);
      if (event.data.includes(';')) {
        if (event.data.split(';')[0] == id) {
          console.log('Message from ourselves');
        } else {
          console.log('Message from server ');
          setConfig({
            ...JSON.parse(atob(event.data.split(';')[1])),
            uid: 'id' + (Math.floor(Math.random() * 1000))
          });
        }
      }
    });
    connection.current = ws;
    return () => ws.close();
  }, [viewConfigStoreApi]);



  return (
    <TitleInfo
      title={title}
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      isReady={true}
    >
      <LinkController />
    </TitleInfo>
  );
}
