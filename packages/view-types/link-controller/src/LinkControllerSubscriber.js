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
    studyID,
    linkIDInit
  } = props;

  const [linkID, setLinkID] = useState(null)

  useEffect(() => {
    if(linkIDInit != null) {
      setLinkID(linkIDInit)
    }
    if (linkID == null) {
      fetch("https://nwe7zm1a12.execute-api.us-east-1.amazonaws.com/link?study_id=" + studyID, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }).then(response => response.json()).then(function (response) {
        console.log(response.link_id)
        setLinkID(response.link_id);
      }).catch(function (err) {
        console.log('Fetch Error :-S', err);
      });
    }
  }, [linkID])


  return (
    <TitleInfo
      title={title}
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      isReady={true}
    >
      <LinkController linkID={linkID}/>
    </TitleInfo>
  );
}
