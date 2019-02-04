import Ajv from 'ajv';
import PubSub from 'pubsub-js';
import React from 'react';
import FileDrop from 'react-file-drop';
import PropTypes from 'prop-types';

import { IMAGE_ADD, WARNING_ADD, MOLECULES_ADD, CELLS_ADD } from '../events'

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
      case '.cells.json': {
        const reader = new FileReader();
        reader.onload = function(event) {
          const json = event.target.result;
          try {
            var cells = JSON.parse(json);
          } catch (e) {
            PubSub.publish(WARNING_ADD, `Invalid JSON: ${file.name}. Details in console.`);
            console.warn(e);
            return;
          }

          var schema = require('./schemas/cells.schema.json');
          var validateCells = new Ajv().compile(schema);

          var valid = validateCells(cells);
          if (valid) {
            PubSub.publish(CELLS_ADD, cells);
          } else {
            PubSub.publish(WARNING_ADD, `JSON violates schema: ${file.name}. Details in console.`);
            console.warn(JSON.stringify(validateCells.errors, null, 2));
          }
        }
        reader.readAsText(file);
        break;
      }
      case '.molecules.json': {
        const reader = new FileReader();
        reader.onload = function(event) {
          const json = event.target.result;
          try {
            var molecules = JSON.parse(json);
          } catch (e) {
            PubSub.publish(WARNING_ADD, `Invalid JSON: ${file.name}. Details in console.`);
            console.warn(e);
            return;
          }

          var schema = require('./schemas/molecules.schema.json');
          var validateMolecules = new Ajv().compile(schema);

          var valid = validateMolecules(molecules);
          if (valid) {
            PubSub.publish(MOLECULES_ADD, molecules);
          } else {
            PubSub.publish(WARNING_ADD, `JSON violates schema: ${file.name}. Details in console.`);
            console.warn(JSON.stringify(validateMolecules.errors, null, 2));
          }
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
