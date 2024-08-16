import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import {
    TitleInfo,
    useViewConfigStoreApi,
} from '@vitessce/vit-s';

export default function LinkController(props) {
    const viewConfigStoreApi = useViewConfigStoreApi();

    const [socketOpen, setSocketOpen] = useState(false);
    const [send, setSend] = useState(false)
    const connection = useRef(null);

    const id = useMemo(() => {
        return 'id_' + (Math.floor(Math.random() * 1000));
    }, []);

    // Reference: https://github.com/pmndrs/zustand/tree/v3.7.2?tab=readme-ov-file#readingwriting-state-and-reacting-to-changes-outside-of-components
    //const config = viewConfigStoreApi.getState().viewConfig;
    const setConfig = useCallback((newConfig) => {
        viewConfigStoreApi.setState({viewConfig: newConfig});
    }, [viewConfigStoreApi]);

    const onConfigChange = useCallback((configValue) => {
        console.log(send, socketOpen)
        if (send && socketOpen) {
            try{
                console.log(configValue)
                let configString = id + ';' + btoa(escape(JSON.stringify(configValue)));
                console.log("Send Message")
                connection.current?.send('{"action": "sendMessage","message": "' + configString + '"}');
                // connection.current?.send('{"action": "sendMessage","message": "mesage"}');
            }catch (error){
                console.log(error)
            }
        }
    }, [id, socketOpen, send]);


    useEffect(() => viewConfigStoreApi.subscribe(
        // The function to run on each publish.
        (viewConfig) => {
            if (onConfigChange && viewConfig) {
                console.log("Here")
                onConfigChange(viewConfig);
            }
        },
        // The function to specify which part of the store
        // we want to subscribe to.
        state => state.viewConfig,
    ), [viewConfigStoreApi, onConfigChange]);


    useEffect(() => {
        var authToken = 'mr-vitessce';
        var spaceID = "1234"
        const ws = new WebSocket('wss://irrmj4anbk.execute-api.us-east-1.amazonaws.com/production', ['Authorization', authToken, spaceID]);
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
                    setConfig({
                        ...JSON.parse(unescape(atob(event.data.split(';')[1]))),
                        uid: 'id' + (Math.floor(Math.random() * 1000))
                    });
                }
            }
        });
        connection.current = ws;
        return () => ws.close();
    }, [viewConfigStoreApi, socketOpen]);


    return (
        <>
            <span>Send:
                <input type={"checkbox"} name={"send"} defaultChecked={false} onChange={e => setSend(e.target.checked)} />
            </span>
            <p>Your code is 1234.</p>
        </>
    )
}
