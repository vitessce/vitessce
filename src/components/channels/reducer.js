import PubSub from 'pubsub-js';

import {
  CHANNEL_SLIDERS_CHANGE,
  CHANNEL_COLORS_CHANGE,
  CHANNEL_VISIBILITIES_CHANGE,
  CHANNEL_SELECTIONS_CHANGE,
  CHANNEL_SET,
} from '../../events';

export default function reducer(state, {
  index, value, type, sourceId,
}) {
  switch (type) {
    case 'CHANGE_SELECTION': {
      const { selection } = value;
      const selections = [...state.selections];
      selections[index] = selection;

      PubSub.publish(CHANNEL_SELECTIONS_CHANGE(sourceId), selections);
      return { ...state, selections };
    }
    case 'CHANGE_COLOR': {
      const colors = [...state.colors];
      colors[index] = value;

      PubSub.publish(CHANNEL_COLORS_CHANGE(sourceId), colors);
      return { ...state, colors };
    }
    case 'CHANGE_SLIDER': {
      const sliders = [...state.sliders];
      sliders[index] = value;

      PubSub.publish(CHANNEL_SLIDERS_CHANGE(sourceId), sliders);
      return { ...state, sliders };
    }
    case 'CHANGE_VISIBILITY': {
      const visibilities = [...state.visibilities];
      visibilities[index] = !visibilities[index];

      PubSub.publish(CHANNEL_VISIBILITIES_CHANGE(sourceId), visibilities);
      return { ...state, visibilities };
    }
    case 'ADD_CHANNEL': {
      const { selection } = value;
      const ids = [...state.ids, String(Math.random())];

      const selections = [...state.selections, selection];
      const colors = [...state.colors, [255, 255, 255]];
      const visibilities = [...state.visibilities, true];
      const sliders = [...state.sliders, [0, 20000]];

      PubSub.publish(CHANNEL_SET(sourceId), {
        selections,
        colors,
        visibilities,
        sliders,
      });
      return {
        selections, colors, visibilities, sliders, ids,
      };
    }
    case 'REMOVE_CHANNEL': {
      const ids = state.ids.filter((_, i) => i !== index);

      const selections = state.selections.filter((_, i) => i !== index);
      const colors = state.colors.filter((_, i) => i !== index);
      const visibilities = state.visibilities.filter((_, i) => i !== index);
      const sliders = state.sliders.filter((_, i) => i !== index);

      PubSub.publish(CHANNEL_SET(sourceId), {
        selections,
        colors,
        visibilities,
        sliders,
      });
      return {
        selections, colors, visibilities, sliders, ids,
      };
    }
    case 'RESET_CHANNELS': {
      return {
        sliders: [],
        colors: [],
        selections: [],
        visibilities: [],
        names: [],
        ids: [],
      };
    }
    default:
      throw new Error();
  }
}
