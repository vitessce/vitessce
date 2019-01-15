import PubSub from 'pubsub-js';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const CELL = 'cell';
const CELL_ADD = CELL + '.add';

class FileManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const value = event.target.value
    this.setState({value: value});
    PubSub.publish(CELL_ADD, value);
  }

  render() {
    return (
      <p>
        filemanager:
        <input
          value={this.state.value}
          onChange={this.handleChange}
        ></input>
      </p>
    );
  }
}

class Spatial extends React.Component {
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
      <p>spatial: {this.state.value}</p>
    );
  }
}

ReactDOM.render(
  <FileManager />,
  document.getElementById('filemanager')
);

ReactDOM.render(
  <Spatial />,
  document.getElementById('spatial')
);
