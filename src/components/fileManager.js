import PubSub from 'pubsub-js';
import React from 'react';
import FileDrop from 'react-file-drop';

import { CELL_ADD } from '../events'

export class FileManagerPublisher extends React.Component {
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

export function FileManager(props) {
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
