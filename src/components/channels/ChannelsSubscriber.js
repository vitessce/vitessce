import React, {
  useState, useEffect, useCallback, useReducer,
} from 'react';
import PubSub from 'pubsub-js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

import TitleInfo from '../TitleInfo';
import { RASTER_ADD } from '../../events';

import ChannelController from './ChannelController';
import ColormapSelect from './ColormapSelect';

import reducer from './reducer';

const MAX_CHANNELS = 6;
const initialChannels = {
  sliders: [],
  colors: [],
  selections: [],
  names: [],
  ids: [],
  isOn: [],
};

export default function ChannelsSubscriber({ onReady, removeGridComponent }) {
  const [dimensions, setDimensions] = useState(null);
  const [sourceId, setSourceId] = useState(null);
  const [colormap, setColormap] = useState('');
  // TODO: Add control for opacity
  // const [opactiy, setOpacity] = useState(1);

  const [channels, dispatch] = useReducer(reducer, initialChannels);


  const memoizedOnReady = useCallback(onReady, []);

  useEffect(() => {
    function handleRasterAdd(msg, raster) {
      setDimensions(raster.dimensions);
      setSourceId(raster.id);
    }
    memoizedOnReady();
    const token = PubSub.subscribe(RASTER_ADD, handleRasterAdd);
    return () => PubSub.unsubscribe(token);
  }, [memoizedOnReady]);


  if (!dimensions && !sourceId) return null;

  /*
  * TODO: Add UI support for making multi-dimensional selections
  *
  * Current UI assumes data are 3D (i.e. [channel/mz, y, x]),
  * so we just look at the first dimension to create the UI components
  * for changing selections.
  */
  const { values: channelOptions, field: dimName } = dimensions[0];

  /*
  * Handles updating state for each channel controller.
  *
  * A channel selection is an object where the keys correspond to a dimension name,
  * and the values are the index along that axis. The loaders (which are specific to
  * the data format) are aware of serialize this selection and return an image pane.
  *
  * Examples:
  *   const firstChannelSelection = { channel: 0 }; // Defaults to 0 for other dimensions
  *   const firstChannelAndSecondTime = { channel: 0, time: 1 };
  *
  * PubSub CHANNEL_SELECTION_CHANGE events thus emit an array of selections:
  *
  *   const selectionPayload = [
  *       { channel: 0, time: 2 },
  *       { channel: 1, time: 2 },
  *       { channel: 2, time: 2 },
  *   ];
  */
  const handleControllerChange = (index, type, value) => {
    if (type === 'CHANGE_SELECTION') {
      dispatch(type, {
        index,
        value: {
          selection: { [dimName]: value },
          name: channelOptions[value],
        },
        sourceId,
      });
    } else {
      dispatch(type, { index, value, sourceId });
    }
  };

  const handleChannelAdd = () => {
    // By default choose first option when adding channel
    dispatch('ADD_CHANNEL', {
      value: {
        selection: { [dimName]: 0 },
        name: channelOptions[0],
      },
      sourceId,
    });
  };

  const { ids } = channels;
  return (
    <TitleInfo title="Channel Controller" isScroll removeGridComponent={removeGridComponent}>
      <Grid
        container
        direction="column"
        spacing={1}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <ColormapSelect value={colormap} handleChange={setColormap} />
        </Grid>
        {ids.map((id, i) => (
          <Grid key={`channel-controller-${channels.names[i]}-${id}`} item>
            <ChannelController
              name={channels.names[i]}
              channelOptions={channelOptions}
              isOn={channels.isOn[i]}
              sliderValue={channels.sliders[i]}
              colorValue={channels.colors[i]}
              handleChange={(type, value) => handleControllerChange(i, type, value)}
              colormapOn={colormap !== ''}
            />
          </Grid>
        ))}
      </Grid>
      <Grid item>
        <Button
          disabled={ids.length === MAX_CHANNELS}
          onClick={handleChannelAdd}
          fullWidth
          variant="outlined"
          style={{ borderStyle: 'dashed' }}
          startIcon={<AddIcon />}
          size="small"
        >
            Add Channel
        </Button>
      </Grid>
    </TitleInfo>
  );
}
