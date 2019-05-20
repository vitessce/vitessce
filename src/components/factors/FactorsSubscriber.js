import React from 'react';
import PubSub from 'pubsub-js';

import Factors from './Factors';
import { PALETTE } from '../utils';

import TitleInfo from '../TitleInfo';
import { FACTORS_ADD, CELLS_COLOR, CLEAR_PLEASE_WAIT } from '../../events';

export default class FactorsSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { factors: {} };
    this.setSelectedFactor = this.setSelectedFactor.bind(this);
  }

  componentWillMount() {
    this.factorsAddToken = PubSub.subscribe(
      FACTORS_ADD, this.factorsAddSubscriber.bind(this),
    );
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.factorsAddToken);
  }

  factorsAddSubscriber(msg, factors) {
    this.setState({ factors });
  }

  setSelectedFactor(selectedId) {
    this.setState({ selectedId });
    const { factors } = this.state;
    const cellColors = {};

    const factorColors = {};
    Object.entries(factors[selectedId].cells).forEach(
      ([cellId, factorIndex]) => {
        if (!factorColors[factorIndex]) {
          const nextColorIndex = Object.keys(factorColors).length;
          factorColors[factorIndex] = PALETTE[nextColorIndex % PALETTE.length];
        }
        cellColors[cellId] = factorColors[factorIndex];
      },
    );
    PubSub.publish(CELLS_COLOR, cellColors);
  }

  render() {
    const { factors, selectedId } = this.state;
    const factorsSelected = {};
    const factorsKeys = Object.keys(factors);
    factorsKeys.forEach((factorId) => {
      factorsSelected[factorId] = factorId === selectedId;
    });
    return (
      <TitleInfo
        title="Factors"
        info={`${factorsKeys.length} factors`}
        isScroll
      >
        <Factors
          factorsSelected={factorsSelected}
          setSelectedFactor={this.setSelectedFactor}
          clearPleaseWait={
            layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
          }
        />
      </TitleInfo>
    );
  }
}
