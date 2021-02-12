import React from 'react';

import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';

import { COLORMAP_OPTIONS } from '../utils';
import { DEFAULT_RASTER_DOMAIN_TYPE } from '../spatial/constants';

const DOMAIN_OPTIONS = ['Full', 'Min/Max'];

/**
 * Wrapper for the dropdown that selects a colormap (None, viridis, magma, etc.).
 * @prop {string} value Currently selected value for the colormap.
 * @prop {string} inputId Css id.
 * @prop {function} handleChange Callback for every change in colormap.
 */
function ColormapSelect({ value, inputId, handleChange }) {
  return (
    <Select
      native
      onChange={e => handleChange(e.target.value === '' ? null : e.target.value)}
      value={value}
      inputProps={{ name: 'colormap', id: inputId }}
      style={{ width: '100%' }}
    >
      <option aria-label="None" value="">None</option>
      {COLORMAP_OPTIONS.map(name => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </Select>
  );
}

function TransparentColorCheckbox({ value, handleChange }) {
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
    />
  );
}

/**
 * Wrapper for the slider that updates opacity.
 * @prop {string} value Currently selected value between 0 and 1.
 * @prop {function} handleChange Callback for every change in opacity.
 */
function OpacitySlider({ value, handleChange }) {
  return (
    <Slider
      value={value}
      onChange={(e, v) => handleChange(v)}
      valueLabelDisplay="auto"
      getAriaLabel={() => 'opacity slider'}
      min={0}
      max={1}
      step={0.01}
      orientation="horizontal"
      style={{ marginTop: '7px' }}
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
  return (
    <Select
      native
      onChange={e => handleChange(e.target.value)}
      value={value}
      inputProps={{ name: 'domain-selector', id: inputId }}
      style={{ width: '100%' }}
    >
      {DOMAIN_OPTIONS.map(name => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </Select>
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
  handleChange,
  possibleValues,
}) {
  return (
    <Slider
      value={value}
      // See https://github.com/hubmapconsortium/vitessce-image-viewer/issues/176 for why
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
      getAriaLabel={() => `${field} slider`}
      marks={possibleValues.map(val => ({ value: val }))}
      min={Number(possibleValues[0])}
      max={Number(possibleValues.slice(-1))}
      orientation="horizontal"
      style={{ marginTop: '7px' }}
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
    <Grid container direction="row" alignItems="center" justify="center">
      <Grid item xs={6}>
        <InputLabel htmlFor={inputId}>{name}:</InputLabel>
      </Grid>
      <Grid item xs={6}>
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
 * @prop {object} globalControlDimensions All available options for global control (z and t).
 * @prop {function} handleGlobalChannelsSelectionChange Callback for global selection changes.
 * @prop {function} handleDomainChange Callback for domain type changes (full or min/max).
 * @prop {array} channels Current channel object for inferring the current global selection.
 * @prop {array} dimensions Currently available dimensions (channel, z, t etc.).
 * @prop {string} domainType One of Max/Min or Full (soon presets as well).
 * @prop {boolean} isRgb Whether or not the image is rgb (so we don't need colormap controllers).
 */
function LayerOptions({
  colormap,
  opacity,
  handleColormapChange,
  handleOpacityChange,
  handleTransparentColorChange,
  globalControlDimensions,
  globalDimensionValues,
  handleGlobalChannelsSelectionChange,
  handleDomainChange,
  transparentColor,
  channels,
  dimensions,
  domainType,
  isRgb,
}) {
  const hasDimensionsAndChannels = dimensions.length > 0 && channels.length > 0;
  return (
    <Grid container direction="column" style={{ width: '100%' }}>
      {!isRgb ? (
        <>
          <Grid item>
            <LayerOption name="Colormap" inputId="colormap-select">
              <ColormapSelect
                value={colormap || ''}
                inputId="colormap-select"
                handleChange={handleColormapChange}
              />
            </LayerOption>
          </Grid>
          <Grid item>
            <LayerOption name="Domain" inputId="domain-selector">
              <SliderDomainSelector
                value={domainType || DEFAULT_RASTER_DOMAIN_TYPE}
                handleChange={(value) => {
                  handleDomainChange(value);
                }}
              />
            </LayerOption>
          </Grid>
        </>
      ) : null}
      <Grid item>
        <LayerOption name="Opacity" inputId="opacity-slider">
          <OpacitySlider value={opacity} handleChange={handleOpacityChange} />
        </LayerOption>
      </Grid>
      <Grid item>
        <LayerOption
          name="Zero Transparent"
          inputId="transparent-color-selector"
        >
          <TransparentColorCheckbox
            value={transparentColor}
            handleChange={handleTransparentColorChange}
          />
        </LayerOption>
      </Grid>
      {hasDimensionsAndChannels
        && globalControlDimensions.map((dimension) => {
          const { field, values } = dimension;
          // If there is only one value in the dimension, do not return a slider.
          return (
            values.length > 1 && (
              <LayerOption name={field} inputId={`${field}-slider`} key={field}>
                <GlobalSelectionSlider
                  field={field}
                  value={globalDimensionValues[field]}
                  handleChange={handleGlobalChannelsSelectionChange}
                  possibleValues={values}
                />
              </LayerOption>
            )
          );
        })}
    </Grid>
  );
}

export default LayerOptions;
