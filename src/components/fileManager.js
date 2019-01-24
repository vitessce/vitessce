import PubSub from 'pubsub-js';
import React from 'react';
import FileDrop from 'react-file-drop';
import PropTypes from 'prop-types';

import { IMAGE_ADD, WARNING_ADD, MOLECULES_ADD } from '../events'

export class FileManagerPublisher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.onAddFile = this.onAddFile.bind(this);
  }

  onAddFile(file) {
    const extension = file.name.match(/\..*/)[0];
    switch (extension) {
      case '.png': {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = function() {
          PubSub.publish(IMAGE_ADD, {url: url, width: this.width, height: this.height});
        }
        img.src = url;
        break;
      }
      case '.molecules.json': {
        const reader = new FileReader();
        reader.onload = function(event) {
          const json = event.target.result;
          const molecules = JSON.parse(json);
          PubSub.publish(MOLECULES_ADD, molecules);
        }
        reader.readAsText(file);
        break;
      }
      default:
        PubSub.publish(WARNING_ADD, `File extension "${extension}" is not recognized.`);
    }
  }

  render() {
    return (
      <FileManager onAddFile={this.onAddFile} value={this.state.value}></FileManager>
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
    var filesCopy = this.state.files.slice();
    for (const f of files) {
      filesCopy.push(f.name);
      this.props.onAddFile(f);
    }
    var newState = {files: filesCopy};
    this.setState(newState);
  }

  render() {
    const files = this.state.files.map(
      file => <li className="list-group-item" key={file}>{file}</li>
    );

    const message = files.length
      ? <ul className="list-group">{files}</ul>
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

FileManager.propTypes = {
  onAddFile: PropTypes.func
}
