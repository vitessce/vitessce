import PubSub from 'pubsub-js';
import React from 'react';
import ReactDOM from 'react-dom';
import FileDrop from 'react-file-drop';
import './css/index.css';
import './css/file-drop.css';

import { renderToDOM } from './spatial'

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
  const handleDrop = (files, event) => {
    console.warn(files, event);
  };
  return (
    <div>
      filemanager:
      <input
        value={props.value}
        onChange={props.onChange}
      ></input>
      <FileDrop onDrop={handleDrop}>
        Drop some files here!
      </FileDrop>
    </div>
  );
}

class TsneSubscriber extends React.Component {
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
      <Tsne value={this.state.value}></Tsne>
    );
  }
}

function Tsne(props) {
  // The real business logic goes inside.
  return (
    <p>tsne: {props.value}</p>
  );
}

renderToDOM(document.getElementById('spatial'))

ReactDOM.render(
  <FileManagerPublisher />,
  document.getElementById('filemanager')
);

ReactDOM.render(
  <TsneSubscriber />,
  document.getElementById('tsne')
);
