import React, { useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';

import Genes from './Genes';

import TitleInfo from '../TitleInfo';
import {
  GENES_ADD,
  CELLS_COLOR,
  CLEAR_PLEASE_WAIT,
  RESET,
} from '../../events';
import { interpolateColors } from '../utils';

export default function GenesSubscriber(props) {
  const {
    onReady,
    mapping,
    removeGridComponent,
    variablesLabelOverride,
    theme,
  } = props;
  const [genes, setGenes] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [urls, setUrls] = useState([]);

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    const genesAddToken = PubSub.subscribe(
      GENES_ADD, (msg, { data, url }) => {
        setGenes(data);
        setUrls((prevUrls) => {
          const newUrls = [...prevUrls].concat({ url, name: 'Genes' });
          return newUrls;
        });
      },
    );
    const resetToken = PubSub.subscribe(RESET, () => {
      setUrls([]);
      setGenes({});
      setSelectedId({});
    });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(genesAddToken);
      PubSub.unsubscribe(resetToken);
    };
  }, [onReadyCallback, mapping]);

  function setSelectedGene(id) {
    setSelectedId(id);
    const cellColors = {};

    const { cells, max } = genes[id];
    Object.entries(cells).forEach(
      ([cellId, value]) => {
        cellColors[cellId] = interpolateColors(value / max);
      },
    );
    PubSub.publish(CELLS_COLOR, cellColors);
  }

  const genesSelected = {};
  const genesKeys = Object.keys(genes);
  genesKeys.forEach((geneId) => {
    genesSelected[geneId] = geneId === selectedId;
  });
  return (
    <TitleInfo
      title="Expression Levels"
      info={`${genesKeys.length} ${variablesLabelOverride || 'genes'}`}
      isScroll
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
    >
      <Genes
        genesSelected={genesSelected}
        setSelectedGene={setSelectedGene}
        clearPleaseWait={layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)}
      />
    </TitleInfo>
  );
}
