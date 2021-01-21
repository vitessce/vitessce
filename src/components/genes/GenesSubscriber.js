import React, { useEffect } from 'react';
import { pluralize } from '../../utils';
import { useReady, useUrls } from '../hooks';
import { useExpressionMatrixData } from '../data-hooks';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

import TitleInfo from '../TitleInfo';
import Genes from './Genes';

const GENES_DATA_TYPES = ['expression-matrix'];

export default function GenesSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    variablesLabelOverride: variablesLabel = 'gene',
    variablesPluralLabelOverride: variablesPluralLabel = `${variablesLabel}s`,
    theme,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    geneSelection,
    geneFilter,
    cellColorEncoding,
  }, {
    setGeneSelection,
    setGeneFilter,
    setGeneHighlight,
    setCellColorEncoding,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.genes, coordinationScopes);

  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    GENES_DATA_TYPES,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );
  const geneList = expressionMatrix ? expressionMatrix.cols : [];
  const numGenes = geneList.length;

  function setGeneSelectionAndColorEncoding(newSelection) {
    setGeneSelection(newSelection);
    setCellColorEncoding('geneSelection');
  }

  return (
    <TitleInfo
      title="Expression Levels"
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
