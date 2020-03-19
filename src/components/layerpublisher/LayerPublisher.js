import Ajv from 'ajv';
import PubSub from 'pubsub-js';
import React from 'react';
import { createTiffPyramid } from '@hubmap/vitessce-image-viewer';
import { openArray } from 'zarr';
import { ZarrLoader } from 'vitessce-image-loader';

import {
  STATUS_WARN, STATUS_INFO,
  CELLS_ADD, CLUSTERS_ADD, FACTORS_ADD, GENES_ADD, MOLECULES_ADD, NEIGHBORHOODS_ADD,
  CLEAR_PLEASE_WAIT, RASTER_ADD,
} from '../../events';

import cellsSchema from '../../schemas/cells.schema.json';
import clustersSchema from '../../schemas/clusters.schema.json';
import factorsSchema from '../../schemas/factors.schema.json';
import genesSchema from '../../schemas/genes.schema.json';
import moleculesSchema from '../../schemas/molecules.schema.json';
import neighborhoodsSchema from '../../schemas/neighborhoods.schema.json';
import rasterSchema from '../../schemas/raster.schema.json';

const typeToSchema = {
  CELLS: cellsSchema,
  CLUSTERS: clustersSchema,
  FACTORS: factorsSchema,
  GENES: genesSchema,
  MOLECULES: moleculesSchema,
  NEIGHBORHOODS: neighborhoodsSchema,
  RASTER: rasterSchema,
};

const typeToEvent = {
  CELLS: CELLS_ADD,
  CLUSTERS: CLUSTERS_ADD,
  FACTORS: FACTORS_ADD,
  GENES: GENES_ADD,
  MOLECULES: MOLECULES_ADD,
  NEIGHBORHOODS: NEIGHBORHOODS_ADD,
  RASTER: RASTER_ADD,
};

function warn(message) {
  PubSub.publish(STATUS_WARN, message);
}

function info(fileName) {
  PubSub.publish(STATUS_INFO, `Loaded ${fileName}.`);
}

async function initRasterLayer(data) {
  const channelNames = Object.keys(data);
  const channelUrls = Object.values(data).map(d => d.tileSource);
  const raster = {
    dimensions: [
      { name: 'channel', type: 'nominal', values: channelNames },
      { name: 'y', type: 'quantitative' },
      { name: 'x', type: 'quantitative' },
    ],
    domains: Object.values(data).map(d => d.range),
    uniqueRasterId: String(Date.now()),
  };
  if (channelUrls[0].includes('tif')) {
    const loader = await createTiffPyramid({ channelNames, channelUrls });
    return { ...raster, loader };
  } if (channelUrls[0].includes('zarr')) {
    const rootZarrUrl = channelUrls[0];
    const { minZoom } = Object.values(data)[0];
    const requests = [];
    for (let i = 0; i < -minZoom; i += 1) {
      const config = {
        store: `${rootZarrUrl}${String(i).padStart(2, '0')}`,
        mode: 'r',
      };
      requests.push(openArray(config));
    }
    const pyramid = await Promise.all(requests);
    const loader = new ZarrLoader(pyramid, false, 1, raster.dimensions);
    return { ...raster, loader };
  }
  throw Error(`No raster loader defined for image with tile source ${channelUrls[0]}`);
}

function publishLayer(data, type, name, url) {
  const schema = typeToSchema[type];
  if (!schema) {
    throw Error(`No schema for ${type}`);
  }
  const validate = new Ajv().compile(schema);
  const valid = validate(data);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    warn(`Error while validating ${name}. Details in console.`);
    console.warn(`"${name}" (${type}) from ${url}: validation failed`, failureReason);
  }

  if (type === 'RASTER' || type === 'IMS') {
    initRasterLayer(data).then((rasterData) => {
      PubSub.publish(RASTER_ADD, rasterData);
      info(name);
    });
  } else {
    PubSub.publish(typeToEvent[type], data);
    info(name);
  }
}

function loadLayer(layer) {
  const {
    name, type, url, requestInit = {},
  } = layer;
  fetch(url, requestInit)
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          publishLayer(data, type, name, url);
        }, (failureReason) => {
          warn(`Error while parsing ${name}. Details in console.`);
          console.warn(`"${name}" (${type}) from ${url}: parse failed`, failureReason);
        });
      } else {
        warn(`Error HTTP status from ${name}. Details in console.`);
        console.warn(`"${name}" (${type}) from ${url}: HTTP failed`, response.headers);
      }
    }, (failureReason) => {
      warn(`Error while fetching ${name}. Details in console.`);
      console.warn(`"${name}" (${type}) from ${url}: fetch failed`, failureReason);
    });
}

export default class LayerPublisher extends React.Component {
  constructor(props) {
    super(props);
    const { layers } = this.props;
    const pleaseWaits = {};
    layers.map(layer => layer.name).forEach((name) => { pleaseWaits[name] = true; });
    this.state = { pleaseWaits };
  }

  clearPleaseWait(event, layerName) {
    this.setState((prevState) => {
      // TODO: Do not mutate! https://github.com/hubmapconsortium/vitessce/issues/148
      // eslint-disable-next-line no-param-reassign
      prevState.pleaseWaits[layerName] = false;
      const waitingOn = Object.entries(prevState.pleaseWaits)
        .filter(entry => entry[1])
        .map(entry => entry[0]);
      console.warn(`cleared "${layerName}"; waiting on ${waitingOn.length}:`, waitingOn);
      return prevState;
    });
  }

  componentWillMount() {
    this.clearPleaseWaitToken = PubSub.subscribe(
      CLEAR_PLEASE_WAIT, this.clearPleaseWait.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.clearPleaseWaitToken);
  }

  componentDidMount() {
    const { layers } = this.props;
    layers.forEach((layer) => {
      loadLayer(layer);
    });
  }

  render() {
    const { pleaseWaits } = this.state;
    const unloadedLayers = Object.entries(pleaseWaits).filter(
      ([name, stillWaiting]) => stillWaiting, // eslint-disable-line no-unused-vars
    ).map(
      ([name, stillWaiting]) => name, // eslint-disable-line no-unused-vars
    );

    if (unloadedLayers.length) {
      return (
        <React.Fragment>
          <div className="modal">
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
    return null;
  }
}
