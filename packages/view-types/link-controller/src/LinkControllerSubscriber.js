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
    title = 'Vitessce Link',
    closeButtonVisible,
    linkID
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
      <LinkController linkIDInit={linkID}/>
    </TitleInfo>
  );
}
