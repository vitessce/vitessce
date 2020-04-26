import PubSub from 'pubsub-js';

import { LAYER_CHANGE } from '../../events';

const layerProperty = new Map()
  .set('color', 'colors')
  .set('selection', 'selections')
  .set('slider', 'sliders')
  .set('visibility', 'visibilities');

function channelsToLayerProps(channels) {
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
      const layerProps = {
        [layerProperty.get(property)]: Object.values(nextChannels).map(c => c[property]),
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
