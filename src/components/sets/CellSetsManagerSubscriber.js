import React from 'react';
import PubSub from 'pubsub-js';
import fromEntries from 'fromentries';
import {
  FACTORS_ADD, CELL_SETS_MODIFY, CELL_SETS_VIEW,
  CELLS_SELECTION, CELLS_ADD, CELLS_COLOR,
} from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import SetsTree, { SetsTreeNode } from './sets';
import { PALETTE } from '../utils';

export default class CellSetsManagerSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cellSets: new SetsTree(
        (obj) => {
          PubSub.publish(CELL_SETS_MODIFY, obj);
        },
        (cellIds, cellColors) => {
          PubSub.publish(CELLS_COLOR, cellColors);
          PubSub.publish(CELL_SETS_VIEW, cellIds);
        },
      ),
    };
  }

  componentWillMount() {
    this.cellsAddToken = PubSub.subscribe(
      CELLS_ADD, this.cellsAddSubscriber.bind(this),
    );
    this.cellSetsToken = PubSub.subscribe(
      CELL_SETS_MODIFY, this.cellSetsSubscriber.bind(this),
    );
    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
    this.factorsAddToken = PubSub.subscribe(
      FACTORS_ADD, this.factorsAddSubscriber.bind(this),
    );
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellSetsToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.factorsAddToken);
  }

  cellsAddSubscriber(msg, cells) {
    const { cellSets } = this.state;
    cellSets.setItems(Object.keys(cells));
  }

  cellSetsSubscriber(msg, cellSets) {
    this.setState({ cellSets });
  }

  cellsSelectionSubscriber(msg, cellIds) {
    const { cellSets } = this.state;
    cellSets.setCurrentSet(cellIds, true);
  }

  /**
   * TODO: remove this function when the concept of factors is
   * removed in favor of the hierarchical cell set representation.
   */
  factorsAddSubscriber(msg, factors) {
    const { cellSets } = this.state;

    const subclusterMappings = {
      'Inhibitory neurons': [
        'Inhibitory Pthlh', 'Inhibitory Cnr1', 'Inhibitory IC', 'Inhibitory Vip',
        'Inhibitory Crhbp', 'Inhibitory CP', 'Inhibitory Kcnip2',
      ],
      // eslint-disable-next-line quote-props
      'Astrocyte': ['Astrocyte Gfap', 'Astrocyte Mfge8'],
      'Brain immune': ['Perivascular Macrophages', 'Microglia'],
      // eslint-disable-next-line quote-props
      'Vasculature': ['Pericytes', 'Endothelial 1', 'Endothelial', 'Vascular Smooth Muscle'],
      // eslint-disable-next-line quote-props
      'Oligodendrocytes': [
        'Oligodendrocyte COP', 'Oligodendrocyte Precursor cells',
        'Oligodendrocyte MF', 'Oligodendrocyte Mature', 'Oligodendrocyte NF',
      ],
      'Excitatory neurons': [
        'Pyramidal L2-3 L5', 'Pyramidal L3-4', 'pyramidal L4', 'Pyramidal L6', 'Pyramidal L2-3',
        'Pyramidal Kcnip2', 'Pyramidal L5', 'Hippocampus', 'Pyramidal Cpne5',
      ],
      // eslint-disable-next-line quote-props
      'Ventricle': ['C. Plexus', 'Ependymal'],
    };

    const reverseSubclusterMap = fromEntries(factors.subcluster.map.map((v, i) => [v, i]));

    const clusters = factors.cluster.map.map((clusterKey, clusterIndex) => {
      const subclusters = [];
      subclusterMappings[clusterKey].forEach((subclusterKey, subclusterIndex) => {
        subclusters.push(new SetsTreeNode({
          setKey: `all.${clusterKey}.${subclusterKey}`,
          name: subclusterKey,
          color: PALETTE[subclusterIndex % PALETTE.length],
          set: Object.entries(factors.subcluster.cells)
            .filter(c => c[1] === reverseSubclusterMap[subclusterKey]).map(c => c[0]),
        }));
      });

      return new SetsTreeNode({
        setKey: `all.${clusterKey}`,
        name: clusterKey,
        children: subclusters,
        color: PALETTE[clusterIndex % PALETTE.length],
        set: Object.entries(factors.cluster.cells)
          .filter(c => c[1] === clusterIndex).map(c => c[0]),
      });
    });

    cellSets.appendChild(new SetsTreeNode({
      setKey: 'all.factors',
      name: 'Factors',
      children: clusters,
    }));

    this.setState({ cellSets });
  }

  render() {
    const { cellSets } = this.state;
    return (
      <TitleInfo
        title="Cell Sets"
        isScroll
      >
        <SetsManager
          setsTree={cellSets}
        />
      </TitleInfo>
    );
  }
}
