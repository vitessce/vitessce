import React, {
  useState, useEffect, useCallback, useReducer,
} from 'react';

import PubSub from 'pubsub-js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';


import TitleInfo from '../TitleInfo';
import ChannelController from './ChannelController';
import ColormapSelect from './ColormapSelect';

import { RASTER_ADD, LAYER_ADD } from '../../events';
import reducer from './reducer';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: grey,
    secondary: grey,
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
});

const MAX_CHANNELS = 6;
const INITIAL_CHANNELS = {
  sliders: [],
  colors: [],
  selections: [],
  visibilities: [],
  names: [],
  ids: [],
};

const testIds = ['0:1', '0:2'];
const count = 0;

export default function ChannelsSubscriber({ onReady, removeGridComponent }) {
  const [images, setImages] = useState(null);
  const [dimensions, setDimensions] = useState([{ values: [], field: '' }]);
  const [sourceId, setSourceId] = useState(null);
  const [colormap, setColormap] = useState('');
  // TODO: Add control for opacity
  // const [opactiy, setOpacity] = useState(1);

  const [channels, dispatch] = useReducer(reducer, INITIAL_CHANNELS);


  const memoizedOnReady = useCallback(onReady, []);

  useEffect(() => {
    function handleRasterAdd(msg, raster) {
      setImages(raster.images);
    }
    memoizedOnReady();
    const token = PubSub.subscribe(RASTER_ADD, handleRasterAdd);
    return () => PubSub.unsubscribe(token);
  }, [memoizedOnReady]);


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
      const payload = {
        selection: { [dimName]: value },
        name: channelOptions[value],
      };
      dispatch({
        type,
        index,
        value: payload,
        sourceId,
      });
    } else {
      dispatch({
        type, index, value, sourceId,
      });
    }
  };

  const handleChannelAdd = () => {
    // By default choose first option when adding channel
    dispatch({
      type: 'ADD_CHANNEL',
      value: {
        selection: { [dimName]: 0 },
        name: channelOptions[0],
      },
      sourceId,
    });
  };

  const handleAddImage = () => {
    // eslint-disable-next-line no-console
    const { metadata } = images[count];
    setDimensions(metadata.dimensions);
    setSourceId(testIds[count]);
    PubSub.publish(LAYER_ADD, {
      sourceId: testIds[count],
      imageData: images[count],
    });
    // count += 1;
  };

  const { ids } = channels;
  return (
    <TitleInfo title="Channel Controller" isScroll removeGridComponent={removeGridComponent}>
      <ThemeProvider theme={darkTheme}>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
        >
          <Grid item style={{ width: '100%' }}>
            <ColormapSelect value={colormap} handleChange={setColormap} />
          </Grid>
          <button type="button" onClick={handleAddImage}>Add image</button>
          {ids.map((id, i) => (
            <Grid key={`channel-controller-${id}`} item style={{ width: '100%' }}>
              <ChannelController
                name={channels.selections[i][dimName]}
                channelOptions={channelOptions}
                isOn={channels.visibilities[i]}
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
      </ThemeProvider>
    </TitleInfo>
  );
}
