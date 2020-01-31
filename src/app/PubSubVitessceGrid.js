import React from 'react';
import VitessceGrid from 'vitessce-grid';

import { LayerPublisher } from '../components/layerpublisher';

function getFromLS(key) {
  let ls;
  if (window.localStorage) {
    try {
      ls = JSON.parse(window.localStorage.getItem(key)) || {};
    } catch (e) {
      console.error(`Error accessing ${key} in local storage.`);
    }
  }
  return ls;
}

export default class PubSubVitessceGrid extends React.Component {
  constructor(props) {
    super(props);
    const storageSavedLayouts = getFromLS('vitGrid');
    this.rowHeight = props.rowHeight;
    this.config = props.config;
    this.getStorageLayout = () => {
      const dataSetSavedLayout = storageSavedLayouts[props.config.name] || [];
      // update with user's saved configs
      for (let i = 0; i < dataSetSavedLayout.length; i += 1) {
        dataSetSavedLayout[i] = { ...props.config.staticLayout[i], ...dataSetSavedLayout[i] };
      }
      if (dataSetSavedLayout.length) return dataSetSavedLayout;
      return props.config.staticLayout;
    };
    this.state = { allReady: false };
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  onLayoutChange(layout) {
    // minimize what's saved in local storage
    const componentDimArr = layout.map(component => ({
      x: component.x, y: component.y, w: component.w, h: component.h,
    }));
    if (window.localStorage) {
      window.localStorage.setItem(
        'vitGrid',
        JSON.stringify({
          [this.config.name]: componentDimArr,
        }),
      );
    }
  }

  render() {
    const { config, getComponent } = this.props;
    const { allReady } = this.state;
    return (
      <div className="vitessce-container">
        { allReady && <LayerPublisher layers={config.layers} /> }
        <VitessceGrid
          layout={this.getStorageLayout()}
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
