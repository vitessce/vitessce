/* eslint-disable no-console */
import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { shallow } from 'zustand/shallow';
import {
  useViewConfigStoreApi,
  createLoaders,
} from '@vitessce/vit-s';
import {
  Checkbox,
  Grid,
} from '@vitessce/styles';

import { log } from '@vitessce/globals';

export default function LinkController(props) {
  const {
    linkIDInit,
    authToken,
    linkEndpoint,
    websocketEndpoint,
    fileTypes,
    coordinationTypes,
    stores,
  } = props;
  const viewConfigStoreApi = useViewConfigStoreApi();

  const [socketOpen, setSocketOpen] = useState(false);
  const [sync, setSync] = useState(true);
  const connection = useRef(null);
  const [linkID, setLinkID] = useState(null);
  const id = useMemo(() => `id_${Math.floor(Math.random() * 1000)}`, []);

  // Reference: https://github.com/pmndrs/zustand/tree/v3.7.2?tab=readme-ov-file#readingwriting-state-and-reacting-to-changes-outside-of-components
  const setConfig = useCallback((newConfig) => {
    viewConfigStoreApi.setState({
      viewConfig: newConfig,
      mostRecentConfigSource: 'external',
      loaders: createLoaders(
        newConfig.datasets,
        newConfig.description,
        fileTypes,
        coordinationTypes,
        stores,
      ),
    });
  }, [viewConfigStoreApi]);

  const onConfigChange = useCallback((configValue) => {
    if (sync && socketOpen) {
      try {
        const configString = `${id};${btoa(encodeURI(JSON.stringify(configValue)))}`;
        const message = {
          action: 'sendMessage',
          message: configString,
        };
        connection.current?.send(JSON.stringify(message));
      } catch (error) {
        log.error('Unable to send Configuration to Server', error);
      }
    }
  }, [id, socketOpen, sync]);

  useEffect(() => {
    if (linkIDInit != null) {
      setLinkID(linkIDInit);
    }
    if (linkID === null) {
      fetch(linkEndpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }).then(response => response.json()).then((response) => {
        setLinkID(response.link_id);
      }).catch((err) => {
        log.error('Fetch Error :-S', err);
      });
    }
  }, [linkID, linkEndpoint]);

  useEffect(() => viewConfigStoreApi.subscribe(
    state => ({
      viewConfig: state.viewConfig,
      mostRecentConfigSource: state.mostRecentConfigSource,
    }),
    ({ viewConfig, mostRecentConfigSource }) => {
      if (onConfigChange && viewConfig && mostRecentConfigSource === 'internal') {
        onConfigChange(viewConfig);
      }
    },
    { equalityFn: shallow },
  ), [viewConfigStoreApi, onConfigChange]);


  useEffect(() => {
    if (linkID !== null) {
      const ws = new WebSocket(websocketEndpoint, ['Authorization', authToken, linkID]);
      ws.addEventListener('open', (event) => {
        log.log('Open', event);
        setSocketOpen(true);
      });
      ws.addEventListener('connecting', (event) => {
        log.log('Connecting', event);
        setSocketOpen(false);
      });
      ws.addEventListener('error', (event) => {
        log.log('Error', event);
      });
      ws.addEventListener('close', (event) => {
        log.log('Close', event);
      });
      ws.addEventListener('message', (event) => {
        log.log('Message', event);
        const eventData = event.data;
        if (eventData.includes(';')) {
          if (eventData.split(';')[0] === id) {
            log.log('Message from ourselves');
          } else {
            log.log('Message from server ');
            if (sync) {
              setConfig({
                ...JSON.parse(decodeURI(atob(eventData.split(';')[1]))),
                uid: `id${Math.floor(Math.random() * 1000)}`,
              });
            }
          }
        }
      });
      connection.current = ws;
      return () => ws.close();
    }
    // No-op when websocket was not constructed.
    return () => {};
  }, [viewConfigStoreApi, socketOpen, linkID, sync, authToken, websocketEndpoint]);

  return (
    <>
      <span>
        <p style={{ textAlign: 'justify' }}>
          To join the same session navigate to <a href="https://vitessce.link">https://vitessce.link</a> and enter the <b>Link ID</b> displayed here in the view.
          The session is synced as long as the <b>Link Active</b> Checkbox is activated.
        </p>
        <Grid container direction="row" sx={{ gridGap: '10px' }}>
          <Grid size={5} sx={{ whiteSpace: 'nowrap' }}>
            <p style={{ fontSize: '25px' }}>Link ID:&nbsp;&nbsp;<b>{linkID}</b></p>
          </Grid>
          <Grid size={5} sx={{ fontSize: '25px', whiteSpace: 'nowrap' }}>
            Link Active: <Checkbox
              sx={{ marginTop: '-2px', marginLeft: '-10px' }}
              color="primary"
              checked={sync}
              onChange={e => setSync(e.target.checked)}
            />
          </Grid>
        </Grid>
      </span>
    </>
  );
}
