import React, {useMemo, useEffect, useRef, useCallback, useState} from 'react';
import {
  TitleInfo,
  useViewConfigStoreApi,
} from '@vitessce/vit-s';
import {
  FormControlLabel, Switch, Box, Checkbox, Grid
} from '@material-ui/core';


export default function LinkController(props) {
  const {
    linkIDInit
  } = props
  const viewConfigStoreApi = useViewConfigStoreApi();

  const [socketOpen, setSocketOpen] = useState(false);
  const [sync, setSync] = useState(true)
  const connection = useRef(null);
  const [linkID, setLinkID] = useState(null)
  const id = useMemo(() => {
    return 'id_' + (Math.floor(Math.random() * 1000));
  }, []);

  // Reference: https://github.com/pmndrs/zustand/tree/v3.7.2?tab=readme-ov-file#readingwriting-state-and-reacting-to-changes-outside-of-components
  //const config = viewConfigStoreApi.getState().viewConfig;
  const setConfig = useCallback((newConfig) => {
    viewConfigStoreApi.setState({viewConfig: newConfig, mostRecentConfigSource: 'external'});
  }, [viewConfigStoreApi]);

  const onConfigChange = useCallback((configValue) => {
    // console.log(send, socketOpen)
    if (sync && socketOpen) {
      try {
        console.log(configValue)
        let configString = id + ';' + btoa(escape(JSON.stringify(configValue)));
        console.log("Send Message")
        connection.current?.send('{"action": "sendMessage","message": "' + configString + '"}');
        // connection.current?.send('{"action": "sendMessage","message": "mesage"}');
      } catch (error) {
        console.log(error)
      }
    }
  }, [id, socketOpen, sync]);


  useEffect(() => {
    if (linkIDInit != null) {
      setLinkID(linkIDInit)
    }
    if (linkID == null) {
      fetch("https://nwe7zm1a12.execute-api.us-east-1.amazonaws.com/link", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }).then(response => response.json()).then(function (response) {
        setLinkID(response.link_id);
      }).catch(function (err) {
        console.log('Fetch Error :-S', err);
      });
    }
  }, [linkID])

  useEffect(() => viewConfigStoreApi.subscribe(
    // The function to run on each publish.
    ({viewConfig, mostRecentConfigSource}) => {
      console.log(viewConfig, mostRecentConfigSource)
      if (onConfigChange && viewConfig && mostRecentConfigSource == 'internal') {
        onConfigChange(viewConfig);
      }
    },
    // The function to specify which part of the store
    // we want to subscribe to.
    state => ({viewConfig: state.viewConfig, mostRecentConfigSource: state.mostRecentConfigSource}),
  ), [viewConfigStoreApi, onConfigChange]);


  useEffect(() => {
    var authToken = 'mr-vitessce';
    if (linkID !== null) {
      console.log("here")
      const ws = new WebSocket('wss://irrmj4anbk.execute-api.us-east-1.amazonaws.com/production', ['Authorization', authToken, linkID]);
      ws.addEventListener('open', (event) => {
        console.log('Open', event);
        setSocketOpen(true);
      });
      ws.addEventListener('connecting', (event) => {
        console.log('Connecting', event);
        setSocketOpen(false);
      })
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
            console.log(JSON.parse(unescape(atob(event.data.split(';')[1]))))
            if (sync) {
              setConfig({
                ...JSON.parse(unescape(atob(event.data.split(';')[1]))),
                uid: 'id' + (Math.floor(Math.random() * 1000))
              });
            }
          }
        }
      });
      connection.current = ws;
      return () => ws.close();
    }
  }, [viewConfigStoreApi, socketOpen, linkID, sync]);

  return (
    <>
      <span>
        <p style={{textAlign: "justify"}}>To join the same session navigate to <a
          href={"https://vitessce.link"}>https://vitessce.link</a> and enter the <b>Link ID</b> displayed here in the view. The session is synced as long as the <b>Link Active</b> Checkbox is activated.</p>
        <Grid container direction="row" style={{gridGap: "10px"}}>
          <Grid item xs={5}>
            <p style={{fontSize: "25px"}}>Link ID:&nbsp;&nbsp;<b>{linkID}</b></p>
          </Grid>
          <Grid item xs={5} style={{fontSize: "25px"}}>
            Link Active: <Checkbox style={{marginTop: "-2px", marginLeft: "-10px"}} color="primary" checked={sync}
                                   onChange={e => setSync(e.target.checked)}/>
          </Grid>
        </Grid>
      </span>
    </>
  )
}
