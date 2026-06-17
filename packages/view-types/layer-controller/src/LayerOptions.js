import React from 'react';
import { useId } from 'react-aria';
import { range } from 'lodash-es';
import { Matrix4 } from 'math.gl';
import { Grid, Slider, InputLabel, NativeSelect, Checkbox } from '@vitessce/styles';
import { viv } from '@vitessce/gl';
import {
  getBoundingCube,
  getMultiSelectionStats,
  DEFAULT_RASTER_DOMAIN_TYPE,
  canLoadResolution,
  getStatsForResolution,
} from '@vitessce/spatial-utils';
import {
  COLORMAP_OPTIONS,
  formatBytes,
} from '@vitessce/utils';
import {
  useSelectionSliderStyles,
  useSelectStyles,
  useChannelSliderStyles,
} from './styles.js';

const DOMAIN_OPTIONS = ['Full', 'Min/Max'];

/**
 * Wrapper for the dropdown that selects a colormap (None, viridis, magma, etc.).
 * @prop {Object} loader Loader object with metadata.
 * @prop {function} handleMultiPropertyChange Function to propgate multiple layer changes at once.
 * This prevents updates from overridding each other.
 * @prop {number} resolution Current 3D resolution.
 * @prop {boolean} disable3d Whether or not to enable 3D selection
 * @prop {function} setRasterLayerCallback Setter for callbacks that fire after raster/volume loads.
 * @prop {function} setAreAllChannelsLoading Setter for whether or not a given channel is loading.
 * @prop {Object} setViewState Setter for the current view state.
 * @prop {number} spatialHeight Height of the spatial component.
 * @prop {number} spatialWidth Width of the spatial component.
 * @prop {object} channels Channels object.
 * @prop {boolean} use3d Whether or not 3D is enabled for this layer.
 */
function VolumeDropdown({
  loader: loaderWithMeta,
  handleMultiPropertyChange,
  resolution: currResolution,
  disable3d,
  setRasterLayerCallback,
  setAreAllChannelsLoading,
  setViewState,
  spatialHeight,
  spatialWidth,
  channels,
  use3d,
  modelMatrix,
}) {
  const { classes } = useSelectStyles();
  const selections = channels.map(i => i.selection);
  const { data: loader } = loaderWithMeta;
  const handleChange = async (val) => {
    // val is the resolution - null indicates 2D
    const shouldUse3D = typeof val === 'number';
    setAreAllChannelsLoading(true);
    setRasterLayerCallback(() => {
      setAreAllChannelsLoading(false);
      setRasterLayerCallback(null);
    });
    if (shouldUse3D) {
      const [xSlice, ySlice, zSlice] = getBoundingCube(loader);
      const propertiesChanged = {
        resolution: val,
        xSlice,
        ySlice,
        zSlice,
        use3d: shouldUse3D,
      };
      // Only make the fetch if needed i.e if the 3d was just being turned on.
      if (!use3d) {
        const { sliders } = await getMultiSelectionStats({
          loader,
          selections,
          use3d: shouldUse3D,
        });
        propertiesChanged.channels = [...channels];
        propertiesChanged.channels.forEach((ch, i) => {
          // eslint-disable-next-line no-param-reassign
          ch.slider = sliders[i];
        });
      }
      // Update all properties at once to avoid overriding calls.
      handleMultiPropertyChange(propertiesChanged);
      const defaultViewState = viv.getDefaultInitialViewState(loader,
        { height: spatialHeight, width: spatialWidth }, 1.5, true, new Matrix4(modelMatrix));
      setViewState({
        ...defaultViewState,
        rotationX: 0,
        rotationOrbit: 0,
      });
    } else {
      const { sliders } = await getMultiSelectionStats({
        loader, selections, use3d: shouldUse3D,
      });
      const newChannels = [...channels];
      newChannels.forEach((ch, i) => {
        // eslint-disable-next-line no-param-reassign
        ch.slider = sliders[i];
      });
      // Update all properties at once to avoid overriding calls.
      handleMultiPropertyChange({
        resolution: val,
        use3d: shouldUse3D,
        spatialAxisFixed: false,
        channels: newChannels,
      });
      const defaultViewState = viv.getDefaultInitialViewState(loader,
        { height: spatialHeight, width: spatialWidth }, 0.5, false, new Matrix4(modelMatrix));
      setViewState({
        ...defaultViewState,
        rotationX: null,
        rotationOrbit: null,
        orbitAxis: null,
      });
    }
  };
  const { labels, shape } = Array.isArray(loader) ? loader[0] : loader;
  const hasZStack = shape[labels.indexOf('z')] > 1;
  return (
    <>
      <NativeSelect
        value={currResolution}
        onChange={e => handleChange(
          e.target.value === '2D' ? e.target.value : Number(e.target.value),
        )
        }
        inputProps={{ 'aria-label': 'Resolution selector' }}
        classes={{ root: classes.selectRoot }}
      >
        <option key="2D" value="2D">
          2D Visualization
        </option>
        {Array.from({ length: loader.length })
          .fill(0)
          // eslint-disable-next-line no-unused-vars
          .map((_, resolution) => {
            if (loader) {
              if (canLoadResolution(loader, resolution)) {
                const {
                  height,
                  width,
                  depthDownsampled,
                  totalBytes,
                } = getStatsForResolution(loader, resolution);
                return (
                  <option
                    key={`(${height}, ${width}, ${depthDownsampled})`}
                    value={resolution}
                    disabled={
                      disable3d
                      || !hasZStack
                    }
                  >
                    {`3D: ${resolution}x Downsampled, ~${formatBytes(
                      totalBytes,
                    )} per channel, (${height}, ${width}, ${depthDownsampled})`}
                  </option>
                );
              }
            }
            return null;
          })}
      </NativeSelect>
    </>
  );
}


/**
 * Wrapper for the dropdown that selects a colormap (None, viridis, magma, etc.).
 * @prop {string} value Currently selected value for the colormap.
 * @prop {string} inputId Css id.
 * @prop {function} handleChange Callback for every change in colormap.
 */
function ColormapSelect({ value, inputId, handleChange }) {
  const { classes } = useSelectStyles();
  return (
    <NativeSelect
      onChange={e => handleChange(e.target.value === '' ? null : e.target.value)}
      value={value}
      inputProps={{ name: 'colormap', id: inputId, 'aria-label': 'Colormap selector' }}
      style={{ width: '100%' }}
      classes={{ root: classes.selectRoot }}
    >
      <option aria-label="None" value="">None</option>
      {COLORMAP_OPTIONS.map(name => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </NativeSelect>
  );
}

function TransparentColorCheckbox({ value, inputId, handleChange }) {
  return (
    <Checkbox
      style={{ float: 'left', padding: 0 }}
      color="default"
      onChange={() => {
        if (value) {
          handleChange(null);
        } else {
          handleChange([0, 0, 0]);
        }
      }}
      checked={Boolean(value)}
      id={inputId}
      slotProps={{ input: { 'aria-label': 'Enable or disable color transparency' } }}
    />
  );
}

/**
 * Wrapper for the slider that updates opacity.
 * @prop {string} value Currently selected value between 0 and 1.
 * @prop {function} handleChange Callback for every change in opacity.
 */
function OpacitySlider({ value, inputId, handleChange }) {
  const { classes } = useChannelSliderStyles();

  return (
    <Slider
      slotProps={{ valueLabel: { className: classes.sliderValueLabel } }}
      value={value}
      onChange={(e, v) => handleChange(v)}
      valueLabelDisplay="auto"
      aria-label="Layer opacity slider"
      id={inputId}
      min={0}
      max={1}
      step={0.01}
      orientation="horizontal"
    />
  );
}

/**
 * Wrapper for the dropdown that chooses the domain type.
 * @prop {string} value Currently selected value (i.e 'Max/Min').
 * @prop {string} inputId Css id.
 * @prop {function} handleChange Callback for every change in domain.
 */
function SliderDomainSelector({ value, inputId, handleChange }) {
  const { classes } = useSelectStyles();
  return (
    <NativeSelect
      onChange={e => handleChange(e.target.value)}
      value={value}
      id={inputId}
      inputProps={{ name: 'domain-selector', 'aria-label': 'Domain type selector' }}
      style={{ width: '100%' }}
      classes={{ root: classes.selectRoot }}
    >
      {DOMAIN_OPTIONS.map(name => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </NativeSelect>
  );
}

/**
 * Wrapper for the slider that chooses global selections (z, t etc.).
 * @prop {string} field The dimension this selects for (z, t etc.).
 * @prop {number} value Currently selected index (1, 4, etc.).
 * @prop {function} handleChange Callback for every change in selection.
 * @prop {function} possibleValues All available values for the field.
 */
function GlobalSelectionSlider({
  field,
  value,
  inputId,
  handleChange,
  possibleValues,
}) {
  const { classes } = useSelectionSliderStyles();
  return (
    <Slider
      classes={{ root: classes.selectionSliderRoot, markActive: classes.markActive }}
      value={value}
      // See https://github.com/hms-dbmi/viv/issues/176 for why
      // we have the two handlers.
      onChange={
        (event, newValue) => {
          handleChange({ selection: { [field]: newValue }, event });
        }
      }
      onChangeCommitted={
        (event, newValue) => {
          handleChange({ selection: { [field]: newValue }, event });
        }
      }
      valueLabelDisplay="auto"
      aria-label={`${field} slider`}
      id={inputId}
      marks={possibleValues.map(val => ({ value: val }))}
      min={Number(possibleValues[0])}
      max={Number(possibleValues.slice(-1))}
      orientation="horizontal"
      step={null}
    />
  );
}

/**
 * Wrapper for each of the options to show its name and then its UI component.
 * @prop {string} name Display name for option.
 * @prop {number} opacity Current opacity value.
 * @prop {string} inputId An id for css.
 * @prop {object} children Components to be rendered next to the name (slider, dropdown etc.).
 */
function LayerOption({ name, inputId, children }) {
  return (
    <Grid container direction="row" alignItems="center" justifyContent="center">
      <Grid size={6}>
        <InputLabel htmlFor={inputId}>{name}:</InputLabel>
      </Grid>
      <Grid size={6}>
        {children}
      </Grid>
    </Grid>
  );
}

/**
 * Gloabl options for all channels (opacity, colormap, etc.).
 * @prop {string} colormap What colormap is currently selected (None, viridis etc.).
 * @prop {number} opacity Current opacity value.
 * @prop {function} handleColormapChange Callback for when colormap changes.
 * @prop {function} handleOpacityChange Callback for when opacity changes.
 * @prop {object} globalControlLabels All available options for global control (z and t).
 * @prop {function} handleGlobalChannelsSelectionChange Callback for global selection changes.
 * @prop {function} handleDomainChange Callback for domain type changes (full or min/max).
 * @prop {array} channels Current channel object for inferring the current global selection.
 * @prop {array} dimensions Currently available dimensions (channel, z, t etc.).
 * @prop {string} domainType One of Max/Min or Full (soon presets as well).
 * @prop {boolean} disableChannelsIfRgbDetected Whether or not we need colormap controllers if RGB.
 */
function LayerOptions({
  colormap,
  opacity,
  handleColormapChange,
  handleOpacityChange,
  handleTransparentColorChange,
  globalControlLabels,
  globalLabelValues,
  handleGlobalChannelsSelectionChange,
  handleSliderChange,
  handleDomainChange,
  transparentColor,
  channels,
  domainType,
  disableChannelsIfRgbDetected,
  shouldShowTransparentColor,
  shouldShowDomain,
  shouldShowColormap,
  use3d,
  loader,
  handleMultiPropertyChange,
  resolution,
  disable3d,
  setRasterLayerCallback,
  setAreAllChannelsLoading,
  setViewState,
  spatialHeight,
  spatialWidth,
  modelMatrix,
}) {
  const { labels, shape } = Array.isArray(loader.data) ? loader.data[0] : loader.data;
  const hasDimensionsAndChannels = labels.length > 0 && channels.length > 0;
  const hasZStack = shape[labels.indexOf('z')] > 1;
  // Only show volume button if we can actually view resolutions.
  const hasViewableResolutions = Boolean(Array.from({
    length: loader.data.length,
  }).filter((_, res) => canLoadResolution(loader.data, res)).length);

  const globalSelectionSliderId = useId();
  const colormapSelectId = useId();
  const domainSelectorId = useId();
  const opacitySliderId = useId();
  const zeroTransparentId = useId();
  return (
    <Grid container direction="column" sx={{ width: '100%' }}>
      {hasZStack
        && !disable3d
        && hasViewableResolutions
        && (
        <VolumeDropdown
          loader={loader}
          handleSliderChange={handleSliderChange}
          handleDomainChange={handleDomainChange}
          channels={channels}
          handleMultiPropertyChange={handleMultiPropertyChange}
          resolution={resolution}
          disable3d={disable3d}
          setRasterLayerCallback={setRasterLayerCallback}
          setAreAllChannelsLoading={setAreAllChannelsLoading}
          setViewState={setViewState}
          spatialHeight={spatialHeight}
          spatialWidth={spatialWidth}
          use3d={use3d}
          modelMatrix={modelMatrix}
        />
        )
      }
      {hasDimensionsAndChannels
        && !use3d
        && globalControlLabels.map(
          field => shape[labels.indexOf(field)] > 1 && (
          <LayerOption name={field} inputId={`${field}-${globalSelectionSliderId}`} key={field}>
            <GlobalSelectionSlider
              field={field}
              inputId={`${field}-${globalSelectionSliderId}`}
              value={globalLabelValues[field]}
              handleChange={handleGlobalChannelsSelectionChange}
              possibleValues={range(shape[labels.indexOf(field)])}
            />
          </LayerOption>
          ),
        )}
      {!disableChannelsIfRgbDetected ? (
        <>
          {shouldShowColormap && (
            <Grid>
              <LayerOption name="Colormap" inputId={colormapSelectId}>
                <ColormapSelect
                  value={colormap || ''}
                  inputId={colormapSelectId}
                  handleChange={handleColormapChange}
                />
              </LayerOption>
            </Grid>
          )}
          {shouldShowDomain && (
            <Grid>
              <LayerOption name="Domain" inputId={domainSelectorId}>
                <SliderDomainSelector
                  value={domainType || DEFAULT_RASTER_DOMAIN_TYPE}
                  inputId={domainSelectorId}
                  handleChange={(value) => {
                    handleDomainChange(value);
                  }}
                />
              </LayerOption>
            </Grid>
          )}
        </>
      ) : null}
      {!use3d && (
        <Grid>
          <LayerOption name="Opacity" inputId={opacitySliderId}>
            <OpacitySlider
              value={opacity}
              handleChange={handleOpacityChange}
              inputId={opacitySliderId}
            />
          </LayerOption>
        </Grid>
      )}
      {shouldShowTransparentColor && !use3d && (
        <Grid>
          <LayerOption
            name="Zero Transparent"
            inputId={zeroTransparentId}
          >
            <TransparentColorCheckbox
              value={transparentColor}
              handleChange={handleTransparentColorChange}
              inputId={zeroTransparentId}
            />
          </LayerOption>
        </Grid>
      )}
    </Grid>
  );
}

export default LayerOptions;
