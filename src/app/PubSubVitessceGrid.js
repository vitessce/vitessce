import React from 'react';
import VitessceGrid from 'vitessce-grid';

import { LayerPublisher } from '../components/layerpublisher';

function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem(key)) || {};
    } catch (e) {
      console.error('Error accessing vitGrid in local storage.');
    }
  }
  return ls;
}

function saveToLS(newLayout, config) {
  // minimize what's saved in local storage
  const compDimArr = newLayout.map(component => ({
    x: component.x, y: component.y, w: component.w, h: component.h,
  }));
  if (global.localStorage) {
    global.localStorage.setItem(
      'vitGrid',
      JSON.stringify({
        [config.name]: compDimArr,
      }),
    );
  }
}

const storageSavedLayouts = getFromLS('vitGrid');

export default class PubSubVitessceGrid extends React.Component {
  constructor(props) {
    super(props);
    this.rowHeight = props.rowHeight;
    this.config = props.config;
    this.startLayout = () => {
      const { name } = props.config;
      const dataSetSavedLayout = storageSavedLayouts[name];
      // update config layout with user's saved views
      for (let i = 0; i < dataSetSavedLayout.length; i += 1) {
        dataSetSavedLayout[i] = { ...props.config.staticLayout[i], ...dataSetSavedLayout[i] };
      }
      if (dataSetSavedLayout) return dataSetSavedLayout;
      return props.config.staticLayout;
    };
    this.state = { allReady: false };
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  onLayoutChange(layout) {
    saveToLS(layout, this.config);
  }

  render() {
    const { config, getComponent } = this.props;
    const { allReady } = this.state;
    return (
      <div className="vitessce-container">
        { allReady && <LayerPublisher layers={config.layers} /> }
        <VitessceGrid
          layout={this.startLayout()}
          rowHeight={this.rowHeight}
          getComponent={getComponent}
          onAllReady={() => { this.setState({ allReady: true }); }}
          draggableHandle=".title"
          reactGridLayoutProps={{ onLayoutChange: this.onLayoutChange }}
        />
      </div>
    );
  }
}
