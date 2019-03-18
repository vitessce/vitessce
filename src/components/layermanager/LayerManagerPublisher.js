import Ajv from 'ajv';
import PubSub from 'pubsub-js';
import React from 'react';

import {
  STATUS_WARN, STATUS_INFO,
  CELLS_ADD, CLUSTERS_ADD, FACTORS_ADD, GENES_ADD, IMAGES_ADD, MOLECULES_ADD, NEIGHBORHOODS_ADD,
  CLEAR_PLEASE_WAIT,
} from '../../events';

import cellsSchema from '../../schemas/cells.schema.json';
import clustersSchema from '../../schemas/clusters.schema.json';
import factorsSchema from '../../schemas/factors.schema.json';
import genesSchema from '../../schemas/genes.schema.json';
import imagesSchema from '../../schemas/images.schema.json';
import moleculesSchema from '../../schemas/molecules.schema.json';
import neighborhoodsSchema from '../../schemas/neighborhoods.schema.json';

function warn(message) {
  PubSub.publish(STATUS_WARN, message);
}

function info(fileName) {
  PubSub.publish(STATUS_INFO, `Loaded ${fileName}.`);
}

function loadLayer(layer) {
  const { name, type, url } = layer;
  const typeToSchema = {
    CELLS: cellsSchema,
    CLUSTERS: clustersSchema,
    FACTORS: factorsSchema,
    GENES: genesSchema,
    IMAGES: imagesSchema,
    MOLECULES: moleculesSchema,
    NEIGHBORHOODS: neighborhoodsSchema,
  };
  const typeToEvent = {
    CELLS: CELLS_ADD,
    CLUSTERS: CLUSTERS_ADD,
    FACTORS: FACTORS_ADD,
    GENES: GENES_ADD,
    IMAGES: IMAGES_ADD,
    MOLECULES: MOLECULES_ADD,
    NEIGHBORHOODS: NEIGHBORHOODS_ADD,
  };
  fetch(url)
    .then((response) => {
      response.json().then((data) => {
        const schema = typeToSchema[type];
        if (!schema) {
          throw Error(`No schema for ${type}`);
        }
        const validate = new Ajv().compile(schema);
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
      pleaseWaits: { fakeLayer: true },
    };
  }

  clearPleaseWait() {
    this.setState((prevState) => {
      // TODO: Do not mutate
      // eslint-disable-next-line no-param-reassign
      prevState.pleaseWaits.fakeLayer = false;
      return prevState;
    });
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
    const { pleaseWaits } = this.state;
    if (pleaseWaits.fakeLayer) {
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
