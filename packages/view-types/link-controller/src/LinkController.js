import React, {useMemo, useEffect, useRef, useCallback, useState} from 'react';
import {
  TitleInfo,
  useViewConfigStoreApi,
} from '@vitessce/vit-s';
import {
  FormControlLabel, Switch, Box
} from '@material-ui/core';


export default function LinkController(props) {
  const {
    studyID, linkIDInit, sendInit, receiveInit
  } = props
  const viewConfigStoreApi = useViewConfigStoreApi();

  const [socketOpen, setSocketOpen] = useState(false);
  const [send, setSend] = useState(sendInit)
  const [receive, setReceive] = useState(receiveInit)
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
    if (send && socketOpen) {
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
  }, [id, socketOpen, send]);


  useEffect(() => {
    if (linkIDInit != null) {
      setLinkID(linkIDInit)
    }
    if (linkID == null) {
      fetch("https://nwe7zm1a12.execute-api.us-east-1.amazonaws.com/link?study_id=" + studyID, {
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
            if (receive) {
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
  }, [viewConfigStoreApi, socketOpen, linkID, receive]);

  return (
    <>
      <span>
        <p style={{textAlign: "justify"}}>To join the same session navigate to <a
          href={"https://vitessce.link"}>https://vitessce.link</a> and enter the <b>Code</b> displayed here in the view.
        The <b>send</b> switch controlls sending updates to other instances and the <b>receive</b> switch if this instance wants to listen to updates from the others</p>
        <p style={{fontSize: "45px"}}>Code:&nbsp;&nbsp;<b>{linkID}</b></p>
        <FormControlLabel
          style={{marginLeft: "0px"}}
          control={<Switch color="primary" size={"medium"} checked={send} onChange={e => setSend(e.target.checked)}/>}
          // label="Send"
          label={
            <Box component="div" style={{fontSize: "25px"}}>
              Send Updates:
            </Box>
          }
          labelPlacement="start"
        />
        <FormControlLabel
          style={{marginLeft: "15 px"}}
          control={<Switch color="primary" size={"medium"} checked={receive} onChange={e => setReceive(e.target.checked)}/>}
          // label="Send"
          label={
            <Box component="div" style={{fontSize: "25px"}}>
              Receive Updates:
            </Box>
          }
          labelPlacement="start"
        />
      </span>

    </>
  )
}
