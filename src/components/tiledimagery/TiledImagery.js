import React from 'react';
// import PubSub from 'pubsub-js';
import OpenSeadragon from 'openseadragon';
// import ReactOpenSeadragon from 'react-openseadragon'

import { BLACK_CARD } from '../classNames';
import TitleInfo from '../TitleInfo';

class OpenSeaDragon extends React.Component {
  render() {
    const { id } = this.props;
    return (
      <div id={id} style={{ height: '100%', width: '100%' }} />
    );
  }

  initSeaDragon() {
    const { id, image, type } = this.props;

    OpenSeadragon({
      id,
      showNavigationControl: false,
      tileSources: {
        type: 'image',
        url: 'http://gehlenborglab.org/assets/img/site/hero_backbay.jpg',
        buildPyramid: false,
      },
    });
  }

  componentDidMount() {
    this.initSeaDragon();
  }

  shouldComponentUpdate() {
    return false;
  }
}

OpenSeaDragon.defaultProps = { id: 'ocd-viewer', type: 'legacy-image-pyramid' };


export default function TiledImagery(props) {
  return (
    <React.Fragment>
      <TitleInfo
        title="TiledImagery"
        info=""
      />
      <div className={BLACK_CARD}>
        <OpenSeaDragon type="image" image="http://gehlenborglab.org/assets/img/site/hero_backbay.jpg" />
      </div>
    </React.Fragment>
  );
}
