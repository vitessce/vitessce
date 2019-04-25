import React from 'react';
// import PubSub from 'pubsub-js';
import OpenSeadragon from 'openseadragon';
// import ReactOpenSeadragon from 'react-openseadragon'

import { BLACK_CARD } from '../classNames';
import TitleInfo from '../TitleInfo';

// helper function to load image using promises
const loadImage = src => new Promise((resolve, reject) => {
  const img = document.createElement('img');
  img.addEventListener('load', () => { resolve(img); })
  img.addEventListener('error', (err) => { reject(404); })
  img.src = src;
});

class OpenSeaDragon extends React.Component {
  render() {
    const { id } = this.props;
    return (
      <div className="ocd-div" ref={(node) => { this.el = node; }} >
        <div className="openseadragon" id={id} style={{ height: '100px', width: '100px' }} />
      </div>
    );
  }

  initSeaDragon() {
    const { id, image, type } = this.props;

    OpenSeadragon({
      id,
      // visibilityRatio: 1.0,
      // constrainDuringPan: false,
      // defaultZoomLevel: 1,
      // minZoomLevel: 1,
      // maxZoomLevel: 10,
      // zoomInButton: 'zoom-in',
      // zoomOutButton: 'zoom-out',
      // homeButton: 'reset',
      // fullPageButton: 'full-page',
      // nextButton: 'next',
      // previousButton: 'previous',
      // showNavigator: false,
      // navigatorId: 'navigator',
      tileSources: {
        type: 'image',
        url: 'http://gehlenborglab.org/assets/img/site/hero_backbay.jpg',
        buildPyramid: false,
        // levels: [{ url: image, height: 100 /*data.naturalHeight*/, width: 100 /*data.naturalWidth*/ }],
      },
    });

    // loadImage(image).then((data) => {
    //   this.viewer = OpenSeadragon({
    //     id,
    //     // visibilityRatio: 1.0,
    //     // constrainDuringPan: false,
    //     // defaultZoomLevel: 1,
    //     // minZoomLevel: 1,
    //     // maxZoomLevel: 10,
    //     // zoomInButton: 'zoom-in',
    //     // zoomOutButton: 'zoom-out',
    //     // homeButton: 'reset',
    //     // fullPageButton: 'full-page',
    //     // nextButton: 'next',
    //     // previousButton: 'previous',
    //     // showNavigator: false,
    //     // navigatorId: 'navigator',
    //     tileSources: {
    //       type: 'image',
    //       url: 'http://gehlenborglab.org/assets/img/site/hero_backbay.jpg',
    //       buildPyramid: false,
    //       // levels: [{ url: image, height: 100 /*data.naturalHeight*/, width: 100 /*data.naturalWidth*/ }],
    //     },
    //   });
    // });
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
