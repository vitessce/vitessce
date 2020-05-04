/* eslint-disable */
import React, { useCallback, useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import {
  CELL_SETS_VIEW, CELLS_SELECTION,
  CELLS_ADD, STATUS_WARN, CELLS_COLOR, CELL_SETS_ADD,
  CLEAR_PLEASE_WAIT,
} from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import sets from './sets';

const SETS_DATATYPE_CELL = 'cell';

export default function CellSetsManagerSubscriber(props) {
  const {
    removeGridComponent,
    onReady
  } = props;

  const onReadyCallback = useCallback(onReady, []);
  const [tree, setTree] = useState(sets.treeGetEmpty(SETS_DATATYPE_CELL));

  useEffect(() => {
    const cellsAddToken = PubSub.subscribe(CELLS_ADD, (msg, cells) => {
      const newTree = sets.treeSetItems(tree, Object.keys(cells));
      setTree(newTree);
    });
    const cellSetsAddToken = PubSub.subscribe(CELL_SETS_ADD, (msg, treeToImport) => {
      const newTree = sets.treeImport(tree, treeToImport.tree);
      setTree(newTree);
    });
    const cellsSelectionToken = PubSub.subscribe(CELLS_SELECTION, (msg, cellIds) => {
      const newTree = sets.treeSetCurrentSet(tree, Array.from(cellIds));
      setTree(newTree);
    });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellSetsAddToken);
      PubSub.unsubscribe(cellsSelectionToken);
    }
  }, [onReadyCallback, tree, setTree]);

  return (
    <TitleInfo
      title="Cell Sets"
      isScroll
      removeGridComponent={removeGridComponent}
    >
      <SetsManager
        tree={tree}
        onUpdateTree={setTree}
        datatype={SETS_DATATYPE_CELL}
        onError={err => PubSub.publish(STATUS_WARN, err)}
        onCellsColor={cellColors => PubSub.publish(CELLS_COLOR, cellColors)}
        onCellSetsView={cellIds => PubSub.publish(CELL_SETS_VIEW, new Set(cellIds))}
        clearPleaseWait={
          layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
        }
      />
    </TitleInfo>
  );
}
