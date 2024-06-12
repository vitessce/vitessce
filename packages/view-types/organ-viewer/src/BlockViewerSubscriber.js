import React from 'react';
import {
    TitleInfo
} from '@vitessce/vit-s';
import BlockViewer from './BlockViewer.js';

export function BlockViewerSubscriber(props) {
    const {
        removeGridComponent,
        theme,
        title = 'Block View',
        closeButtonVisible,
        uuidInput,
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
            <BlockViewer
                uuidInput={uuidInput}
            />
        </TitleInfo>
    );
}
