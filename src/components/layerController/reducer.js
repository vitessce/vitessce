import PubSub from 'pubsub-js';

import { LAYER_CHANGE } from '../../events';

const layerProperty = {
  color: 'colors',
  selection: 'selections',
  slider: 'sliders',
  visibilitiy: 'visibilities',
};

function channelsToLayerProps(channels) {
  /*
  * Converts channels object to corresponding layerProps arrays
  *
  * const channels = {
  *   'c1': {color: [55, 55, 0], selection: [0, 0, 0], visibility: true, slider: [0, 200]}
  *   'c2': {color: [5, 20, 25], selection: [1, 0, 0], visibility: true, slider: [2, 300]}
  * };
  * const { selections, sliders, colors, visibilities } = channelsToLayerProps(channels);
  *
  */
  const selections = [];
  const sliders = [];
  const colors = [];
  const visibilities = [];
  Object.values(channels).forEach((c) => {
    selections.push(c.selection);
    sliders.push(c.slider);
    visibilities.push(c.visibility);
    colors.push(c.color);
  });
  return {
    selections, sliders, colors, visibilities,
  };
}

export default function reducer(channels, action) {
  const { type, layerId, payload } = action;
  switch (type) {
    case 'CHANGE_PROPERTY': {
      const { channelId, property, value } = payload;
      const nextChannels = {
        ...channels,
        [channelId]: {
          ...channels[channelId],
          [property]: property === 'visibility' ? !channels[channelId].visibility : value,
        },
      };
      /*
      * Sending the entire state on each property change was causing performance issues.
      * Instead, LAYER_CHANGE events expect a `layerProps` object in the payload,
      * which just includes key value pairs which need to be updated for
      * the corresponding VivViewerLayer in Spatial.js.
      *
      * e.g. valid layerProps:
      *
      *  const changeOneLayerProp = { visibilities: [false, true] }
      *  const changeTwoLayerProps = {
      *    colors: [[255, 255, 255], [200, 0, 200]],
      *    sliders: [[0, 2000], [20, 2000]]
      *  }
      */
      const propertyToUpdate = layerProperty[property];
      const updatedValues = Object.values(nextChannels).map(c => c[property]);
      const layerProps = {
        [propertyToUpdate]: updatedValues,
      };
      PubSub.publish(LAYER_CHANGE, { layerId, layerProps });
      return nextChannels;
    }
    case 'ADD_CHANNEL': {
      const { selection } = payload;
      const channel = {
        selection,
        color: [255, 255, 255],
        visibility: true,
        slider: [0, 20000],
      };
      const channelId = String(Math.random());
      const nextChannels = { ...channels, [channelId]: channel };
      const layerProps = channelsToLayerProps(nextChannels);
      PubSub.publish(LAYER_CHANGE, { layerId, layerProps });
      return nextChannels;
    }
    case 'REMOVE_CHANNEL': {
      const { channelId } = action.payload;
      const { [channelId]: _, ...nextChannels } = channels;
      const layerProps = channelsToLayerProps(nextChannels);
      PubSub.publish(LAYER_CHANGE, { layerId, layerProps });
      return nextChannels;
    }
    case 'RESET_CHANNELS': {
      const layerProps = channelsToLayerProps({});
      PubSub.publish(LAYER_CHANGE, { layerId, layerProps });
      return {};
    }
    default:
      throw new Error(`Channel update type '${type}' is not valid.`);
  }
}
