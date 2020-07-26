import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import PubSub from 'pubsub-js';
import {
  EXPRESSION_MATRIX_ADD, CELLS_COLOR, CLEAR_PLEASE_WAIT, RESET,
} from '../../events';
import { interpolatePlasma } from '../interpolate-colors';
import { fromEntries, pluralize } from '../utils';
import TitleInfo from '../TitleInfo';
import Genes from './Genes';

export default function GenesSubscriber(props) {
  const {
    onReady,
    removeGridComponent,
    variablesLabelOverride: variablesLabel = 'gene',
    theme,
  } = props;

  const [expressionMatrix, setExpressionMatrix] = useState();
  const [selectedId, setSelectedId] = useState(null);
  const [urls, setUrls] = useState([]);

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    const expressionMatrixAddToken = PubSub.subscribe(
      EXPRESSION_MATRIX_ADD, (msg, { data }) => {
        const [attrs, arr] = data;

        arr.get([null, null]).then((X) => {
          setExpressionMatrix({
            cols: attrs.cols,
            rows: attrs.rows,
            matrix: X,
          });
        });
      },
    );
    const resetToken = PubSub.subscribe(RESET, () => {
      setUrls([]);
      setExpressionMatrix(null);
      setSelectedId({});
    });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(expressionMatrixAddToken);
      PubSub.unsubscribe(resetToken);
    };
  }, [onReadyCallback]);

  const setSelectedGene = useCallback((newSelectedId) => {
    setSelectedId(newSelectedId);

    if (expressionMatrix) {
      const colI = expressionMatrix.cols.indexOf(newSelectedId);
      if (colI !== -1) {
        // Create new cellColors map based on the selected gene.
        const cellColors = new Map(expressionMatrix.rows.map((cellId, rowI) => {
          const value = expressionMatrix.matrix.data[rowI][colI];
          const cellColor = interpolatePlasma(value / 255);
          return [cellId, cellColor];
        }));
        PubSub.publish(CELLS_COLOR, cellColors);
      }
    }
  }, [expressionMatrix]);

  const genesSelected = useMemo(() => {
    if (!expressionMatrix) {
      return {};
    }
    return fromEntries(expressionMatrix.cols.map(geneId => [geneId, geneId === selectedId]));
  }, [expressionMatrix, selectedId]);

  const numGenes = expressionMatrix ? expressionMatrix.cols.length : 0;

  return (
    <TitleInfo
      title="Expression Levels"
      info={`${numGenes} ${pluralize(variablesLabel, numGenes)}`}
      isScroll
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
    >
      <Genes
        genesSelected={genesSelected}
        setSelectedGene={setSelectedGene}
        clearPleaseWait={
          layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
        }
      />
    </TitleInfo>
  );
}
