import React from 'react';
import VitessceGrid from 'vitessce-grid';

import { LayerPublisher } from '../components/layerpublisher';

function saveToLS(newLayout, config) {
  // format default layout saved by react-grid for vit grid
  let ind = -1;
  const mergedArr = newLayout.map((component) => {
    ind += 1;
    const newCompObj = Object.assign({}, config.staticLayout[ind]);
    newCompObj.x = component.x;
    newCompObj.y = component.y;
    newCompObj.w = component.w;
    newCompObj.h = component.h;
    return newCompObj;
  });
  if (global.localStorage) {
    global.localStorage.setItem(
      'vitGrid',
      JSON.stringify({
        [config.name]: mergedArr,
      }),
    );
  }
}

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

const storageSavedLayouts = getFromLS('vitGrid');

export default class PubSubVitessceGrid extends React.Component {
  constructor(props) {
    super(props);
    this.rowHeight = props.rowHeight;
    this.config = props.config;
    this.state = {
      allReady: false,
      layout: () => {
        const { name } = props.config;
        const dataSetSavedLayout = storageSavedLayouts[name];
        // merge here or save the merge object
        if (dataSetSavedLayout) return dataSetSavedLayout;
        return props.config.staticLayout;
      },
    };
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  onLayoutChange(layout) {
    saveToLS(layout, this.config);
  }

  render() {
    const { config, getComponent } = this.props;
    const { allReady, layout } = this.state;
    return (
      <div className="vitessce-container">
        { allReady && <LayerPublisher layers={config.layers} /> }
        <VitessceGrid
          layout={layout()}
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
