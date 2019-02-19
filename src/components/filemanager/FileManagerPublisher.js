import Ajv from 'ajv';
import PubSub from 'pubsub-js';
import React from 'react';

import {
  STATUS_WARN, STATUS_INFO, MOLECULES_ADD, CELLS_ADD,
} from '../../events';

import FileManager from './FileManager';

function warn(message) {
  PubSub.publish(STATUS_WARN, message);
}

function parseJson(file, schema, topic) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const json = event.target.result;
    try {
      var data = JSON.parse(json);
    } catch (e) {
      warn(`Invalid JSON: ${file.name}. Details in console.`);
      console.warn(e);
      return;
    }

    const validate = new Ajv().compile(schema);

    const valid = validate(data);
    if (valid) {
      PubSub.publish(topic, data);
      clearWarning(file.name);
    } else {
      warn(`JSON violates schema: ${file.name}. Details in console.`);
      console.warn(JSON.stringify(validate.errors, null, 2));
    }
  };
  reader.readAsText(file);
}

function clearWarning(fileName) {
  PubSub.publish(STATUS_INFO, `Loaded ${fileName}.`);
  // Empty string is false-y and would bring back default welcome message.
}

export default class FileManagerPublisher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };

    this.onAddFile = this.onAddFile.bind(this);
  }

  onAddFile(file) {
    const extension = file.name.match(/\..*/)[0];
    switch (extension) {
      // case '.png': {
      //   loadPng(file);
      //   break;
      // }
      case '.cells.json': {
        parseJson(file, require('../../schemas/cells.schema.json'), CELLS_ADD);
        break;
      }
      case '.molecules.json': {
        warn('Loading molecules will take a moment; Please wait...');
        parseJson(file, require('../../schemas/molecules.schema.json'), MOLECULES_ADD);
        break;
      }
      default:
        warn(`File extension "${extension}" is not recognized.`);
    }
  }

  render() {
    return (
      <FileManager onAddFile={this.onAddFile} value={this.state.value} />
    );
  }
}
