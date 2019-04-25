import React from 'react';
// import PubSub from 'pubsub-js';

import { BLACK_CARD } from '../classNames';
import TitleInfo from '../TitleInfo';

export default class SpatialSubscriber extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  render() {
    return (
      /* eslint-disable react/destructuring-assignment */
      <React.Fragment>
        <TitleInfo
          title="SeaDragon"
          info=""
        />
        <div className={BLACK_CARD} />
      </React.Fragment>
      /* eslint-enable */
    );
  }
}
