import React, { useState, useEffect, useCallback } from 'react';

import PubSub from 'pubsub-js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';


import TitleInfo from '../TitleInfo';
import LayerController from './LayerController';
import { RASTER_ADD } from '../../events';

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

const testIds = ['0:1', '0:2'];
let count = 0;

function LayerControllerSubscriber({ onReady, removeGridComponent }) {
  const [imageOptions, setImageOptions] = useState(null);
  const [layers, setLayers] = useState([]);
  const memoizedOnReady = useCallback(onReady, []);

  useEffect(() => {
    function handleRasterAdd(msg, raster) {
      setImageOptions(raster.images);
    }
    memoizedOnReady();
    const token = PubSub.subscribe(RASTER_ADD, handleRasterAdd);
    return () => PubSub.unsubscribe(token);
  }, [memoizedOnReady]);

  const handleAddImage = () => {
    setLayers([
      ...layers,
      { id: testIds[count], imageData: imageOptions[count] },
    ]);
    count += 1;
  };

  return (
    <TitleInfo title="Layer Controller" isScroll removeGridComponent={removeGridComponent}>
      <ThemeProvider theme={darkTheme}>
        {layers.map(({ id, imageData }) => (
          <Grid key={id} item>
            <LayerController layerId={id} imageData={imageData} />
          </Grid>
        ))}
        <Grid item>
          <Button
            onClick={handleAddImage}
            fullWidth
            variant="outlined"
            style={{ borderStyle: 'dashed', marginTop: '10px' }}
            startIcon={<AddIcon />}
            size="small"
          >
            Add Image Layer
          </Button>
        </Grid>
      </ThemeProvider>
    </TitleInfo>
  );
}

export default LayerControllerSubscriber;
