import React from 'react';
import VitessceGrid from 'vitessce-grid';

import { LayerPublisher } from '../components/layerpublisher';

export default class PubSubVitessceGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = { allReady: false };
  }

  render() {
    const { config, getComponent } = this.props;
    const { allReady } = this.state;
    return (
      <React.Fragment>
        { allReady && <LayerPublisher layers={config.layers} /> }
        <VitessceGrid
          layout={config.responsiveLayout || config.staticLayout}
          getComponent={getComponent}
          onAllReady={() => { this.setState({ allReady: true }); }}
          draggableHandle=".title"
        />
      </React.Fragment>
    );
  }
}
