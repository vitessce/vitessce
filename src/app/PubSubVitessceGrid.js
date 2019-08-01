import React from 'react';
import PubSub from 'pubsub-js';

import VitessceGrid from 'vitessce-grid';

import { LayerPublisher } from '../components/layerpublisher';
import { GRID_RESIZE } from '../events';


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
          reactGridLayoutProps={{
            onResizeStop: (l, o, n, ph, e, el) => PubSub.publish(GRID_RESIZE, {
              layout: l, oldItem: o, newItem: n, placeholder: ph, e, element: el,
            }),
          }}
        />
      </React.Fragment>
    );
  }
}
