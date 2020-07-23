// eslint-disable-next-line vitessce-rules/prevent-pubsub-import
import PubSub from 'pubsub-js';
import React, { useEffect, useState } from 'react';

import {
  STATUS_WARN, STATUS_INFO,
  CLEAR_PLEASE_WAIT, RESET,
} from '../../events';

import { typeToEvent } from './types';
import { extensionToLoader } from './extensions';
import { JsonLoader as DefaultLoader } from '../../loaders/index';
import { AbstractLoaderError } from '../../loaders/errors/index';


function warn(error) {
  PubSub.publish(STATUS_WARN, error.message);
  console.warn(error.message);
  if (error instanceof AbstractLoaderError) {
    error.warnInConsole();
  }
}

function info(fileName) {
  PubSub.publish(STATUS_INFO, `Loaded ${fileName}.`);
}

function reset() {
  PubSub.publish(RESET, {});
}

function loadLayer(layer) {
  const {
    name, type, url,
  } = layer;

  // Iterate over loaders in reverse priority order,
  // and choose the best match based on the URL file extension.
  let loaderClass = DefaultLoader;
  extensionToLoader.forEach((extLoader, ext) => {
    if (url.endsWith(ext)) {
      loaderClass = extLoader;
    }
  });

  // eslint-disable-next-line new-cap
  const loader = new loaderClass(layer);
  loader.load()
    .then((data) => {
      PubSub.publish(typeToEvent[type], { data, url });
      info(name);
    })
    .catch(warn);
}

export default function SourcePublisher({ layers, height }) {
  const [pleaseWaits, setPleaseWaits] = useState({});

  useEffect(() => {
    function clearPleaseWait(event, layerName) {
      setPleaseWaits((prevPleaseWaits) => {
        const newPleaseWaits = { ...prevPleaseWaits };
        // TODO: Do not mutate! https://github.com/hubmapconsortium/vitessce/issues/148
        // eslint-disable-next-line no-param-reassign
        newPleaseWaits[layerName] = false;
        const waitingOn = Object.entries(newPleaseWaits)
          .filter(entry => entry[1])
          .map(entry => entry[0]);
        console.warn(
          `cleared "${layerName}"; waiting on ${waitingOn.length}:`,
          waitingOn,
        );
        return newPleaseWaits;
      });
    }
    reset();
    const newPleaseWaits = {};
    layers.map(layer => layer.name).forEach((name) => { newPleaseWaits[name] = true; });
    layers.forEach((layer) => {
      loadLayer(layer);
    });
    setPleaseWaits(newPleaseWaits);
    const token = PubSub.subscribe(
      CLEAR_PLEASE_WAIT, clearPleaseWait,
    );
    return () => PubSub.unsubscribe(token);
  }, [layers]);

  const unloadedLayers = Object.entries(pleaseWaits).filter(
    ([name, stillWaiting]) => stillWaiting, // eslint-disable-line no-unused-vars
  ).map(
    ([name, stillWaiting]) => name, // eslint-disable-line no-unused-vars
  );

  if (unloadedLayers.length) {
    return (
      <>
        <div className="modal">
          <div className="modal-dialog">
            <div
              className="please-wait-spinner"
              title="Please wait..."
              style={{ marginTop: `${(height - 100) / 2}px` }}
            />
          </div>
        </div>
        <div className="modal-backdrop show" />
      </>
    );
  }
  return null;
}
