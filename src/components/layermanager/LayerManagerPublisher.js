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
        const validate = new Ajv().compile(typeToSchema[type]);
        const valid = validate(data);
        if (valid) {
          PubSub.publish(typeToEvent[type], data);
          info(name);
        } else {
          const failureReason = JSON.stringify(validate.errors, null, 2);
          warn(`Error while validating ${name}. Details in console.`);
          console.warn(`"${name}" (${type}) from ${url}: validation failed`, failureReason);
        }
      }, (failureReason) => {
        warn(`Error while parsing ${name}. Details in console.`);
        console.warn(`"${name}" (${type}) from ${url}: parse failed`, failureReason);
      });
    }, (failureReason) => {
      warn(`Error while fetching ${name}. Details in console.`);
      console.warn(`"${name}" (${type}) from ${url}: fetch failed`, failureReason);
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
    if (pleaseWait) {
      return (
        <React.Fragment>
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-body">
                  <p>Please wait...</p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </React.Fragment>
      );
    }
    return <React.Fragment />;
  }
}
