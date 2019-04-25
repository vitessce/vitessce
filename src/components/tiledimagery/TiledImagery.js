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
    OpenSeadragon({
      id: this.id,
      showNavigationControl: false,
      tileSources,
    });
  }

  componentDidMount() {
    this.initSeaDragon();
  }

  shouldComponentUpdate() {
    return false;
  }
}

export default function TiledImagery(props) {
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
