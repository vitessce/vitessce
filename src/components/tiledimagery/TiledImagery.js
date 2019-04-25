import React from 'react';
// import PubSub from 'pubsub-js';
import OpenSeadragon from 'openseadragon';
// import ReactOpenSeadragon from 'react-openseadragon'

import { BLACK_CARD } from '../classNames';
import TitleInfo from '../TitleInfo';

class OpenSeaDragon extends React.Component {
  constructor(props) {
    super(props);
    this.id = `id-${Math.random()}`;
  }

  render() {
    return (
      <div id={this.id} style={{ height: '100%', width: '100%' }} />
    );
  }

  initSeaDragon() {
    const { tileSources } = this.props;
    const viewer = OpenSeadragon({
      id: this.id,
      showNavigationControl: false,
      tileSources,
    });
    viewer.addHandler('open', () => {
      // Callback is necessary: If invoked immediately, it doesn't work.
      const rect = viewer.viewport.imageToViewportRectangle(500, 200, 100, 100);
      viewer.viewport.fitBounds(rect, false);
    });
  }

  componentDidMount() {
    this.initSeaDragon();
  }

  shouldComponentUpdate() {
    return false;
  }
}

export default function TiledImagery(props) { // eslint-disable-line no-unused-vars
  return (
    <React.Fragment>
      <TitleInfo
        title="TiledImagery"
        info=""
      />
      <div className={BLACK_CARD}>
        <OpenSeaDragon
          tileSources={{
            type: 'image',
            url: 'http://gehlenborglab.org/assets/img/site/hero_backbay.jpg',
            buildPyramid: false,
          }}
        />
      </div>
    </React.Fragment>
  );
}
