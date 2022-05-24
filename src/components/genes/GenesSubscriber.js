import React, { useEffect } from 'react';
import { pluralize } from '../../utils';
import { useReady, useUrls } from '../hooks';
import { useExpressionAttrs } from '../data-hooks';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

import TitleInfo from '../TitleInfo';
import Genes from './Genes';

const GENES_DATA_TYPES = ['expression-matrix'];

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
 */
export default function GenesSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    variablesLabelOverride: variablesLabel = 'gene',
    variablesPluralLabelOverride: variablesPluralLabel = `${variablesLabel}s`,
    theme,
    title = 'Expression Levels',
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    featureSelection: geneSelection,
    featureFilter: geneFilter,
    obsColorEncoding: cellColorEncoding,
  }, {
    setFeatureSelection: setGeneSelection,
    setFeatureFilter: setGeneFilter,
    setFeatureHighlight: setGeneHighlight,
    setObsColorEncoding: setCellColorEncoding,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.genes, coordinationScopes);

  const [urls, addUrl, resetUrls] = useUrls();
  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady(
    GENES_DATA_TYPES,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [attrs] = useExpressionAttrs(
    loaders, dataset, setItemIsReady, addUrl, true,
  );
  const geneList = attrs ? attrs.cols : [];
  const numGenes = geneList.length;

  function setGeneSelectionAndColorEncoding(newSelection) {
    setGeneSelection(newSelection);
    setCellColorEncoding('geneSelection');
  }

  return (
    <TitleInfo
      title={title}
      info={`${numGenes} ${pluralize(variablesLabel, variablesPluralLabel, numGenes)}`}
      theme={theme}
      // Virtual scroll is used but this allows for the same styling as a scroll component
      // even though this no longer uses the TitleInfo component's
      // scroll css (SelectableTable is virtual scroll).
      isScroll
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      urls={urls}
    >
      <Genes
        hasColorEncoding={cellColorEncoding === 'geneSelection'}
        geneList={geneList}
        geneSelection={geneSelection}
        geneFilter={geneFilter}
        setGeneSelection={setGeneSelectionAndColorEncoding}
        setGeneFilter={setGeneFilter}
        setGeneHighlight={setGeneHighlight}
      />
    </TitleInfo>
  );
}
