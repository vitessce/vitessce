import React from 'react';
import OpenSeadragonComponent from '../OpenSeadragonComponent';

import { BLACK_CARD } from '../classNames';
import TitleInfo from '../TitleInfo';

export default function TiledImagery(props) { // eslint-disable-line no-unused-vars
  return (
    <React.Fragment>
      <TitleInfo
        title="TiledImagery"
        info=""
      />
      <div className={BLACK_CARD}>
        <OpenSeadragonComponent
          tileSources={{
            type: 'image',
            url: 'http://gehlenborglab.org/assets/img/site/hero_backbay.jpg',
            buildPyramid: false,
          }}
          x={800}
          y={200}
          width={100}
          height={100}
        />
      </div>
    </React.Fragment>
  );
}
