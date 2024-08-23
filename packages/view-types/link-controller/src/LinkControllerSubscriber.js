import React, {useMemo, useEffect, useRef, useCallback, useState} from 'react';
import {
  TitleInfo,
  useViewConfigStoreApi,
} from '@vitessce/vit-s';
import LinkController from './LinkController.js';

export function LinkControllerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Link Controller',
    closeButtonVisible,
    studyID, linkID, send, receive
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
      <LinkController studyID={studyID} linkIDInit={linkID} sendInit={send} receiveInit={receive}/>
    </TitleInfo>
  );
}
