import React, { useState } from 'react';
import { pluralize as plur, capitalize, commaNumber } from '@vitessce/utils';
import {
  TitleInfo,
  useReady, useUrls,
  useFeatureLabelsData, useObsFeatureMatrixIndices,
  useCoordination, useLoaders,
  useExpandedFeatureLabelsMap,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import FeatureList from './FeatureList.js';
import FeatureListOptions from './FeatureListOptions.js';


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
 * @param {boolean} props.showTable If true, shows a table with the feature name and id.
 * @param {'alphabetical'|'original'} props.sort The sort order of the genes. If sort is defined and
 * it is not equal to `alphabetical`, the genes will be displayed in the feature list in
 * the original order.
 * @param {'featureIndex'|'featureLabels'|null} props.sortKey The information to use for sorting.
 */
export function FeatureListSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    variablesLabelOverride,
    theme,
    title: titleOverride,
    enableMultiSelect = false,
    showTable = false,
    sort = 'alphabetical',
    sortKey = null,
    closeButtonVisible,
    downloadButtonVisible,
    helpText = ViewHelpMapping.FEATURE_LIST,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
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

  // Get data from loaders using the data hooks.
  // TODO: support multiple feature labels using featureLabelsType coordination values.
  const [{ featureLabelsMap }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  const [expandedFeatureLabelsMap, expandedFeatureLabelsStatus] = useExpandedFeatureLabelsMap(
    featureType, featureLabelsMap, { stripCuriePrefixes: true },
  );
  const [{ featureIndex }, matrixIndicesStatus, obsFeatureMatrixUrls] = useObsFeatureMatrixIndices(
    loaders, dataset, true,
    { obsType, featureType },
  );
  const isReady = useReady([
    featureLabelsStatus,
    expandedFeatureLabelsStatus,
    matrixIndicesStatus,
  ]);
  const urls = useUrls([
    featureLabelsUrls,
    obsFeatureMatrixUrls,
  ]);

  const geneList = featureIndex || [];
  const numGenes = geneList.length;
  const hasFeatureLabels = Boolean(expandedFeatureLabelsMap);

  function setGeneSelectionAndColorEncoding(newSelection) {
    setGeneSelection(newSelection);
    setCellColorEncoding('geneSelection');
  }
  const [showFeatureTable, setShowFeatureTable] = useState(showTable);
  const [featureListSort, setFeatureListSort] = useState(sort);
  const [featureListSortKey, setFeatureListSortKey] = useState(null);
  const initialSortKey = sortKey || (hasFeatureLabels ? 'featureLabels' : 'featureIndex');

  const primaryColumnName = `${capitalize(featureType)} ID`;

  return (
    <TitleInfo
      title={title}
      info={`${commaNumber(numGenes)} ${plur(variablesLabel, numGenes)}`}
      theme={theme}
      // Virtual scroll is used but this allows for the same styling as a scroll component
      // even though this no longer uses the TitleInfo component's
      // scroll css (SelectableTable is virtual scroll).
      isScroll
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      urls={urls}
      helpText={helpText}
      options={(
        <FeatureListOptions
          featureListSort={featureListSort}
          setFeatureListSort={setFeatureListSort}
          featureListSortKey={featureListSortKey || initialSortKey}
          setFeatureListSortKey={setFeatureListSortKey}
          showFeatureTable={showFeatureTable}
          setShowFeatureTable={setShowFeatureTable}
          hasFeatureLabels={hasFeatureLabels}
          primaryColumnName={primaryColumnName}
        />
      )}
    >
      <FeatureList
        hasColorEncoding={cellColorEncoding === 'geneSelection'}
        showFeatureTable={showFeatureTable}
        geneList={geneList}
        featureListSort={featureListSort}
        featureListSortKey={featureListSortKey || initialSortKey}
        featureLabelsMap={expandedFeatureLabelsMap}
        featureType={featureType}
        geneSelection={geneSelection}
        geneFilter={geneFilter}
        setGeneSelection={setGeneSelectionAndColorEncoding}
        setGeneFilter={setGeneFilter}
        setGeneHighlight={setGeneHighlight}
        enableMultiSelect={enableMultiSelect}
        hasFeatureLabels={hasFeatureLabels}
        primaryColumnName={primaryColumnName}
      />
    </TitleInfo>
  );
}
