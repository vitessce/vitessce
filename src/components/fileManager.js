import Ajv from 'ajv';
import PubSub from 'pubsub-js';
import React from 'react';
import FileDrop from 'react-file-drop';
import PropTypes from 'prop-types';

import { IMAGE_ADD, WARNING_ADD, MOLECULES_ADD, CELLS_ADD } from '../events'

function loadPng(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = function() {
    PubSub.publish(IMAGE_ADD, {url: url, width: this.width, height: this.height});
  }
  img.src = url;
}

function parseJson(file, schema, topic) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const json = event.target.result;
    try {
      var data = JSON.parse(json);
    } catch (e) {
      PubSub.publish(WARNING_ADD, `Invalid JSON: ${file.name}. Details in console.`);
      console.warn(e);
      return;
    }

    var validate = new Ajv().compile(schema);

    var valid = validate(data);
    if (valid) {
      PubSub.publish(topic, data);
    } else {
      PubSub.publish(WARNING_ADD, `JSON violates schema: ${file.name}. Details in console.`);
      console.warn(JSON.stringify(validate.errors, null, 2));
    }
  }
  reader.readAsText(file);
}

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
        loadPng(file);
        break;
      }
      case '.cells.json': {
        parseJson(file, require('./schemas/cells.schema.json'), CELLS_ADD);
        break;
      }
      case '.molecules.json': {
        parseJson(file, require('./schemas/molecules.schema.json'), MOLECULES_ADD);
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
      fileNames: []
    };

    this.handleDrop = this.handleDrop.bind(this);
  }

  handleDrop(files, event) {
    var fileNamesCopy = this.state.fileNames.slice();
    for (const f of files) {
      if (! fileNamesCopy.includes(f.name)) {
        // Do not add duplicate entries to list...
        fileNamesCopy.push(f.name);
      }
      // ... but we do update the data.
      // This is easy, and good enough for now.
      this.props.onAddFile(f);
    }
    this.setState({fileNames: fileNamesCopy});
  }

  render() {
    const fileList = this.state.fileNames.map(
      fileName => <li className="list-group-item" key={fileName}>{fileName}</li>
    );

    const message = fileList.length
      ? <ul className="list-group">{fileList}</ul>
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
