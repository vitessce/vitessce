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

export function loadLayer(layer) {
  const { name, type, url } = layer;
  const typeToSchema = {
    CELLS: cellsSchema,
    MOLECULES: moleculesSchema,
  };
  const typeToEvent = {
    CELLS: CELLS_ADD,
    MOLECULES: MOLECULES_ADD,
  };
  fetch(url)
    .then((response) => {
      response.json().then((data) => {
        const validate = new Ajv().compile(typeToSchema[type]);
        const valid = validate(data);
        if (valid) {
          PubSub.publish(typeToEvent[type], data);
          clearWarning(name);
        } else {
          warn(`JSON from ${url} violates ${type} schema. Details in console.`);
          console.warn(JSON.stringify(validate.errors, null, 2));
        }
      });
    });
}

export default class FileManagerPublisher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  componentDidMount() {
    const { layers } = this.props;
    layers.forEach((layer) => {
      loadLayer(layer);
    });
  }

  render() {
    const { value } = this.state;
    return (
      <FileManager onAddFile={FileManagerPublisher.onAddFile} value={value} />
    );
  }
}
