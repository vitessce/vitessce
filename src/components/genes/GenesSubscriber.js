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

  const [expression, setExpression] = useState();
  const [selectedId, setSelectedId] = useState(null);
  const [urls, setUrls] = useState([]);

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    const expressionMatrixAddToken = PubSub.subscribe(
      EXPRESSION_MATRIX_ADD, (msg, { data }) => {
        const [attrs, arr] = data;

        arr.get([null, null]).then((X) => {
          setExpression({
            cols: attrs.cols,
            rows: attrs.rows,
            matrix: X,
          });
        });
      },
    );
    const resetToken = PubSub.subscribe(RESET, () => {
      setUrls([]);
      setExpression(null);
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

    if (expression) {
      const colI = expression.cols.indexOf(newSelectedId);
      if (colI !== -1) {
        // Create new cellColors map based on the selected gene.
        const cellColors = new Map(expression.rows.map((cellId, rowI) => {
          const value = expression.matrix.data[rowI][colI];
          const cellColor = interpolatePlasma(value / 255);
          return [cellId, cellColor];
        }));
        PubSub.publish(CELLS_COLOR, cellColors);
      }
    }
  }, [expression]);

  const genesSelected = useMemo(() => {
    if (!expression) {
      return null;
    }
    return fromEntries(expression.cols.map(geneId => [geneId, geneId === selectedId]));
  }, [expression, selectedId]);

  const numGenes = expression ? expression.cols.length : '?';

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
