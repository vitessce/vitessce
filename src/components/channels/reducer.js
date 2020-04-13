import PubSub from 'pubsub-js';

import {
  SLIDERS_CHANGE, COLORS_CHANGE, CHANNEL_VISIBILITY_CHANGE, CHANNEL_SELECTION_CHANGE,
} from '../../events';

export default function reducer(state, {
  index, value, type, sourceId,
}) {
  switch (type) {
    case 'CHANGE_SELECTION': {
      // Changes name and selection for channel by index
      const { name, selection } = value;
      const names = [...state.names];
      const selections = [...state.selections];
      names[index] = name;
      selections[index] = selection;

      PubSub.publish(CHANNEL_SELECTION_CHANGE(sourceId), selections);
      return { ...state, names, selections };
    }
    case 'CHANGE_COLOR': {
      // Changes color for individual channel by index
      const colors = [...state.colors];
      colors[index] = value;

      PubSub.publish(COLORS_CHANGE(sourceId), colors);
      return { ...state, colors };
    }
    case 'CHANGE_SLIDER': {
      // Changes slider for individual channel by index
      const sliders = [...state.sliders];
      sliders[index] = value;

      PubSub.publish(SLIDERS_CHANGE(sourceId), sliders);
      return { ...state, sliders };
    }
    case 'CHANGE_VISIBILITY': {
      // Toggles invidiual channel on and off by index
      const isOn = [...state.isOn];
      isOn[index] = !isOn[index];

      PubSub.publish(CHANNEL_VISIBILITY_CHANGE(sourceId), isOn);
      return { ...state, isOn };
    }
    case 'ADD_CHANNEL': {
      // Adds an additional channel
      const { name, selection } = value;
      const names = [...state.names, name];
      const ids = [...state.ids, String(Math.random())];

      const selections = [...state.selections, selection];
      const colors = [...state.colors, [255, 255, 255]];
      const isOn = [...state.isOn, true];
      const sliders = [...state.sliders, [0, 20000]];

      PubSub.publish(CHANNEL_SELECTION_CHANGE(sourceId), selections);
      PubSub.publish(COLORS_CHANGE(sourceId), colors);
      PubSub.publish(CHANNEL_VISIBILITY_CHANGE(sourceId), isOn);
      PubSub.publish(SLIDERS_CHANGE(sourceId), sliders);
      return {
        names, selections, colors, isOn, sliders, ids,
      };
    }
    case 'REMOVE_CHANNEL': {
      // Remove a single channel by index
      const names = state.names.filter((_, i) => i !== index);
      const ids = state.ids.filter((_, i) => i !== index);

      const selections = state.selections.filter((_, i) => i !== index);
      const colors = state.colors.filter((_, i) => i !== index);
      const isOn = state.isOn.filter((_, i) => i !== index);
      const sliders = state.sliders.filter((_, i) => i !== index);

      PubSub.publish(CHANNEL_SELECTION_CHANGE(sourceId), selections);
      PubSub.publish(COLORS_CHANGE(sourceId), colors);
      PubSub.publish(CHANNEL_VISIBILITY_CHANGE(sourceId), isOn);
      PubSub.publish(SLIDERS_CHANGE(sourceId), sliders);
      return {
        names, sliders, colors, isOn, ids, selections,
      };
    }
    default:
      throw new Error();
  }
}
