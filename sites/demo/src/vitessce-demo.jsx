/* eslint-disable no-console */
import React, {
  useEffect, useRef, useState, useMemo,
} from 'react';
import { Vitessce } from 'vitessce';

import { getConfig, listConfigs, getPlugins } from './api.js';
import { Welcome } from './welcome.jsx';
import { Warning } from './warning.jsx';
import PieSocket from 'piesocket-js';

import './index.scss';
import { setConfig } from 'isomorphic-git';

function AwaitResponse(props) {
  const {
    response,
    theme,
  } = props;
  const [isLoading, setIsLoading] = useState(true);
  const responseRef = useRef();
  useEffect(() => {
    response.then((c) => {
      responseRef.current = c;
      setIsLoading(false);
    });
  }, [response]);
  return (!isLoading ? React.createElement(responseRef.current) :
    <Warning title="Loading..." theme={theme}/>);
}

function preformattedDetails(response) {
  return `
    ok: ${response.ok}
    status: ${response.status}
    statusText: ${response.statusText}
    redirected: ${response.redirected}
    type: ${response.type}
    url: ${response.url}`; // TODO: headers
}

function logConfigUpgrade(prevConfig, nextConfig) {
  // eslint-disable-next-line no-console
  console.log(`Upgrade view config schema from ${prevConfig.version} to ${nextConfig.version}`);
  // eslint-disable-next-line no-console
  console.log(prevConfig);
  // eslint-disable-next-line no-console
  console.log(nextConfig);
}

function checkResponse(response, theme, debug) {
  if (!response.ok) {
    return Promise.resolve(
      () => (
        <Warning
          title="Fetch response not OK"
          preformatted={preformattedDetails(response)}
          theme={theme}
        />
      ),
    );
  }
  return response.text()
    .then((text) => {
      try {
        const config = JSON.parse(text);
        return Promise.resolve(() => (
          <Vitessce
            config={config}
            theme={theme}
            onConfigChange={debug ? console.log : undefined}
            onConfigUpgrade={debug ? logConfigUpgrade : undefined}
            validateOnConfigChange={debug}
          />
        ));
      } catch (e) {
        return Promise.resolve(() => (
          <Warning
            title="Error parsing JSON"
            preformatted={preformattedDetails(response)}
            unformatted={`${e.message}: ${text}`}
            theme={theme}
          />
        ));
      }
    });
}

/**
 * Use the theme provided if it is valid, otherwise fall back to the 'dark' theme.
 * @param {string} theme A potentially invalid theme name.
 * @returns {string} A valid theme name.
 */
function validateTheme(theme) {
  return (['light', 'dark'].includes(theme) ? theme : 'dark');
}

export function VitessceDemo() {
  //Saving Config and sharing Via Websockets
  const [socket, setSocket] = useState(undefined);
  const [channel, setChannel] = useState(undefined);
  const [socketOpen, setSocketOpen] = useState(false);
  const [config, setConfig] = useState(undefined);

  const urlParams = new URLSearchParams(window.location.search);
  const websocket = urlParams.get('ws') === 'true';
  const spaceID = urlParams.get('code');
  const id = 'id_' + (Math.floor(Math.random() * 1000));
  const send = urlParams.get('send') === 'true';


  const connection = useRef(null);
  if (websocket) {
    var authToken = 'mr-vitessce';
    useEffect(() => {
      const socket = new WebSocket('wss://irrmj4anbk.execute-api.us-east-1.amazonaws.com/production', ['Authorization',authToken,spaceID]);
      console.log(socket);
      // Connection opened
      socket.addEventListener('open', (event) => {
        console.log('Connection established');
        socket.send('test');
        setSocketOpen(true);
      });
      socket.addEventListener('error', (event) => {
        console.log("Error ", event)
      });
      socket.addEventListener('close', (event) => {
        console.log("Close ", event)
      });
      // Listen for messages
      socket.addEventListener('message', (event) => {
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
      connection.current = socket;
      return () => connection.current.close();
    }, []);
  }

  //if (websocket) {
  //   useEffect(() => {
  //      if (socket === undefined) {
  //
  //         //document.cookie = 'Authorization: ' + authToken + '; path=/';
  //         let socketInit = new WebSocket("wss://irrmj4anbk.execute-api.us-east-1.amazonaws.com/production", authToken);
  //         setSocket(socketInit);
  //        socketInit.onopen = (event) => {
  //           console.log("Socket is open", event)
  //        };
  //       socketInit.onmessage = (event) => {
  //           console.log(event.data);
  //       };
  //   }
  //}, [socket])

  //useEffect(() => {

  //     ws?.onmessage = (event) => {
  //         console.log(event.data);
  //     };
  //     ws?.subscribe(channelID).then((chan) => {
  //         // console.log("Channel is ready")
  //         chan.listen("new_message", (data, meta) => {
  //             // console.log(data.sender, ws?.options.userId)
  //             if (data.sender !== ws?.options.userId) {
  //                 // console.log("New Message:", data);
  //                 setConfig({...data.message, uid: "id" + (Math.floor(Math.random() * 1000))});
  //             }
  //         })
  //         chan.listen("system:member_joined", function (data) {
  //             console.log("New member joined the chat " + data.member.user);
  //         })
  //         setChannel(chan);
  //     })
  // }, [channel, socket])
  //}

  const result = useMemo(() => {
    const { rowHeight = null } = {};
    const urlParams = new URLSearchParams(window.location.search);
    const datasetId = urlParams.get('dataset');
    const debug = urlParams.get('debug') === 'true';
    const datasetUrl = urlParams.get('url');
    const showAll = urlParams.get('show') === 'all';
    const theme = validateTheme(urlParams.get('theme'));
    const isBounded = urlParams.get('isBounded') === 'true';
    const strictMode = urlParams.get('strictMode') === 'true';

    const ContainerComponent = strictMode ? React.StrictMode : React.Fragment;

    if (datasetId) {
      const configFromDataSetId = getConfig(datasetId);
      if (config === undefined) {
        setConfig(configFromDataSetId);
      }
      const pluginProps = getPlugins(datasetId);
      // console.log("Getting in with a new Config ", config)
      return (
        <ContainerComponent>
          <Vitessce
            config={config !== undefined ? config : configFromDataSetId}
            rowHeight={rowHeight}
            theme={theme}
            onConfigChange={(configValue) => {
              if (send && socketOpen) {
                let configString = id + ';' + btoa(JSON.stringify(configValue));
                connection.current?.send('{"action": "sendMessage","message": "' + configString + '"}');
              }
            }}
            onConfigUpgrade={(configValue) => {
              //console.log("Upgrade of Config inside:", configValue)
            }}
            validateOnConfigChange={debug}
            isBounded={isBounded}
            {...pluginProps}
          />
        </ContainerComponent>
      );
    }
    if (datasetUrl) {
      const responsePromise = fetch(datasetUrl)
        .then(response => checkResponse(response, theme, debug))
        .catch(error => Promise.resolve(() => (
          <Warning
            title="Error fetching"
            unformatted={error.message}
            theme={theme}
          />
        )));
      return (
        <ContainerComponent>
          <AwaitResponse response={responsePromise} theme={theme}/>
        </ContainerComponent>
      );
    }
    const configs = listConfigs(showAll);
    return (<Welcome configs={configs} theme={theme}/>);
  }, [window.location.search, channel, config, socket, socketOpen]);
  return (
    <>
      <style>{`
      html, body {
        height: 100%;
      }
      body {
        display: flex;
        flex-direction: column;
      }
      #root {
        flex: 1;
      }
      #root .welcome-container {
        font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
        height: max(100%, 100vh);
        width: 100%;
        overflow: scroll;
        background-color: #333333;
      }
      #root .vitessce-container {
        height: max(100%,100vh);
        width: 100%;
        overflow: hidden;
      }
      `}
      </style>
      {result}
    </>
  );
}
