import React from 'react';
import VitessceGrid from 'vitessce-grid';

import { LayerPublisher } from '../components/layerpublisher';

export default class PubSubVitessceGrid extends React.Component {
  constructor(props) {
    super(props);
    this.rowHeight = props.rowHeight;
    this.state = { allReady: false };
  }

  render() {
    const { config, getComponent, theme } = this.props;
    const { allReady } = this.state;
    return (
      <div className={`vitessce-container vitessce-theme-${theme}`}>
        { allReady && <LayerPublisher layers={config.layers} /> }
        <VitessceGrid
          layout={config.staticLayout}
          rowHeight={this.rowHeight}
          getComponent={getComponent}
          onAllReady={() => { this.setState({ allReady: true }); }}
          draggableHandle=".title"
        />
      </div>
    );
  }
}
