/* eslint-disable */
import React, { useEffect } from 'react';

import { pluralize } from '../../utils';
import { useReady, useUrls } from '../utils';
import { useExpressionMatrixData } from '../data-hooks';
import { useCoordination } from '../../app/state/hooks';
import { componentCoordinationTypes } from '../../app/state/coordination';

import TitleInfo from '../TitleInfo';
import Genes from './Genes';

export default function GenesSubscriber(props) {
  const {
    loaders,
    coordinationScopes,
    removeGridComponent,
    variablesLabelOverride: variablesLabel = 'gene',
    variablesPluralLabelOverride: variablesPluralLabel = `${variablesLabel}s`,
    theme,
  } = props;

  // Get "props" from the coordination space.
  const [{
    dataset,
    geneSelection,
    geneFilter,
  }, {
    setGeneSelection,
    setGeneFilter,
    setGeneHighlight,
  }] = useCoordination(componentCoordinationTypes.genes, coordinationScopes);

  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    ['expression-matrix'],
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [expressionMatrix] = useExpressionMatrixData(loaders, dataset, setItemIsReady, addUrl, true);
  const geneList = expressionMatrix ? expressionMatrix.cols : [];
  const numGenes = geneList.length;

  return (
    <TitleInfo
      title="Expression Levels"
      info={`${numGenes} ${pluralize(variablesLabel, variablesPluralLabel, numGenes)}`}
      isScroll
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      urls={urls}
    >
      <Genes
        geneList={geneList}
        geneSelection={geneSelection}
        geneFilter={geneFilter}
        setGeneSelection={setGeneSelection}
        setGeneFilter={setGeneFilter}
        setGeneHighlight={setGeneHighlight}
      />
    </TitleInfo>
  );
}
