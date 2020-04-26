import PubSub from 'pubsub-js';

import { LAYER_CHANGE } from '../../events';

export default function reducer(state, action) {
  const { type, layerId, payload } = action;
  switch (type) {
    case 'CHANGE_COLOR': {
      const { index, value } = payload;
      const colors = [...state.colors];
      colors[index] = value;
      PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { colors } });
      return { ...state, colors };
    }
    case 'CHANGE_VISIBILITY': {
      const { index } = payload;
      const visibilities = [...state.visibilities];
      visibilities[index] = !visibilities[index];
      PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { visibilities } });
      return { ...state, visibilities };
    }
    case 'CHANGE_SLIDER': {
      const { index, value } = payload;
      const sliders = [...state.sliders];
      sliders[index] = value;
      PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { sliders } });
      return { ...state, sliders };
    }
    case 'CHANGE_SELECTION': {
      const { index, value } = payload;
      const selections = [...state.selections];
      selections[index] = value;
      PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { selections } });
      return { ...state, selections };
    }
    case 'ADD_CHANNEL': {
      const { selection } = payload;
      const layerUpdate = {
        selections: [...state.selections, selection],
        colors: [...state.colors, [255, 255, 255]],
        visibilities: [...state.visibilities, true],
        sliders: [...state.sliders, [0, 20000]],
      };
      PubSub.publish(LAYER_CHANGE, { layerId, layerProps: layerUpdate });
      return { ...state, ...layerUpdate };
    }
    case 'ADD_LOADER': {
      const { loader } = payload;
      return { ...state, loader };
    }
    case 'REMOVE_CHANNEL': {
      const { index } = action.payload;
      const colors = state.colors.filter((_, i) => i !== index);
      const selections = state.selections.filter((_, i) => i !== index);
      const visibilities = state.visibilities.filter((_, i) => i !== index);
      const sliders = state.sliders.filter((_, i) => i !== index);
      PubSub.publish(LAYER_CHANGE, {
        layerId,
        layerProps: {
          colors, selections, visibilities, sliders,
        },
      });
      return {
        ...state, colors, selections, visibilities, sliders,
      };
    }
    case 'RESET_CHANNELS': {
      const channels = {};
      return { ...state, channels };
    }
    default:
      throw new Error();
  }
}
