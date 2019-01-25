import React from 'react';
import PubSub from 'pubsub-js';
import { IMAGE_ADD, MOLECULES_ADD } from '../../events';
import Spatial from './Spatial';


export class SpatialSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {baseImgUrl: undefined};
  }

  componentWillMount() {
    this.imageToken = PubSub.subscribe(IMAGE_ADD, this.imageAddSubscriber.bind(this));
    this.moleculesToken = PubSub.subscribe(MOLECULES_ADD, this.moleculesAddSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.imageToken);
    PubSub.unsubscribe(this.moleculesToken);
  }

  imageAddSubscriber(msg, baseImg) {
    this.setState({baseImg: baseImg});
  }

  moleculesAddSubscriber(msg, molecules) {
    this.setState({molecules: molecules});
  }

  render() {
    return (
      <Spatial baseImg={this.state.baseImg} molecules={this.state.molecules}/>
    );
  }
}
