/* eslint-disable */
import React, { useCallback, useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import {
  CELL_SETS_MODIFY, CELL_SETS_VIEW, CELLS_SELECTION,
  CELLS_ADD, STATUS_WARN, CELLS_COLOR, CELL_SETS_ADD,
  CLEAR_PLEASE_WAIT,
} from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import sets from './sets';

const setsType = 'cell';

export default function CellSetsManagerSubscriber(props) {
  const {
    removeGridComponent,
    onReady
  } = props;

  const onReadyCallback = useCallback(onReady, []);
  const [tree, setTree] = useState(sets.treeGetEmpty(setsType));

  useEffect(() => {
    const cellsAddToken = PubSub.subscribe(CELLS_ADD, (msg, cells) => {
      const newTree = sets.treeSetItems(tree, Object.keys(cells));
      setTree(newTree);
    });
    const cellSetsAddToken = PubSub.subscribe(CELL_SETS_ADD, (msg, treeToImport) => {
      const newTree = sets.treeImport(tree, treeToImport.tree);
      setTree(newTree);
    });
    const cellSetsModifyToken = PubSub.subscribe(CELL_SETS_MODIFY, (msg, treeToImport) => {
      // ?
    });
    const cellsSelectionToken = PubSub.subscribe(CELLS_SELECTION, (msg, cellIds) => {
      console.log(tree);
      const newTree = sets.treeSetCurrentSet(tree, cellIds);
      setTree(newTree);
      console.log(newTree);
    });
    onReadyCallback();
    PubSub.publish(CLEAR_PLEASE_WAIT, 'cell_sets'); // TODO: remove
    return () => {
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellSetsAddToken);
      PubSub.unsubscribe(cellSetsModifyToken);
      PubSub.unsubscribe(cellsSelectionToken);
    }
  }, [onReadyCallback, tree, setTree]);


  /*
  constructor(props) {
    super(props);
    this.state = {
      cellSetsTree: new SetsTree(
        (obj) => {
          PubSub.publish(CELL_SETS_MODIFY, obj);
        },
        (cellIds, cellColors) => {
          PubSub.publish(CELLS_COLOR, cellColors);
          PubSub.publish(CELL_SETS_VIEW, cellIds);
        },
      ),
    };
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }
  */

  return (
    <TitleInfo
      title="Cell Sets"
      isScroll
      removeGridComponent={removeGridComponent}
    >
      {/*<SetsManager
        tree={cellSetsTree}
        datatype={setsType}
        onError={err => PubSub.publish(STATUS_WARN, err)}
        clearPleaseWait={
          layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
        }
      />*/}
    </TitleInfo>
  );
}
