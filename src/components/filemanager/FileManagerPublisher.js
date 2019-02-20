import Ajv from 'ajv';
import PubSub from 'pubsub-js';
import React from 'react';

import {
  STATUS_WARN, STATUS_INFO, MOLECULES_ADD, CELLS_ADD,
} from '../../events';

import FileManager from './FileManager';

import cellsSchema from '../../schemas/cells.schema.json';
import moleculesSchema from '../../schemas/molecules.schema.json';


function warn(message) {
  PubSub.publish(STATUS_WARN, message);
}

function clearWarning(fileName) {
  PubSub.publish(STATUS_INFO, `Loaded ${fileName}.`);
  // Empty string is false-y and would bring back default welcome message.
}

export function loadDefaults() {
  // TODO: Copy and pasted from parseJson.
  // TODO: Clarify goals.
  fetch('https://s3.amazonaws.com/vitessce-data/linnarsson.cells.json')
    .then((response) => {
      response.json().then((data) => {
        const validate = new Ajv().compile(cellsSchema);
        const valid = validate(data);
        const fileName = 'linnarsson.cells.json';
        if (valid) {
          PubSub.publish(CELLS_ADD, data);
          clearWarning(fileName);
        } else {
          warn(`JSON violates schema: ${fileName}. Details in console.`);
          console.warn(JSON.stringify(validate.errors, null, 2));
        }
      });
    });
}

function parseJson(file, schema, topic) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const json = event.target.result;
    let data;
    try {
      data = JSON.parse(json);
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

export default class FileManagerPublisher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  static onAddFile(file) {
    const extension = file.name.match(/\..*/)[0];
    switch (extension) {
      // case '.png': {
      //   loadPng(file);
      //   break;
      // }
      case '.cells.json': {
        parseJson(file, cellsSchema, CELLS_ADD);
        break;
      }
      case '.molecules.json': {
        warn('Loading molecules will take a moment; Please wait...');
        parseJson(file, moleculesSchema, MOLECULES_ADD);
        break;
      }
      default:
        warn(`File extension "${extension}" is not recognized.`);
    }
  }

  render() {
    const { value } = this.state;
    return (
      <FileManager onAddFile={FileManagerPublisher.onAddFile} value={value} />
    );
  }
}
