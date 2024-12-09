/* eslint-disable no-console */
import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import {
  useViewConfigStoreApi,
  createLoaders,
} from '@vitessce/vit-s';
import {
  Checkbox,
  Grid,
} from '@material-ui/core';


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
        console.error('Unable to send Configuration to Server', error);
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
        console.error('Fetch Error :-S', err);
      });
    }
  }, [linkID, linkEndpoint]);

  useEffect(() => viewConfigStoreApi.subscribe(
    ({ viewConfig, mostRecentConfigSource }) => {
      if (onConfigChange && viewConfig && mostRecentConfigSource === 'internal') {
        onConfigChange(viewConfig);
      }
    },
    state => ({
      viewConfig: state.viewConfig,
      mostRecentConfigSource: state.mostRecentConfigSource,
    }),
  ), [viewConfigStoreApi, onConfigChange]);


  useEffect(() => {
    if (linkID !== null) {
      const ws = new WebSocket(websocketEndpoint, ['Authorization', authToken, linkID]);
      ws.addEventListener('open', (event) => {
        console.log('Open', event);
        setSocketOpen(true);
      });
      ws.addEventListener('connecting', (event) => {
        console.log('Connecting', event);
        setSocketOpen(false);
      });
      ws.addEventListener('error', (event) => {
        console.log('Error', event);
      });
      ws.addEventListener('close', (event) => {
        console.log('Close', event);
      });
      ws.addEventListener('message', (event) => {
        console.log('Message', event);
        const eventData = event.data;
        if (eventData.includes(';')) {
          if (eventData.split(';')[0] === id) {
            console.log('Message from ourselves');
          } else {
            console.log('Message from server ');
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
        <Grid container direction="row" style={{ gridGap: '10px' }}>
          <Grid item xs={5} style={{ whiteSpace: 'nowrap' }}>
            <p style={{ fontSize: '25px' }}>Link ID:&nbsp;&nbsp;<b>{linkID}</b></p>
          </Grid>
          <Grid item xs={5} style={{ fontSize: '25px', whiteSpace: 'nowrap' }}>
            Link Active: <Checkbox
              style={{ marginTop: '-2px', marginLeft: '-10px' }}
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
