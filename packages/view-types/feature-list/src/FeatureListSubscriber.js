import React from 'react';
import plur from 'plur';
import { capitalize, commaNumber } from '@vitessce/utils';
import {
  TitleInfo,
  useReady, useUrls,
  useFeatureLabelsData, useObsFeatureMatrixIndices,
  useCoordination, useLoaders,
  registerPluginViewType,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import FeatureList from './FeatureList';


/**
 * A subscriber component for a gene listing component.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 * @param {string} props.variablesLabelOverride The singular form
 * of the name of the variable.
 * @param {string} props.variablesPluralLabelOverride The plural
 * form of the name of the variable.
 * @param {boolean} props.enableMultiSelect If true, allow
 * shift-clicking to select multiple genes.
 */
export function FeatureListSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    variablesLabelOverride,
    theme,
    title: titleOverride,
    enableMultiSelect = true,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    featureType,
    featureSelection: geneSelection,
    featureFilter: geneFilter,
    obsColorEncoding: cellColorEncoding,
  }, {
    setFeatureSelection: setGeneSelection,
    setFeatureFilter: setGeneFilter,
    setFeatureHighlight: setGeneHighlight,
    setObsColorEncoding: setCellColorEncoding,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_LIST], coordinationScopes);

  const variablesLabel = variablesLabelOverride || featureType;

  const title = titleOverride || `${capitalize(variablesLabel)} List`;

  const [urls, addUrl] = useUrls(loaders, dataset);

  // Get data from loaders using the data hooks.
  // TODO: support multiple feature labels using featureLabelsType coordination values.
  const [{ featureLabelsMap }, featureLabelsStatus] = useFeatureLabelsData(
    loaders, dataset, addUrl, false, {}, {},
    { featureType },
  );
  const [{ featureIndex }, matrixIndicesStatus] = useObsFeatureMatrixIndices(
    loaders, dataset, addUrl, true,
    { featureType },
  );
  const isReady = useReady([
    featureLabelsStatus,
    matrixIndicesStatus,
  ]);
  const geneList = featureIndex || [];
  const numGenes = geneList.length;

  function setGeneSelectionAndColorEncoding(newSelection) {
    setGeneSelection(newSelection);
    setCellColorEncoding('geneSelection');
  }

  return (
    <TitleInfo
      title={title}
      info={`${commaNumber(numGenes)} ${plur(variablesLabel, numGenes)}`}
      theme={theme}
      // Virtual scroll is used but this allows for the same styling as a scroll component
      // even though this no longer uses the TitleInfo component's
      // scroll css (SelectableTable is virtual scroll).
      isScroll
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      urls={urls}
    >
      <FeatureList
        hasColorEncoding={cellColorEncoding === 'geneSelection'}
        geneList={geneList}
        featureLabelsMap={featureLabelsMap}
        geneSelection={geneSelection}
        geneFilter={geneFilter}
        setGeneSelection={setGeneSelectionAndColorEncoding}
        setGeneFilter={setGeneFilter}
        setGeneHighlight={setGeneHighlight}
        enableMultiSelect={enableMultiSelect}
      />
    </TitleInfo>
  );
}

export function register() {
  registerPluginViewType(
    ViewType.FEATURE_LIST,
    FeatureListSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_LIST],
  );
}
