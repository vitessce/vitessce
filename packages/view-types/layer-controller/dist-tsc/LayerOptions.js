import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { useId } from 'react-aria';
import { range } from 'lodash-es';
import { Matrix4 } from 'math.gl';
import { Grid, Slider, InputLabel, Select, Checkbox } from '@material-ui/core';
import { viv } from '@vitessce/gl';
import { getBoundingCube, getMultiSelectionStats, DEFAULT_RASTER_DOMAIN_TYPE, canLoadResolution, getStatsForResolution, } from '@vitessce/spatial-utils';
import { COLORMAP_OPTIONS, formatBytes, } from '@vitessce/utils';
import { useSelectionSliderStyles, useSelectStyles, useChannelSliderStyles, } from './styles.js';
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
function VolumeDropdown({ loader: loaderWithMeta, handleMultiPropertyChange, resolution: currResolution, disable3d, setRasterLayerCallback, setAreAllChannelsLoading, setViewState, spatialHeight, spatialWidth, channels, use3d, modelMatrix, }) {
    const classes = useSelectStyles();
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
            const defaultViewState = viv.getDefaultInitialViewState(loader, { height: spatialHeight, width: spatialWidth }, 1.5, true, new Matrix4(modelMatrix));
            setViewState({
                ...defaultViewState,
                rotationX: 0,
                rotationOrbit: 0,
            });
        }
        else {
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
            const defaultViewState = viv.getDefaultInitialViewState(loader, { height: spatialHeight, width: spatialWidth }, 0.5, false, new Matrix4(modelMatrix));
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
    return (_jsx(_Fragment, { children: _jsxs(Select, { native: true, value: currResolution, onChange: e => handleChange(e.target.value === '2D' ? e.target.value : Number(e.target.value)), inputProps: { 'aria-label': 'Resolution selector' }, classes: { root: classes.selectRoot }, children: [_jsx("option", { value: "2D", children: "2D Visualization" }, "2D"), Array.from({ length: loader.length })
                    .fill(0)
                    // eslint-disable-next-line no-unused-vars
                    .map((_, resolution) => {
                    if (loader) {
                        if (canLoadResolution(loader, resolution)) {
                            const { height, width, depthDownsampled, totalBytes, } = getStatsForResolution(loader, resolution);
                            return (_jsx("option", { value: resolution, disabled: disable3d
                                    || !hasZStack, children: `3D: ${resolution}x Downsampled, ~${formatBytes(totalBytes)} per channel, (${height}, ${width}, ${depthDownsampled})` }, `(${height}, ${width}, ${depthDownsampled})`));
                        }
                    }
                    return null;
                })] }) }));
}
/**
 * Wrapper for the dropdown that selects a colormap (None, viridis, magma, etc.).
 * @prop {string} value Currently selected value for the colormap.
 * @prop {string} inputId Css id.
 * @prop {function} handleChange Callback for every change in colormap.
 */
function ColormapSelect({ value, inputId, handleChange }) {
    const classes = useSelectStyles();
    return (_jsxs(Select, { native: true, onChange: e => handleChange(e.target.value === '' ? null : e.target.value), value: value, inputProps: { name: 'colormap', id: inputId, 'aria-label': 'Colormap selector' }, style: { width: '100%' }, classes: { root: classes.selectRoot }, children: [_jsx("option", { "aria-label": "None", value: "", children: "None" }), COLORMAP_OPTIONS.map(name => (_jsx("option", { value: name, children: name }, name)))] }));
}
function TransparentColorCheckbox({ value, inputId, handleChange }) {
    return (_jsx(Checkbox, { style: { float: 'left', padding: 0 }, color: "default", onChange: () => {
            if (value) {
                handleChange(null);
            }
            else {
                handleChange([0, 0, 0]);
            }
        }, checked: Boolean(value), id: inputId, inputProps: { 'aria-label': 'Enable or disable color transparency' } }));
}
/**
 * Wrapper for the slider that updates opacity.
 * @prop {string} value Currently selected value between 0 and 1.
 * @prop {function} handleChange Callback for every change in opacity.
 */
function OpacitySlider({ value, inputId, handleChange }) {
    const classes = useChannelSliderStyles();
    return (_jsx(Slider, { classes: { valueLabel: classes.valueLabel }, value: value, onChange: (e, v) => handleChange(v), valueLabelDisplay: "auto", "aria-label": "Layer opacity slider", id: inputId, min: 0, max: 1, step: 0.01, orientation: "horizontal" }));
}
/**
 * Wrapper for the dropdown that chooses the domain type.
 * @prop {string} value Currently selected value (i.e 'Max/Min').
 * @prop {string} inputId Css id.
 * @prop {function} handleChange Callback for every change in domain.
 */
function SliderDomainSelector({ value, inputId, handleChange }) {
    const classes = useSelectStyles();
    return (_jsx(Select, { native: true, onChange: e => handleChange(e.target.value), value: value, id: inputId, inputProps: { name: 'domain-selector', 'aria-label': 'Domain type selector' }, style: { width: '100%' }, classes: { root: classes.selectRoot }, children: DOMAIN_OPTIONS.map(name => (_jsx("option", { value: name, children: name }, name))) }));
}
/**
 * Wrapper for the slider that chooses global selections (z, t etc.).
 * @prop {string} field The dimension this selects for (z, t etc.).
 * @prop {number} value Currently selected index (1, 4, etc.).
 * @prop {function} handleChange Callback for every change in selection.
 * @prop {function} possibleValues All available values for the field.
 */
function GlobalSelectionSlider({ field, value, inputId, handleChange, possibleValues, }) {
    const classes = useSelectionSliderStyles();
    return (_jsx(Slider, { classes: { root: classes.selectionSliderRoot, markActive: classes.markActive }, value: value, 
        // See https://github.com/hms-dbmi/viv/issues/176 for why
        // we have the two handlers.
        onChange: (event, newValue) => {
            handleChange({ selection: { [field]: newValue }, event });
        }, onChangeCommitted: (event, newValue) => {
            handleChange({ selection: { [field]: newValue }, event });
        }, valueLabelDisplay: "auto", "aria-label": `${field} slider`, id: inputId, marks: possibleValues.map(val => ({ value: val })), min: Number(possibleValues[0]), max: Number(possibleValues.slice(-1)), orientation: "horizontal", step: null }));
}
/**
 * Wrapper for each of the options to show its name and then its UI component.
 * @prop {string} name Display name for option.
 * @prop {number} opacity Current opacity value.
 * @prop {string} inputId An id for css.
 * @prop {object} children Components to be rendered next to the name (slider, dropdown etc.).
 */
function LayerOption({ name, inputId, children }) {
    return (_jsxs(Grid, { container: true, direction: "row", alignItems: "center", justifyContent: "center", children: [_jsx(Grid, { item: true, xs: 6, children: _jsxs(InputLabel, { htmlFor: inputId, children: [name, ":"] }) }), _jsx(Grid, { item: true, xs: 6, children: children })] }));
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
function LayerOptions({ colormap, opacity, handleColormapChange, handleOpacityChange, handleTransparentColorChange, globalControlLabels, globalLabelValues, handleGlobalChannelsSelectionChange, handleSliderChange, handleDomainChange, transparentColor, channels, domainType, disableChannelsIfRgbDetected, shouldShowTransparentColor, shouldShowDomain, shouldShowColormap, use3d, loader, handleMultiPropertyChange, resolution, disable3d, setRasterLayerCallback, setAreAllChannelsLoading, setViewState, spatialHeight, spatialWidth, modelMatrix, }) {
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
    return (_jsxs(Grid, { container: true, direction: "column", style: { width: '100%' }, children: [hasZStack
                && !disable3d
                && hasViewableResolutions
                && (_jsx(VolumeDropdown, { loader: loader, handleSliderChange: handleSliderChange, handleDomainChange: handleDomainChange, channels: channels, handleMultiPropertyChange: handleMultiPropertyChange, resolution: resolution, disable3d: disable3d, setRasterLayerCallback: setRasterLayerCallback, setAreAllChannelsLoading: setAreAllChannelsLoading, setViewState: setViewState, spatialHeight: spatialHeight, spatialWidth: spatialWidth, use3d: use3d, modelMatrix: modelMatrix })), hasDimensionsAndChannels
                && !use3d
                && globalControlLabels.map(field => shape[labels.indexOf(field)] > 1 && (_jsx(LayerOption, { name: field, inputId: `${field}-${globalSelectionSliderId}`, children: _jsx(GlobalSelectionSlider, { field: field, inputId: `${field}-${globalSelectionSliderId}`, value: globalLabelValues[field], handleChange: handleGlobalChannelsSelectionChange, possibleValues: range(shape[labels.indexOf(field)]) }) }, field))), !disableChannelsIfRgbDetected ? (_jsxs(_Fragment, { children: [shouldShowColormap && (_jsx(Grid, { item: true, children: _jsx(LayerOption, { name: "Colormap", inputId: colormapSelectId, children: _jsx(ColormapSelect, { value: colormap || '', inputId: colormapSelectId, handleChange: handleColormapChange }) }) })), shouldShowDomain && (_jsx(Grid, { item: true, children: _jsx(LayerOption, { name: "Domain", inputId: domainSelectorId, children: _jsx(SliderDomainSelector, { value: domainType || DEFAULT_RASTER_DOMAIN_TYPE, inputId: domainSelectorId, handleChange: (value) => {
                                    handleDomainChange(value);
                                } }) }) }))] })) : null, !use3d && (_jsx(Grid, { item: true, children: _jsx(LayerOption, { name: "Opacity", inputId: opacitySliderId, children: _jsx(OpacitySlider, { value: opacity, handleChange: handleOpacityChange, inputId: opacitySliderId }) }) })), shouldShowTransparentColor && !use3d && (_jsx(Grid, { item: true, children: _jsx(LayerOption, { name: "Zero Transparent", inputId: zeroTransparentId, children: _jsx(TransparentColorCheckbox, { value: transparentColor, handleChange: handleTransparentColorChange, inputId: zeroTransparentId }) }) }))] }));
}
export default LayerOptions;
