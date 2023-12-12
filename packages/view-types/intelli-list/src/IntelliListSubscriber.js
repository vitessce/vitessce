import { COMPONENT_COORDINATION_TYPES, ViewType } from '@vitessce/constants-internal';
import { capitalize } from '@vitessce/utils';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useObsFeatureMatrixIndices,
  useReady, useUrls,
} from '@vitessce/vit-s';

import IntelliList from './IntelliList.js';


export function IntelliListSubscriber(props) {
  const {
    coordinationScopes,
    theme,
    variablesLabelOverride,
    title: titleOverride,
  } = props;

  const loaders = useLoaders();

  const [{
    dataset,
    obsType,
    featureType,
    featureSelection: geneSelection,
  }, {
    setFeatureSelection: setGeneSelection,
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
        onOptionChange={e => setGeneSelection(e.target.value)}
        option={geneSelection}
        options={options}
      />
    </TitleInfo>
  );
}
