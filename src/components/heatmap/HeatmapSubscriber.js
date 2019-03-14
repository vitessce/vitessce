import React from 'react';
import PubSub from 'pubsub-js';
import { FACTORS_ADD } from '../../events';
import Heatmap from './Heatmap';

export default class HeatmapSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { factors: {}, selectedId: 'cluster' };
    this.setSelectedFactor = this.setSelectedFactor.bind(this);
  }

  componentWillMount() {
    this.factorsAddToken = PubSub.subscribe(
      FACTORS_ADD, this.factorsAddSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.factorsAddToken);
  }

  factorsAddSubscriber(msg, factors) {
    this.setState({ factors });
  }

  setSelectedFactor(factorId) {
    this.setState({ selectedId: factorId });
  }

  render() {
    const { factors, selectedId } = this.state;
    const factorsSelected = {};
    Object.keys(factors).forEach((factorId) => {
      factorsSelected[factorId] = factorId === selectedId;
    });
    return (
      <Heatmap
        factorsSelected={factorsSelected}
        setSelectedFactor={this.setSelectedFactor}
      />
    );
  }
}
