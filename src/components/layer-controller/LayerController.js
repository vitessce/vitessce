/* eslint-disable */
// done
import React, {
  useState, useReducer, useEffect,
} from 'react';
import PubSub from 'pubsub-js';
import { createZarrLoader, createOMETiffLoader } from '@hubmap/vitessce-image-viewer';

import { StyledGrid, StyledAddIcon, 
  StyledExpansionPanel, StyledExpansionPanelSummary, 
  StyledExpansionPanelDetails, StyledExpandMoreIcon, StyledDashedButton
 } from './styles';

import ChannelController from './ChannelController';
import LayerOptions from './LayerOptions';

import { LAYER_ADD, LAYER_CHANGE } from '../../events';
import reducer from './reducer';

// For now these are the global channel selectors.
// We can expand this part of the application as new needs arise.
const GLOBAL_SLIDER_DIMENSION_FIELDS = ['z', 'time'];


function buildDefaultSelection(imageDims, defaultIndex = 0) {
  const selection = {};
  imageDims.forEach((dim) => {
    selection[dim.field] = defaultIndex;
  });
  return selection;
}

async function initLoader(imageData) {
  const {
    type, url, metadata, requestInit,
  } = imageData;
  switch (type) {
    case ('zarr'): {
      const { dimensions, is_pyramid: isPyramid, transform } = metadata;
      const { scale = 0, translate = { x: 0, y: 0 } } = transform;
      const loader = await createZarrLoader({
        url, dimensions, isPyramid, scale, translate,
      });
      return loader;
    }
    case ('ome-tiff'): {
      // Fetch offsets for ome-tiff if needed.
      if ('omeTiffOffsetsUrl' in metadata) {
        const { omeTiffOffsetsUrl } = metadata;
        const res = await fetch(omeTiffOffsetsUrl, requestInit);
        if (res.ok) {
          const offsets = await res.json();
          const loader = await createOMETiffLoader({
            url,
            offsets,
            headers: requestInit,
          });
          return loader;
        }
        throw new Error('Offsets not found but provided.');
      }
      const loader = createOMETiffLoader({
        url,
        headers: requestInit,
      });
      return loader;
    }
    default: {
      throw Error(`Image type (${type}) is not supported`);
    }
  }
}
const MAX_CHANNELS = 6;
const DEFAULT_LAYER_PROPS = {
  colormap: '',
  opacity: 1,
  colors: [],
  sliders: [],
  visibilities: [],
  selections: [],
};

export default function LayerController({ imageData, layerId, handleLayerRemove }) {
  const [colormap, setColormap] = useState(DEFAULT_LAYER_PROPS.colormap);
  const [opacity, setOpacity] = useState(DEFAULT_LAYER_PROPS.opacity);
  const [channels, dispatch] = useReducer(reducer, {});
  const [dimensions, setDimensions] = useState([]);

  useEffect(() => {
    initLoader(imageData).then((loader) => {
      const loaderDimensions = loader.dimensions;
      setDimensions(loaderDimensions);
      PubSub.publish(LAYER_ADD, {
        layerId,
        loader,
        layerProps: DEFAULT_LAYER_PROPS,
      });
      // Add channel on image add automatically as the first avaialable value for each dimension.
      const defaultSelection = buildDefaultSelection(loader.dimensions);
      dispatch({
        type: 'ADD_CHANNEL',
        layerId,
        payload: { selection: defaultSelection },
      });
    });
  }, [layerId, imageData]);

  const handleChannelAdd = () => dispatch({
    type: 'ADD_CHANNEL',
    layerId,
    payload: {
      selection: Object.assign(
        {},
        ...dimensions.map(
          // Set new image to default selection for non-global selections (0)
          // and use current global selection otherwise.
          dimension => ({
            [dimension.field]: GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dimension.field)
              ? Object.values(channels)[0].selection[dimension.field]
              : 0,
          }),
        ),
      ),
    },
  });

  const handleOpacityChange = (sliderValue) => {
    setOpacity(sliderValue);
    PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { opacity: sliderValue } });
  };

  const handleColormapChange = (colormapName) => {
    setColormap(colormapName);
    PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { colormap: colormapName } });
  };

  let channelControllers = [];
  if (dimensions.length > 0) {
    const { values: channelOptions, field: dimName } = dimensions[0];
    channelControllers = Object.entries(channels).map(
      // c is an object like { color, selection, slider, visibility }.
      ([channelId, c]) => {
        // Change one property of a channel (for now - soon
        // nested structures allowing for multiple z/t selecitons at once, for example).
        const handleChannelPropertyChange = (property, value) => {
          // property is something like "selection" or "slider."
          // value is the actual change, like { channel: "DAPI" }.
          dispatch({
            type: 'CHANGE_SINGLE_CHANNEL_PROPERTY',
            layerId,
            payload: {
              channelId,
              property,
              value,
            },
          });
        };
        const handleChannelRemove = () => {
          dispatch({ type: 'REMOVE_CHANNEL', layerId, payload: { channelId } });
        };
        return (
          <StyledGrid
            key={`channel-controller-${channelId}`}
            item
            style={{ width: '100%' }}
          >
            <ChannelController
              dimName={dimName}
              visibility={c.visibility}
              selectionIndex={c.selection[dimName]}
              slider={c.slider}
              color={c.color}
              channelOptions={channelOptions}
              colormapOn={Boolean(colormap)}
              handlePropertyChange={handleChannelPropertyChange}
              handleChannelRemove={handleChannelRemove}
            />
          </StyledGrid>
        );
      },
    );
  }

  const handleGlobalChannelsSelectionChange = ({ selection, event }) => {
    // This call updates all channel selections with new global selection.
    dispatch({
      type: 'CHANGE_GLOBAL_CHANNELS_SELECTION',
      layerId,
      payload: {
        // See https://github.com/hubmapconsortium/vitessce-image-viewer/issues/176 for why
        // we have to check mouseup.
        selection, publish: event.type === 'mouseup',
      },
    });
  };
  return (
    <StyledExpansionPanel defaultExpanded>
      <StyledExpansionPanelSummary
        expandIcon={<StyledExpandMoreIcon />}
        aria-controls={`layer-${imageData.name}-controls`}
      >
        {imageData.name}
      </StyledExpansionPanelSummary>
      <StyledExpansionPanelDetails>
        <StyledGrid item>
          <LayerOptions
            channels={channels}
            dimensions={dimensions}
            opacity={opacity}
            colormap={colormap}
            // Only allow for global dimension controllers that
            // exist in the `dimensions` part of the loader.
            globalControlDimensions={
              dimensions.filter(
                dimension => GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dimension.field),
              )
            }
            handleOpacityChange={handleOpacityChange}
            handleColormapChange={handleColormapChange}
            handleGlobalChannelsSelectionChange={
              handleGlobalChannelsSelectionChange
            }
          />
        </StyledGrid>
        {channelControllers}
        <StyledGrid item>
          <StyledDashedButton
            disabled={Object.values(channels).length === MAX_CHANNELS}
            onClick={handleChannelAdd}
            fullWidth
            variant="outlined"
            startIcon={<StyledAddIcon />}
            size="small"
          >
            Add Channel
          </StyledDashedButton>
        </StyledGrid>
        <StyledGrid item>
          <StyledDashedButton
            onClick={handleLayerRemove}
            fullWidth
            variant="outlined"
            size="small"
          >
            Remove Image Layer
          </StyledDashedButton>
        </StyledGrid>
      </StyledExpansionPanelDetails>
    </StyledExpansionPanel>
  );
}
