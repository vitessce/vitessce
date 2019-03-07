import Ajv from 'ajv';
import PubSub from 'pubsub-js';
import React from 'react';

import {
  STATUS_WARN, STATUS_INFO, IMAGES_ADD, MOLECULES_ADD, CELLS_ADD, CLEAR_PLEASE_WAIT,
} from '../../events';

import imagesSchema from '../../schemas/images.schema.json';
import cellsSchema from '../../schemas/cells.schema.json';
import moleculesSchema from '../../schemas/molecules.schema.json';


function warn(message) {
  PubSub.publish(STATUS_WARN, message);
}

function info(fileName) {
  PubSub.publish(STATUS_INFO, `Loaded ${fileName}.`);
}

function loadLayer(layer) {
  const { name, type, url } = layer;
  const typeToSchema = {
    IMAGES: imagesSchema,
    CELLS: cellsSchema,
    MOLECULES: moleculesSchema,
  };
  const typeToEvent = {
    IMAGES: IMAGES_ADD,
    CELLS: CELLS_ADD,
    MOLECULES: MOLECULES_ADD,
  };
  fetch(url)
    .then((response) => {
      response.json().then((data) => {
        if (type === 'MOLECULES') {
          warn(null); // Clear default warning... Find better approach?
        }
        const validate = new Ajv().compile(typeToSchema[type]);
        const valid = validate(data);
        if (valid) {
          PubSub.publish(typeToEvent[type], data);
          info(name);
        } else {
          warn(`JSON from ${url} violates ${type} schema. Details in console.`);
          console.warn(JSON.stringify(validate.errors, null, 2));
        }
      });
    });
}

export default class LayerManagerPublisher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pleaseWait: true,
    };
  }

  clearPleaseWait() {
    this.setState({ pleaseWait: false });
  }

  componentWillMount() {
    this.clearPleaseWaitToken = PubSub.subscribe(
      CLEAR_PLEASE_WAIT, this.clearPleaseWait.bind(this),
    );
  }

  componentDidMount() {
    const { layers } = this.props;
    layers.forEach((layer) => {
      loadLayer(layer);
    });
  }

  render() {
    const { pleaseWait } = this.state;
    return pleaseWait ? <div>Please wait...</div> : <React.Fragment />;
  }
}
