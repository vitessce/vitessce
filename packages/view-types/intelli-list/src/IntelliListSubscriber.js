import { COMPONENT_COORDINATION_TYPES, ViewType } from '@vitessce/constants-internal';
import { capitalize } from '@vitessce/utils';
import {
  TitleInfo,
  useCoordination,
  useFeatureLabelsData,
  useLoaders,
  useObsFeatureMatrixIndices,
  useReady, useUrls,
} from '@vitessce/vit-s';
import { useEffect, useState } from 'react';

import IntelliList from './IntelliList.js';


export function IntelliListSubscriber(props) {
  const {
    coordinationScopes,
    theme,
    variablesLabelOverride,
    title: titleOverride,
  } = props;

  const [option, setOption] = useState(null);


  const loaders = useLoaders();

  const [{
    dataset,
    obsType,
    featureType,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_LIST], coordinationScopes);

  const variablesLabel = variablesLabelOverride || featureType;
  const title = titleOverride || `${capitalize(variablesLabel)} List`;


  const [{ featureIndex }, matrixIndicesStatus, obsFeatureMatrixUrls] = useObsFeatureMatrixIndices(
    loaders, dataset, true,
    { obsType, featureType },
  );
  const isReady = useReady([
    matrixIndicesStatus,
  ]);
  const urls = useUrls([
    obsFeatureMatrixUrls,
  ]);

  useEffect(() => {
    if (isReady) {
      setOption(featureIndex[0]);
    }
  }, [isReady, featureIndex]);

  const options = featureIndex || [];


  return (
    <TitleInfo
      title={title}
      isScroll
      theme={theme}
      isReady={isReady}
      urls={urls}
    >
      <IntelliList
        onOptionChange={e => setOption(e.target.value)}
        option={option}
        options={options}
      />
    </TitleInfo>
  );
}
