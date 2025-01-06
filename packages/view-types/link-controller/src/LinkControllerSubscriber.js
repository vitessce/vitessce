import React from 'react';
import {
  TitleInfo,
} from '@vitessce/vit-s';
import LinkController from './LinkController.js';

export function LinkControllerSubscriber(props) {
  const {
    removeGridComponent,
    theme,
    title = 'Vitessce Link',
    closeButtonVisible,
    // Props for the link controller:
    linkID,
    authToken = 'mr-vitessce',
    linkEndpoint = 'https://nwe7zm1a12.execute-api.us-east-1.amazonaws.com/link',
    websocketEndpoint = 'wss://irrmj4anbk.execute-api.us-east-1.amazonaws.com/production',
    // Props injected by VitessceGridLayout:
    fileTypes,
    coordinationTypes,
    stores,
  } = props;

  return (
    <TitleInfo
      title={title}
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      isReady
    >
      <LinkController
        linkIDInit={linkID}
        authToken={authToken}
        linkEndpoint={linkEndpoint}
        websocketEndpoint={websocketEndpoint}
        fileTypes={fileTypes}
        stores={stores}
        coordinationTypes={coordinationTypes}
      />
    </TitleInfo>
  );
}
