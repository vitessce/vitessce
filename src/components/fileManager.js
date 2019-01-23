import PubSub from 'pubsub-js';
import React from 'react';
import FileDrop from 'react-file-drop';

import { CELL_ADD } from '../events'

export class FileManagerPublisher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.onChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const value = event.target.value
    this.setState({value: value});
    PubSub.publish(CELL_ADD, value);
  }

  render() {
    return (
      <FileManager onChange={this.handleChange} value={this.state.value}></FileManager>
    );
  }
}

export class FileManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };

    this.handleDrop = this.handleDrop.bind(this);
  }

  handleDrop(files, event) {
    var filesState = this.state.files.slice();
    for (const f of files) {
      filesState.push(f.name);
    }
    this.setState({files: filesState});
  }

  render() {
    const message = this.state.files.length
      ? this.state.files
      : 'Drop files here';
    return (
      <div>
        <FileDrop onDrop={this.handleDrop}>
          {message}
        </FileDrop>
      </div>
    );
  }
}
