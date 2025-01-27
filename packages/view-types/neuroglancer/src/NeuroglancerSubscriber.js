
import {
  TitleInfo,
} from '@vitessce/vit-s';

import { Neuroglancer } from './Neuroglancer.js';

export function NeuroglancerSubscriber(props) {
  const {
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Neuroglancer',
    viewerState: viewerStateInitial = null,
  } = props;

  return (
    <TitleInfo
      title={title}
      isSpatial
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady
    >
      {viewerStateInitial && <Neuroglancer viewerState={viewerStateInitial} />}
    </TitleInfo>

  );
}
