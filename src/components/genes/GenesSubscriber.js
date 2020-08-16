/* eslint-disable */
import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';

import { pluralize } from '../../utils';
import { useReady } from '../utils';
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

  const [{
    dataset,
    geneSelection,
    geneFilter,
  }, {
    setGeneSelection,
    setGeneFilter,
    setGeneHighlight,
  }] = useCoordination(componentCoordinationTypes.genes, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    ['expression-matrix'],
  );

  const [geneList, setGeneList] = useState([]);


  useEffect(() => {
    resetReadyItems();

    if(!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders['expression-matrix']) {
      loaders[dataset].loaders['expression-matrix'].load().then(({ data }) => {
        const [attrs] = data;
        setGeneList(attrs.cols);
        setItemIsReady('expression-matrix');
      });
    } else {
      // If no gene expression loader is available, set to null.
      setGeneList([]);
      // But do not set to ready,
      // since expression matrix is not optional for genes component.
      console.warn('Genes component requires expression-matrix data type.');
    }
  }, [loaders, dataset]);

  const numGenes = geneList.length;

  return (
    <TitleInfo
      title="Expression Levels"
      info={`${numGenes} ${pluralize(variablesLabel, variablesPluralLabel, numGenes)}`}
      isScroll
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
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
