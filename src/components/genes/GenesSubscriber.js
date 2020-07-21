/* eslint-disable */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PubSub from 'pubsub-js';

import Genes from './Genes';

import TitleInfo from '../TitleInfo';
import { GENES_ADD, CELLS_COLOR, CLEAR_PLEASE_WAIT, RESET } from '../../events';
import { interpolatePlasma } from '../interpolate-colors';
import { fromEntries } from '../utils';

export default function GenesSubscriber(props) {
  const {
    onReady,
    removeGridComponent,
    labelOverride,
    theme,
  } = props;

  const [clusters, setClusters] = useState();
  const [selectedId, setSelectedId] = useState(null);
  const [urls, setUrls] = useState([]);

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    const clustersAddToken = PubSub.subscribe(
      GENES_ADD, (msg, { data, url }) => {
        const [attrs, arr] = data;
    
        arr.get([null, null]).then(X => {
          setClusters({
            cols: attrs.var,
            rows: attrs.obs,
            matrix: X
          });
        });
        setUrls((prevUrls) => {
          const newUrls = [...prevUrls].concat({ url, name: 'Genes' });
          return newUrls;
        });
      },
    );
    const resetToken = PubSub.subscribe(RESET, () => setUrls([]));
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(clustersAddToken);
      PubSub.unsubscribe(resetToken);
    };
  }, []);

  const setSelectedGene = useCallback((selectedId) => {
    setSelectedId(selectedId);

    if(clusters) {
      const colI = clusters.cols.indexOf(selectedId);
      if(colI !== -1) {
        const cellColors = fromEntries(clusters.rows.map((cellId, rowI) => {
          const value = clusters.matrix.data[rowI][colI];
          const cellColor = interpolatePlasma(value / 255);
          return [cellId, cellColor];
        }));
        PubSub.publish(CELLS_COLOR, cellColors);
      }
    }
  }, [clusters]);

  const genesSelected = useMemo(() => {
    if(!clusters) {
      return null;
    }
    return fromEntries(clusters.cols.map((geneId) => {
      return [geneId, geneId === selectedId];
    }));
  }, [clusters, selectedId]);

  const numGenes = clusters ? clusters.cols.length : '?';
  

  return (
    <TitleInfo
      title="Expression Levels"
      info={`${numGenes} ${labelOverride || 'genes'}`}
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
