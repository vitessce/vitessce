import React from 'react';
import {
    TitleInfo
} from '@vitessce/vit-s';
import OrganViewer from './OrganViewer.js';

export function OrganViewerSubscriber(props) {
    const {
        uuidInput,
        removeGridComponent,
        theme,
        title = 'Organ View',
        closeButtonVisible,
    } = props;
    return (
        <TitleInfo
            title={title}
            closeButtonVisible={closeButtonVisible}
            removeGridComponent={removeGridComponent}
            isScroll
            theme={theme}
            isReady={true}
        >
            <OrganViewer
                uuidInput={uuidInput}
            />
        </TitleInfo>
    );
}
