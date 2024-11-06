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
    linkID, viewTypes, fileTypes, coordinationTypes, stores,
  } = props;

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
      isReady
    >
      <LinkController
        linkIDInit={linkID}
        viewTypes={viewTypes}
        fileTypes={fileTypes}
        stores={stores}
        coordinationTypes={coordinationTypes}
      />
    </TitleInfo>
  );
}
