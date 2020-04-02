/* eslint-disable */
import React, { useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';

import {
    RASTER_ADD
} from '../../events';

import TitleInfo from '../TitleInfo';
import GroupSelector from './GroupSelector';

export default function GroupSelectorSubscriber({ onReady, removeGridComponent }) {

    const memoizedOnReady = useCallback(onReady, []);

    useEffect(() => {
        function handleAdd(msg, data) {
            console.log(data);
        }

        memoizedOnReady();

        const token = PubSub.subscribe(RASTER_ADD, handleAdd);
        return () => {
            PubSub.unsubscribe(token);
        };
    }, [memoizedOnReady]);

    return (
        <TitleInfo title="Groups" isScroll removeGridComponent={removeGridComponent}>
            <GroupSelector 
                updateSelection={message => PubSub.publish(STATUS_INFO, message)}
            />
        </TitleInfo>
    );
}
