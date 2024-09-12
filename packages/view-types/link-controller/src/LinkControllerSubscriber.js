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
    linkID, viewTypes, fileTypes, coordinationTypes, stores
  } = props;

  console.log("viewTypes", viewTypes, "fileTypes", fileTypes, "coordinationTypes", coordinationTypes, "stores", stores)

  return (
    <TitleInfo
      title={title}
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      viewTypes={viewTypes}
      fileTypes={fileTypes}
      stores={stores}
      coordinationTypes={coordinationTypes}
      isReady={true}
    >
      <LinkController linkIDInit={linkID} viewTypes={viewTypes}
                      fileTypes={fileTypes}
                      stores={stores}
                      coordinationTypes={coordinationTypes}/>
    </TitleInfo>
  );
}
