import PubSub from 'pubsub-js';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const CELL = 'cell';
const CELL_ADD = CELL + '.add';

class FileManagerPublisher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    const value = event.target.value
    this.setState({value: value});
    PubSub.publish(CELL_ADD, value);
  }

  render() {
    return (
      <FileManager onChange={this.onChange} value={this.state.value}></FileManager>
    );
  }
}

function FileManager(props) {
  return (
    <p>
      filemanager:
      <input
        value={props.value}
        onChange={props.onChange}
      ></input>
    </p>
  );
}

class SpatialSubscriber extends React.Component {
  // All the pubsub communication goes in the wrapper class.
  constructor(props) {
    super(props);
    this.state = {value: ''};
  }

  componentWillMount() {
    this.token = PubSub.subscribe(CELL, this.subscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  subscriber(msg, data) {
    console.warn('Spatial component received:', msg, data);
    this.setState({value: data});
  }

  render() {
    return (
      <Spatial value={this.state.value}></Spatial>
    );
  }
}

function Spatial(props) {
  // The real business logic goes inside.
  return (
    <p>spatial: {props.value}</p>
  );
}

ReactDOM.render(
  <FileManagerPublisher />,
  document.getElementById('filemanager')
);

ReactDOM.render(
  <SpatialSubscriber />,
  document.getElementById('spatial')
);
