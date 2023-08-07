/* eslint-disable no-unused-vars */
import React, { forwardRef } from 'react';
import { isEqual } from 'lodash-es';
import {
  deck, viv, getSelectionLayers, ScaledExpressionExtension,
} from '@vitessce/gl';
import { getSourceFromLoader, isInterleaved, filterSelection } from '@vitessce/spatial-utils';
import { Matrix4 } from 'math.gl';
import { PALETTE, getCellColors, getDefaultColor } from '@vitessce/utils';
import { AbstractSpatialOrScatterplot, createQuadTree, getOnHoverCallback } from '@vitessce/scatterplot';
import { CoordinationType } from '@vitessce/constants-internal';
import { getLayerLoaderTuple, renderSubBitmaskLayers } from './utils.js';

const CELLS_LAYER_ID = 'cells-layer';
const MOLECULES_LAYER_ID = 'molecules-layer';
const NEIGHBORHOODS_LAYER_ID = 'neighborhoods-layer';

const VIV_RENDERING_MODES = {
  maximumIntensityProjection: 'Maximum Intensity Projection',
  minimumIntensityProjection: 'Minimum Intensity Projection',
  additive: 'Additive',
};

// Default getter function props.
const makeDefaultGetCellColors = (cellColors, obsIndex, theme) => (object, { index }) => {
  const [r, g, b, a] = (
    cellColors && obsIndex && cellColors.get(obsIndex[index])
  ) || getDefaultColor(theme);
  return [r, g, b, 255 * (a || 1)];
};
const makeDefaultGetCellIsSelected = (cellSelection) => {
  if (cellSelection) {
    // For performance, convert the Array to a Set instance.
    // Set.has() is faster than Array.includes().
    const cellSelectionSet = new Set(cellSelection);
    return cellEntry => (cellSelectionSet.has(cellEntry[0]) ? 1.0 : 0.0);
  }
  return () => 0.0;
};
const makeDefaultGetObsCoords = obsLocations => i => ([
  obsLocations.data[0][i],
  obsLocations.data[1][i],
  0,
]);

function getVivLayerExtensions(use3d, colormap, renderingMode) {
  if (use3d) {
    // Is 3d
    if (colormap) {
      // Colormap: use AdditiveColormap extensions
      if (renderingMode === 'minimumIntensityProjection') {
        return [new viv.AdditiveColormap3DExtensions.MinimumIntensityProjectionExtension()];
      }
      if (renderingMode === 'maximumIntensityProjection') {
        return [new viv.AdditiveColormap3DExtensions.MaximumIntensityProjectionExtension()];
      }
      return [new viv.AdditiveColormap3DExtensions.AdditiveBlendExtension()];
    }
    // No colormap: use ColorPalette extensions
    if (renderingMode === 'minimumIntensityProjection') {
      return [new viv.ColorPalette3DExtensions.MinimumIntensityProjectionExtension()];
    }
    if (renderingMode === 'maximumIntensityProjection') {
      return [new viv.ColorPalette3DExtensions.MaximumIntensityProjectionExtension()];
    }
    return [new viv.ColorPalette3DExtensions.AdditiveBlendExtension()];
  }
  // Not 3d
  if (colormap) {
    return [new viv.AdditiveColormapExtension()];
  }
  return [new viv.ColorPaletteExtension()];
}

/**
 * React component which expresses the spatial relationships between cells and molecules.
 * @param {object} props
 * @param {string} props.uuid A unique identifier for this component,
 * used to determine when to show tooltips vs. crosshairs.
 * @param {number} props.height Height of the DeckGL canvas, used when
 * rendering the scale bar layer.
 * @param {number} props.width Width of the DeckGL canvas, used when
 * rendering the scale bar layer.
 * @param {object} props.viewState The DeckGL viewState object.
 * @param {function} props.setViewState A handler for updating the DeckGL
 * viewState object.
 * @param {object} props.molecules Molecules data.
 * @param {object} props.cells Cells data.
 * @param {object} props.neighborhoods Neighborhoods data.
 * @param {number} props.lineWidthScale Width of cell border in view space (deck.gl).
 * @param {number} props.lineWidthMaxPixels Max width of the cell border in pixels (deck.gl).
 * @param {object} props.imageLayerLoaders An object mapping raster layer index to Viv loader
 * instances.
 * @param {object} props.cellColors Map from cell IDs to colors [r, g, b].
 * @param {function} props.getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @param {function} props.getCellColor Getter function for cell color as [r, g, b] array.
 * @param {function} props.getCellPolygon Getter function for cell polygons.
 * @param {function} props.getCellIsSelected Getter function for cell layer isSelected.
 * @param {function} props.getMoleculeColor
 * @param {function} props.getMoleculePosition
 * @param {function} props.getNeighborhoodPolygon
 * @param {function} props.updateViewInfo Handler for DeckGL viewport updates,
 * used when rendering tooltips and crosshairs.
 * @param {function} props.onCellClick Getter function for cell layer onClick.
 * @param {string} props.theme "light" or "dark" for the vitessce theme
 */
class Spatial extends AbstractSpatialOrScatterplot {
  constructor(props) {
    super(props);

    // To avoid storing large arrays/objects
    // in React state, this component
    // uses instance variables.
    // All instance variables used in this class:
    this.obsSegmentationsQuadTree = null; // TODO: is this used?
    this.obsSegmentationsData = null; // TODO: is this used?
    this.obsLocationsData = null; // TODO: is this used?
    this.obsSpotsQuadTree = {}; // Keys: spotLayer scopes
    this.obsSpotsData = {}; // Keys: spotLayer scopes
    this.obsPointsData = null; // TODO: is this used?

    this.imageLayers = [];
    this.obsSegmentationsLayers = [];
    this.obsSpotsLayers = [];
    this.obsPointsLayers = [];
    this.neighborhoodsLayer = null;

    this.spotToMatrixIndexMap = {} // Keys: spotLayer scopes
    this.spotColors = {}; // Keys: spotLayer scopes
    this.spotExpressionGetters = {}; // Keys: spotLayer scopes
    this.prevSpotSetColor = {}; // Keys: spotLayer scopes. Used for diffing to detect changes.

    this.imageLayerLoaderSelections = {};
    this.segmentationLayerLoaderSelections = {};
    // Better for the bitmask layer when there is no color data to use this.
    // 2048 is best for performance and for stability (4096 texture size is not always supported).
    this.randomColorData = {
      data: new Uint8Array(2048 * 2048 * 3)
        .map((_, j) => (j < 4 ? 0 : Math.round(255 * Math.random()))),
      // This buffer should be able to hold colors for 2048 x 2048 ~ 4 million cells.
      height: 2048,
      width: 2048,
    };
    this.color = { ...this.randomColorData };
    this.expression = {
      data: new Uint8Array(2048 * 2048),
      // This buffer should be able to hold colors for 2048 x 2048 ~ 4 million cells.
      height: 2048,
      width: 2048,
    };

    // Initialize data and layers.
    this.onUpdateSegmentationsData(); // TODO: is this used?
    this.onUpdateSegmentationsLayer();
    this.onUpdatePointsData(); // TODO: is this used?
    this.onUpdatePointsLayer();
    this.onUpdateAllSpotsData();
    this.onUpdateAllSpotsSetsData();
    this.onUpdateAllSpotsIndexData();
    this.onUpdateAllSpotsExpressionData();
    this.onUpdateSpotsLayer();
    this.onUpdateNeighborhoodsData(); // TODO: is this used?
    this.onUpdateNeighborhoodsLayer();
    this.onUpdateImages();
  }

  createPolygonSegmentationLayer(
    layerScope, layerCoordination, channelScopes, channelCoordination,
    layerObsSegmentations, layerFeatureValues,
  ) {
    // TODO
    const visible = layerCoordination[CoordinationType.SPATIAL_LAYER_VISIBLE];
    const opacity = layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY];
    const strokeWidth = layerCoordination[CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH];
    const filled = layerCoordination[CoordinationType.SPATIAL_SEGMENTATION_FILLED];

    console.log(layerObsSegmentations);
    return null;

    /*
    const {
      obsCentroidsIndex,
      obsSegmentationsIndex,
    } = this.props;
    const obsIndex = (hasExplicitPolygons ? obsSegmentationsIndex : obsCentroidsIndex);
    const {
      theme,
      // cellFilter,
      cellSelection,
      setCellHighlight,
      setComponentHover,
      getCellIsSelected = makeDefaultGetCellIsSelected(
        obsIndex.length === cellSelection.length ? null : cellSelection,
      ),
      cellColors,
      getCellColor = makeDefaultGetCellColors(cellColors, obsIndex, theme),
      onCellClick,
      lineWidthScale = 10,
      lineWidthMaxPixels = 2,
      geneExpressionColormapRange,
      cellColorEncoding,
      getExpressionValue,
      geneExpressionColormap,
    } = this.props;
    const getPolygon = hasExplicitPolygons
      ? (object, { index, data }) => data.src.obsSegmentations.data[index]
      : (object, { index, data }) => {
        const x = data.src.obsCentroids.data[0][index];
        const y = data.src.obsCentroids.data[1][index];
        const r = radius;
        return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
      };
    return new deck.PolygonLayer({
      id: CELLS_LAYER_ID,
      data: this.obsSegmentationsData,
      coordinateSystem: deck.COORDINATE_SYSTEM.CARTESIAN,
      pickable: true,
      autoHighlight: true,
      filled: true,
      stroked: true,
      backgroundColor: [0, 0, 0],
      isSelected: getCellIsSelected,
      getPolygon,
      updateTriggers: {
        getLineWidth: [stroked],
        isSelected: cellSelection,
        getExpressionValue,
        getFillColor: [opacity, cellColorEncoding, cellSelection, cellColors],
        getLineColor: [cellColorEncoding, cellSelection, cellColors],
        getPolygon: [radius],
      },
      getFillColor: (object, { index }) => {
        const color = getCellColor(object, { index });
        color[3] = opacity * 255;
        return color;
      },
      getLineColor: (object, { index }) => {
        const color = getCellColor(object, { index });
        color[3] = 255;
        return color;
      },
      onClick: (info) => {
        if (onCellClick) {
          onCellClick(info);
        }
      },
      onHover: getOnHoverCallback(obsIndex, setCellHighlight, setComponentHover),
      visible,
      getLineWidth: stroked ? 1 : 0,
      lineWidthScale,
      lineWidthMaxPixels,
      getExpressionValue,
      extensions: [new ScaledExpressionExtension()],
      colorScaleLo: geneExpressionColormapRange[0],
      colorScaleHi: geneExpressionColormapRange[1],
      isExpressionMode: cellColorEncoding === 'geneSelection',
      colormap: geneExpressionColormap,
    });
    */
  }

  createPointsLayer(layerDef) {
    const {
      obsLocations,
      obsLocationsFeatureIndex: obsLabelsTypes,
      setMoleculeHighlight,
    } = this.props;
    const getMoleculeColor = (object, { data, index }) => {
      const i = data.src.obsLabelsTypes.indexOf(data.src.obsLabels[index]);
      return data.src.PALETTE[i % data.src.PALETTE.length];
    };
    return new deck.ScatterplotLayer({
      id: MOLECULES_LAYER_ID,
      data: this.obsLocationsData,
      coordinateSystem: deck.COORDINATE_SYSTEM.CARTESIAN,
      pickable: true,
      autoHighlight: true,
      radiusMaxPixels: 3,
      opacity: layerDef.opacity,
      visible: layerDef.visible,
      getRadius: layerDef.radius,
      getPosition: (object, { data, index, target }) => {
        // eslint-disable-next-line no-param-reassign
        target[0] = data.src.obsLocations.data[0][index];
        // eslint-disable-next-line no-param-reassign
        target[1] = data.src.obsLocations.data[1][index];
        // eslint-disable-next-line no-param-reassign
        target[2] = 0;
        return target;
      },
      getLineColor: getMoleculeColor,
      getFillColor: getMoleculeColor,
      onHover: (info) => {
        if (setMoleculeHighlight) {
          if (info.object) {
            setMoleculeHighlight(info.object[3]);
          } else {
            setMoleculeHighlight(null);
          }
        }
      },
      updateTriggers: {
        getRadius: [layerDef],
        getPosition: [obsLocations],
        getLineColor: [obsLabelsTypes],
        getFillColor: [obsLabelsTypes],
      },
    });
  }

  createSpotLayer(layerScope, layerCoordination, layerObsSpots, layerFeatureData) {
    const {
      theme,
      setSpotHighlight, // TODO
    } = this.props;

    const cellColors = this.spotColors[layerScope];
    const getExpressionValue = this.spotExpressionGetters[layerScope];
    const obsIndex = layerObsSpots?.obsIndex;

    const getSpotColor = makeDefaultGetCellColors(cellColors, obsIndex, theme);
    const {
      spatialLayerVisible,
      spatialLayerOpacity,
      spatialSpotRadius,
      obsColorEncoding,
      featureValueColormap,
      featureValueColormapRange,
    } = layerCoordination;

    return new deck.ScatterplotLayer({
      id: `spot-layer-${layerScope}`,
      data: this.obsSpotsData[layerScope],
      coordinateSystem: deck.COORDINATE_SYSTEM.CARTESIAN,
      pickable: true,
      autoHighlight: true,
      opacity: spatialLayerOpacity,
      visible: spatialLayerVisible,
      getRadius: spatialSpotRadius,
      getPosition: (object, { data, index, target }) => {
        // eslint-disable-next-line no-param-reassign
        target[0] = data.src.obsSpots.data[0][index];
        // eslint-disable-next-line no-param-reassign
        target[1] = data.src.obsSpots.data[1][index];
        // eslint-disable-next-line no-param-reassign
        target[2] = 0;
        return target;
      },
      getLineColor: getSpotColor,
      getFillColor: getSpotColor,
      onHover: (info) => {
        if (setSpotHighlight) {
          if (info.object) {
            setSpotHighlight(info.object[3]);
          } else {
            setSpotHighlight(null);
          }
        }
      },
      // Expression color mapping extension props
      extensions: [new ScaledExpressionExtension()],
      getExpressionValue,
      colorScaleLo: featureValueColormapRange[0],
      colorScaleHi: featureValueColormapRange[1],
      isExpressionMode: obsColorEncoding === 'geneSelection',
      colormap: featureValueColormap,
      
      updateTriggers: {
        getRadius: [spatialSpotRadius],
        getExpressionValue,
        getFillColor: [obsColorEncoding, cellColors],
        getLineColor: [obsColorEncoding, cellColors],
      },
    });
  }

  createNeighborhoodsLayer(layerDef) {
    const {
      getNeighborhoodPolygon = (neighborhoodsEntry) => {
        const neighborhood = neighborhoodsEntry[1];
        return neighborhood.poly;
      },
    } = this.props;
    const { neighborhoodsEntries } = this;

    return new deck.PolygonLayer({
      id: NEIGHBORHOODS_LAYER_ID,
      getPolygon: getNeighborhoodPolygon,
      coordinateSystem: deck.COORDINATE_SYSTEM.CARTESIAN,
      data: neighborhoodsEntries,
      pickable: true,
      autoHighlight: true,
      stroked: true,
      filled: false,
      getElevation: 0,
      getLineWidth: 10,
      visible: layerDef.visible,
    });
  }

  createSelectionLayers() {
    const { obsCentroidsIndex, obsCentroids } = this.props;
    const {
      viewState,
      setCellSelection,
    } = this.props;
    const { tool } = this.state;
    const { obsSegmentationsQuadTree } = this;
    const getCellCoords = makeDefaultGetObsCoords(obsCentroids);
    return getSelectionLayers(
      tool,
      viewState.zoom,
      CELLS_LAYER_ID,
      getCellCoords,
      obsCentroidsIndex,
      setCellSelection,
      obsSegmentationsQuadTree,
    );
  }

  createScaleBarLayer() {
    const {
      viewState,
      width,
      height,
    } = this.props;
    const use3d = this.use3d();
    // Just get the first layer/loader since they should all be spatially
    // resolved and therefore have the same unit size scale.
    if (!viewState || !width || !height || use3d) return null;
    return new viv.ScaleBarLayer({
      id: 'scalebar-layer',
      unit: 'um',
      size: 1,
      viewState: { ...viewState, width, height },
    });
  }

  use3d() {
    const {
      spatialRenderingMode,
    } = this.props;
    return spatialRenderingMode === '3D';
  }

  // New createImageLayer function.
  createBitmaskSegmentationLayer(
    layerScope, layerCoordination, channelScopes, channelCoordination,
    image, layerFeatureValues,
  ) {
    const {
      targetT,
      targetZ,
    } = this.props;

    const data = image?.obsSegmentations?.instance?.getData();
    if (!data) {
      return null;
    }

    const visible = layerCoordination[CoordinationType.SPATIAL_LAYER_VISIBLE];

    // TODO(CoordinationType): per-layer modelMatrix
    const layerDefModelMatrix = image?.obsSegmentations?.instance?.getModelMatrix();

    // We need to keep the same selections array reference,
    // otherwise the Viv layer will not be re-used as we want it to,
    // since selections is one of its `updateTriggers`.
    // Reference: https://github.com/hms-dbmi/viv/blob/ad86d0f/src/layers/MultiscaleImageLayer/MultiscaleImageLayer.js#L127
    let selections;
    const nextLoaderSelection = channelScopes
      .map(cScope => filterSelection(data, {
        z: targetZ,
        t: targetT,
        c: channelCoordination[cScope][CoordinationType.SPATIAL_TARGET_C],
      }));
    const prevLoaderSelection = this.segmentationLayerLoaderSelections[layerScope];
    if (isEqual(prevLoaderSelection, nextLoaderSelection)) {
      selections = prevLoaderSelection;
    } else {
      selections = nextLoaderSelection;
      this.segmentationLayerLoaderSelections[layerScope] = nextLoaderSelection;
    }


    return new viv.MultiscaleImageLayer({
      // `bitmask` is used by the AbstractSpatialOrScatterplot
      // https://github.com/vitessce/vitessce/pull/927/files#diff-9cab35a2ca0c5b6d9754b177810d25079a30ca91efa062d5795181360bc3ff2cR111
      id: `bitmask-layer-${layerScope}`,
      channelsVisible: channelScopes
        .map(cScope => (
          // Layer visible AND channel visible
          visible && channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_VISIBLE]
        )),
      channelOpacities: channelScopes
        .map(cScope => channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_OPACITY]),
      channelsFilled: channelScopes
        .map(cScope => channelCoordination[cScope][CoordinationType.SPATIAL_SEGMENTATION_FILLED]),
      opacity: layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY],
      channelColors: channelScopes
        .map(cScope => channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_COLOR]),
      channelStrokeWidths: channelScopes
        .map(cScope => (
          channelCoordination[cScope][CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH]
        )),
      channelFeatureValueColormaps: channelScopes
        .map(cScope => channelCoordination[cScope][CoordinationType.FEATURE_VALUE_COLORMAP]),
      channelFeatureValueColormapRanges: channelScopes
        .map(cScope => channelCoordination[cScope][CoordinationType.FEATURE_VALUE_COLORMAP_RANGE]),
      channelIsStaticColorMode: channelScopes
        .map(cScope => (
          channelCoordination[cScope][CoordinationType.OBS_COLOR_ENCODING] === 'spatialChannelColor'
        )),
      modelMatrix: layerDefModelMatrix,
      hoveredCell: Number(this.props.cellHighlight),
      multiFeatureValues: channelScopes.map(cScope => (layerFeatureValues?.[cScope]?.[0] || [])),
      renderSubLayers: renderSubBitmaskLayers,
      loader: data,
      selections,
      // For some reason, deck.gl doesn't recognize the prop diffing
      // unless these are separated out.  I don't think it's a bug, just
      // has to do with the fact that we don't have it in the `defaultProps`,
      // could be wrong though.
      cellColorData: this.color.data,
      cellTexHeight: this.color.height,
      cellTexWidth: this.color.width,
      excludeBackground: true,
      onViewportLoad: () => {}, // layerProps.callback, // TODO: figure out callback implementation
      colorScaleLo: 0, // TODO: check if these can be removed?
      colorScaleHi: 1, // TODO: check if these can be removed?
      isExpressionMode: false, // TODO: check if these can be removed?
      colormap: null, // TODO: check if these can be removed?
      expressionData: this.expression.data,
      // There is no onHover here,
      // see the onHover method of AbstractSpatialOrScatterplot.
    });
  }

  // New createImageLayer function.
  createImageLayer(
    layerScope, layerCoordination, channelScopes, channelCoordination, image,
  ) {
    const {
      targetT,
      targetZ,
      spatialRenderingMode,
    } = this.props;
    // TODO: always using 0th loader here, create joint file type to split existing multi-image
    // raster.json when necessary.
    const data = image?.image?.instance?.getData();
    if (!data) {
      return null;
    }

    const is3dMode = spatialRenderingMode === '3D';
    const isRgb = layerCoordination[CoordinationType.PHOTOMETRIC_INTERPRETATION] === 'RGB';

    const [Layer, layerLoader] = getLayerLoaderTuple(data, is3dMode);

    const colormap = isRgb ? null : layerCoordination[CoordinationType.SPATIAL_LAYER_COLORMAP];
    const renderingMode = layerCoordination[CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM];
    const visible = layerCoordination[CoordinationType.SPATIAL_LAYER_VISIBLE];
    const transparentColor = layerCoordination[CoordinationType.SPATIAL_LAYER_TRANSPARENT_COLOR];
    const useTransparentColor = Array.isArray(transparentColor) && transparentColor.length === 3;


    const extensions = getVivLayerExtensions(
      is3dMode, colormap, renderingMode,
    );

    // Safer to only use this prop when we have an interleaved image i.e not multiple channels.
    const rgbInterleavedProps = {};
    if (isInterleaved((Array.isArray(data) ? data[0] : data).shape)) {
      rgbInterleavedProps.visible = visible;
    }

    // TODO: support model matrix from coordination space also.
    const layerDefModelMatrix = image?.image?.instance?.getModelMatrix() || {};

    // We need to keep the same selections array reference,
    // otherwise the Viv layer will not be re-used as we want it to,
    // since selections is one of its `updateTriggers`.
    // Reference: https://github.com/hms-dbmi/viv/blob/ad86d0f/src/layers/MultiscaleImageLayer/MultiscaleImageLayer.js#L127
    let selections;
    // If RGB, we ignore the channelScopes and use RGB channels (R=0, G=1, B=2).
    const nextLoaderSelection = isRgb ? ([0, 1, 2])
      .map(targetC => filterSelection(data, {
        z: targetZ,
        t: targetT,
        c: targetC,
      })) : channelScopes
      .map(cScope => filterSelection(data, {
        z: targetZ,
        t: targetT,
        c: channelCoordination[cScope][CoordinationType.SPATIAL_TARGET_C],
      }));
    const prevLoaderSelection = this.imageLayerLoaderSelections[layerScope];
    if (isEqual(prevLoaderSelection, nextLoaderSelection)) {
      selections = prevLoaderSelection;
    } else {
      selections = nextLoaderSelection;
      this.imageLayerLoaderSelections[layerScope] = nextLoaderSelection;
    }

    const colors = isRgb ? ([
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
    ]) : channelScopes.map(cScope => (
      channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_COLOR]
    ));
    // TODO: figure out how to initialize the channel windows in the loader.
    // TODO: is [0, 255] the right fallback?
    const contrastLimits = isRgb ? ([
      [0, 255],
      [0, 255],
      [0, 255],
    ]) : channelScopes.map(cScope => (
      channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_WINDOW]
      || ([0, 255])
    ));

    const channelsVisible = isRgb ? ([
      // Layer visible AND channel visible
      visible && true,
      visible && true,
      visible && true,
    ]) : channelScopes.map(cScope => (
      // Layer visible AND channel visible
      visible && channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_VISIBLE]
    ));

    const autoTargetResolution = image?.image?.instance?.getAutoTargetResolution();
    const targetResolution = layerCoordination[CoordinationType.SPATIAL_TARGET_RESOLUTION];

    return new Layer({
      loader: layerLoader,
      id: `${is3dMode ? 'volume' : 'image'}-layer-${layerScope}`,
      colors,
      contrastLimits,
      selections,
      channelsVisible,
      opacity: layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY],
      colormap,
      modelMatrix: layerDefModelMatrix,
      transparentColor,
      useTransparentColor,
      resolution: targetResolution === null ? autoTargetResolution : targetResolution,
      renderingMode: VIV_RENDERING_MODES[renderingMode],
      pickable: false,
      xSlice: layerCoordination[CoordinationType.SPATIAL_SLICE_X],
      ySlice: layerCoordination[CoordinationType.SPATIAL_SLICE_Y],
      zSlice: layerCoordination[CoordinationType.SPATIAL_SLICE_Z],
      onViewportLoad: () => {}, // layerProps.callback, // TODO: figure out callback implementation
      excludeBackground: useTransparentColor,
      extensions,
      ...rgbInterleavedProps,
    });
  }

  createImageLayers() {
    const {
      imageLayerCallbacks = [],

      images = {},
      imageLayerScopes,
      imageLayerCoordination,

      imageChannelScopesByLayer,
      imageChannelCoordination,
    } = this.props;
    return imageLayerScopes.map(layerScope => this.createImageLayer(
      layerScope,
      imageLayerCoordination[0][layerScope],
      imageChannelScopesByLayer[layerScope],
      imageChannelCoordination[0][layerScope],
      images[layerScope],
    ));
  }

  createSpotLayers() {
    const {
      obsSpots = {},
      spotLayerScopes,
      spotLayerCoordination,

      spotMultiExpressionData,
    } = this.props;
    return spotLayerScopes.map((layerScope) => {
      if (obsSpots[layerScope]) {
        return this.createSpotLayer(
          layerScope,
          spotLayerCoordination[0][layerScope],
          obsSpots[layerScope],
          spotMultiExpressionData?.[layerScope],
        );
      }
      return null;
    });
  }

  createSegmentationLayers() {
    const {
      obsSegmentations = {},
      segmentationLayerScopes,
      segmentationLayerCoordination,

      segmentationChannelScopesByLayer,
      segmentationChannelCoordination,

      segmentationLayerCallbacks = [],

      segmentationMultiExpressionData,
    } = this.props;
    return segmentationLayerScopes.map((layerScope) => {
      if (obsSegmentations[layerScope]) {
        const { obsSegmentationsType } = obsSegmentations[layerScope];
        if (obsSegmentationsType === 'bitmask') {
          return this.createBitmaskSegmentationLayer(
            layerScope,
            segmentationLayerCoordination[0][layerScope],
            segmentationChannelScopesByLayer[layerScope],
            segmentationChannelCoordination[0][layerScope],
            obsSegmentations[layerScope],
            segmentationMultiExpressionData?.[layerScope],
          );
        }
        if (obsSegmentationsType === 'polygon') {
          return this.createPolygonSegmentationLayer(
            layerScope,
            segmentationLayerCoordination[0][layerScope],
            segmentationChannelScopesByLayer[layerScope],
            segmentationChannelCoordination[0][layerScope],
            obsSegmentations[layerScope],
            segmentationMultiExpressionData?.[layerScope],
          );
        }
      }
      return null;
    });
  }

  getLayers() {
    const {
      imageLayers,
      obsSpotsLayers,
      obsSegmentationsLayers,
      neighborhoodsLayer,
      obsLocationsLayer,
    } = this;
    return [
      ...imageLayers,
      ...obsSegmentationsLayers,
      ...obsSpotsLayers,
      neighborhoodsLayer,
      obsLocationsLayer,
      this.createScaleBarLayer(),
      ...this.createSelectionLayers(),
    ];
  }

  onUpdateSpotsSetsData(layerScope) {
    const {
      obsSpots,
      obsSpotsSets,
      spotLayerCoordination,
      theme,
    } = this.props;
    const layerSets = obsSpotsSets[layerScope];
    if(layerSets) {
      const { obsSetColor, obsColorEncoding, obsSetSelection, featureSelection } = spotLayerCoordination[0][layerScope];
      const prevSetColor = this.prevSpotSetColor[layerScope];
      if (obsSetColor !== prevSetColor || true) {
        // The set array reference changed, so update the color data.
        const obsColors = getCellColors({
          cellColorEncoding: obsColorEncoding,
          cellSets: layerSets.obsSets,
          cellSetColor: obsSetColor,
          cellSetSelection: obsSetSelection,
          theme,
          obsIndex: layerSets.obsIndex,
        });
        this.spotColors[layerScope] = obsColors;
        this.prevSpotSetColor[layerScope] = obsSetColor;
      }
    }
  }

  onUpdateAllSpotsSetsData() {
    const {
      spotLayerScopes,
    } = this.props;
    spotLayerScopes.forEach((layerScope) => {
      this.onUpdateSpotsSetsData(layerScope);
    });
  }

  // Dependencies: `obsSpots`, `spotMatrixIndices`
  onUpdateSpotsIndexData(layerScope) {
    const {
      obsSpots,
      spotMatrixIndices,
    } = this.props;
    const { obsIndex: instanceObsIndex } = obsSpots[layerScope] || {};
    const { obsIndex: matrixObsIndex } = spotMatrixIndices[layerScope] || {};

    // Get a mapping from cell ID to row index in the gene expression matrix.
    // Since the two obsIndices (instanceObsIndex = the obsIndex from obsEmbedding)
    // may be ordered differently (matrixObsIndex = the obsIndex from obsFeatureMatrix),
    // we need a way to look up an obsFeatureMatrix obsIndex index
    // given an obsEmbedding obsIndex index.

    if (instanceObsIndex && matrixObsIndex) {
      const matrixIndexMap = new Map(matrixObsIndex.map((key, i) => ([key, i])));
      this.spotToMatrixIndexMap[layerScope] = instanceObsIndex.map(key => matrixIndexMap.get(key));
    }
  }

  onUpdateAllSpotsIndexData() {
    const {
      spotLayerScopes,
    } = this.props;

    spotLayerScopes?.forEach((layerScope) => {
      this.onUpdateSpotsIndexData(layerScope);
    });
  }

  // Dependencies: same as `this.onUpdateSpotsIndexData()` plus `spotMultiExpressionData`
  onUpdateSpotsExpressionData(layerScope) {
    const {
      spotMultiExpressionData,
    } = this.props;
    const expressionData = spotMultiExpressionData?.[layerScope];
    const toMatrixIndexMap = this.spotToMatrixIndexMap[layerScope];

    // Set up a getter function for gene expression values, to be used
    // by the DeckGL layer to obtain values for instanced attributes.
    const getExpressionValue = (entry, { index: instanceIndex }) => {
      if (toMatrixIndexMap && expressionData && expressionData[0]) {
        const rowIndex = toMatrixIndexMap[instanceIndex];
        const val = expressionData[0][rowIndex];
        return val;
      }
      return 0;
    };
    this.spotExpressionGetters[layerScope] = getExpressionValue;
  }

  onUpdateAllSpotsExpressionData() {
    const {
      spotLayerScopes,
    } = this.props;

    spotLayerScopes?.forEach((layerScope) => {
      this.onUpdateSpotsExpressionData(layerScope);
    });
  }

  onUpdateSpotsData(layerScope) {
    const {
      obsSpots,
    } = this.props;
    const spotsData = obsSpots[layerScope];
    if (spotsData) {
      const { obsSpots: layerObsSpots } = spotsData;
      const getCellCoords = makeDefaultGetObsCoords(layerObsSpots);
      this.obsSpotsQuadTree[layerScope] = createQuadTree(layerObsSpots, getCellCoords);
      this.obsSpotsData[layerScope] = {
        src: {
          obsSpots: layerObsSpots,
        },
        length: layerObsSpots.shape[1],
      };
    }
  }

  onUpdateAllSpotsData() {
    const {
      spotLayerScopes,
    } = this.props;
    spotLayerScopes?.forEach((layerScope) => {
      this.onUpdateSpotsData(layerScope);
    });
  }

  onUpdateSegmentationsData() {
    const {
      obsSegmentations,
      obsSegmentationsType,
      obsCentroids,
    } = this.props;
    if ((obsSegmentations && obsSegmentationsType === 'polygon')
      || (!obsSegmentations && obsCentroids)
    ) {
      const getCellCoords = makeDefaultGetObsCoords(obsCentroids);
      this.obsSegmentationsQuadTree = createQuadTree(obsCentroids, getCellCoords);
      this.obsSegmentationsData = {
        src: {
          obsSegmentations,
          obsCentroids,
        },
        length: obsSegmentations ? obsSegmentations.shape[0] : obsCentroids.shape[1],
      };
    }
  }

  onUpdateSpotsLayer() {
    this.obsSpotsLayers = this.createSpotLayers();
  }

  onUpdateSegmentationsLayer() {
    this.obsSegmentationsLayers = this.createSegmentationLayers();
  }

  onUpdateExpressionData() {
    const { expressionData } = this.props;
    if (expressionData[0]?.length) {
      this.expression.data = new Uint8Array(
        this.expression.height * this.expression.width,
      );
      this.expression.data.set(expressionData[0]);
    }
  }

  onUpdatePointsData() {
    const {
      obsLocations,
      obsLocationsLabels: obsLabels,
      obsLocationsFeatureIndex: obsLabelsTypes,
    } = this.props;
    if (obsLocations && obsLabels && obsLabelsTypes) {
      this.obsLocationsData = {
        src: {
          obsLabels,
          obsLocations,
          obsLabelsTypes,
          PALETTE,
        },
        length: obsLocations.shape[1],
      };
    }
  }

  onUpdatePointsLayer() {
    const {
      obsLocationsLayerDefs: obsLocationsLayerDef,
      obsLocations,
      obsLocationsIndex,
      obsLocationsLabels,
      obsLocationsFeatureIndex,
    } = this.props;
    if (
      obsLocationsLayerDef
      && obsLocations?.data && obsLocationsIndex
      && obsLocationsLabels && obsLocationsFeatureIndex
    ) {
      this.obsLocationsLayer = this.createPointsLayer(obsLocationsLayerDef);
    } else {
      this.obsLocationsLayer = null;
    }
  }

  onUpdateNeighborhoodsData() {
    const { neighborhoods = {} } = this.props;
    const neighborhoodsEntries = Object.entries(neighborhoods);
    this.neighborhoodsEntries = neighborhoodsEntries;
  }

  onUpdateNeighborhoodsLayer() {
    const { neighborhoodLayerDefs: neighborhoodLayerDef } = this.props;
    if (neighborhoodLayerDef) {
      this.neighborhoodsLayer = this.createNeighborhoodsLayer(neighborhoodLayerDef);
    } else {
      this.neighborhoodsLayer = null;
    }
  }

  onUpdateImages() {
    this.imageLayers = this.createImageLayers();
  }

  viewInfoDidUpdate() {
    const {
      obsCentroidsIndex,
      obsCentroids,
    } = this.props;
    super.viewInfoDidUpdate(
      obsCentroidsIndex,
      obsCentroids,
      makeDefaultGetObsCoords,
    );
  }

  recenter() {
    const { originalViewState, setViewState } = this.props;
    if (Array.isArray(originalViewState?.target) && typeof originalViewState?.zoom === 'number') {
      setViewState(originalViewState);
    }
  }

  /**
   * Here, asynchronously check whether props have
   * updated which require re-computing memoized variables,
   * followed by a re-render.
   * This function does not follow React conventions or paradigms,
   * it is only implemented this way to try to squeeze out
   * performance.
   * @param {object} prevProps The previous props to diff against.
   */
  componentDidUpdate(prevProps) {
    this.viewInfoDidUpdate();

    const shallowDiff = propName => prevProps[propName] !== this.props[propName];
    const shallowDiffBy = (propName, scopeName) => prevProps[propName][scopeName] !== this.props[propName][scopeName];
    const shallowDiffByFirst = (propName, scopeName) => prevProps[propName][0][scopeName] !== this.props[propName][0][scopeName];
    let forceUpdate = false;
    
    if (
      [
        'obsSegmentations',
        'obsCentroids',
      ].some(shallowDiff)
    ) {
      // Cells data changed.
      this.onUpdateSegmentationsData();
      forceUpdate = true;
    }

    /*
    if (['expressionData'].some(shallowDiff)) {
      // Expression data prop changed.
      // Must come before onUpdateSegmentationsLayer
      // since the new layer may use the new processed expression data.
      this.onUpdateExpressionData();
      forceUpdate = true;
    }
    */

    // Spots data.
    if(shallowDiff('spotLayerScopes')) {
      // Force update for all layers since the layerScopes array changed.
      this.onUpdateAllSpotsData();
      forceUpdate = true;
    } else {
      this.props.spotLayerScopes.forEach((layerScope) => {
        if(
          shallowDiffBy('obsSpots', layerScope)
        ) {
          this.onUpdateSpotsData(layerScope);
          forceUpdate = true;
        }
      });
    }

    // Spot sets data.
    if(shallowDiff('spotLayerScopes')) {
      // Force update for all layers since the layerScopes array changed.
      this.onUpdateAllSpotsSetsData();
      forceUpdate = true;
    } else {
      this.props.spotLayerScopes.forEach((layerScope) => {
        if(
          shallowDiffBy('obsSpotsSets', layerScope)
          || shallowDiffBy('obsSpots', layerScope)
          || shallowDiffByFirst('spotLayerCoordination', layerScope)
        ) {
          this.onUpdateSpotsSetsData(layerScope);
          forceUpdate = true;
        }
      });
    }

    // Spot index data (pre-requisite for below Spot expression data).
    if(shallowDiff('spotLayerScopes')) {
      // Force update for all layers since the layerScopes array changed.
      this.onUpdateAllSpotsIndexData();
      forceUpdate = true;
    } else {
      this.props.spotLayerScopes.forEach((layerScope) => {
        if(
          shallowDiffBy('spotMatrixIndices', layerScope)
          || shallowDiffBy('obsSpots', layerScope)
        ) {
          this.onUpdateSpotsIndexData(layerScope);
          forceUpdate = true;
        }
      });
    }

    // Spot expression data.
    if(shallowDiff('spotLayerScopes')) {
      // Force update for all layers since the layerScopes array changed.
      this.onUpdateAllSpotsExpressionData();
      forceUpdate = true;
    } else {
      this.props.spotLayerScopes.forEach((layerScope) => {
        if(
          shallowDiffBy('spotMatrixIndices', layerScope)
          || shallowDiffBy('obsSpots', layerScope)
          || shallowDiffBy('spotMultiExpressionData', layerScope)
        ) {
          this.onUpdateSpotsExpressionData(layerScope);
          forceUpdate = true;
        }
      });
    }

    if (
      [
        'obsSpots',
        'spotLayerScopes',
        'spotLayerCoordination',
        'spotMultiExpressionData'
      ].some(shallowDiff)
    ) {
      // Expression data prop changed.
      // Must come before onUpdateSegmentationsLayer
      // since the new layer may use the new processed expression data.
      this.onUpdateSpotsLayer();
      forceUpdate = true;
    }

    if (
      [
        'obsSegmentationsLayerDefs',
        'obsSegmentations',
        'obsSegmentationsIndex',
        'obsCentroids',
        'obsCentroidsIndex',
        'hasSegmentations',
        'cellFilter',
        'cellSelection',
        'cellColors',
        'geneExpressionColormapRange',
        'cellColorEncoding',
        'geneExpressionColormap',
        'segmentationLayerCallbacks',
        'segmentationLayerScopes',
        'segmentationLayerCoordination',
        'segmentationChannelScopesByLayer',
        'segmentationChannelCoordination',
        'segmentationMultiExpressionData', // TODO: should this be here?
      ].some(shallowDiff)
    ) {
      // Cells layer props changed.
      this.onUpdateSegmentationsLayer();
      forceUpdate = true;
    }

    if (
      [
        'obsLocations',
        'obsLocationsLabels',
        'obsLocationsFeatureIndex',
      ].some(shallowDiff)
    ) {
      // Molecules data props changed.
      this.onUpdatePointsData();
      forceUpdate = true;
    }

    if (
      [
        'obsLocationsLayerDefs',
        'obsLocations',
        'obsLocationsIndex',
        'obsLocationsLabels',
        'obsLocationsFeatureIndex',
      ].some(shallowDiff)
    ) {
      // Molecules layer props changed.
      this.onUpdatePointsLayer();
      forceUpdate = true;
    }

    if (['neighborhoods'].some(shallowDiff)) {
      // Neighborhoods data changed.
      this.onUpdateNeighborhoodsData();
      forceUpdate = true;
    }

    if (['neighborhoodLayerDefsDefs', 'neighborhoods'].some(shallowDiff)) {
      // Neighborhoods layer props changed.
      this.onUpdateNeighborhoodsLayer();
      forceUpdate = true;
    }

    if (
      [
        'imageLayerDefs',
        'imageLayerLoaders',
        'cellColors',
        'cellHighlight',
        'geneExpressionColormapRange',
        'expressionData',
        'imageLayerCallbacks',
        'geneExpressionColormap',

        'images',
        'imageLayerScopes',
        'imageLayerCoordination',

        'imageChannelScopesByLayer',
        'imageChannelCoordination',
      ].some(shallowDiff)
    ) {
      // Image layers changed.
      this.onUpdateImages();
      forceUpdate = true;
    }
    if (forceUpdate) {
      this.forceUpdate();
    }
  }

  // render() is implemented in the abstract parent class.
}

/**
 * Need this wrapper function here,
 * since we want to pass a forwardRef
 * so that outer components can
 * access the grandchild DeckGL ref,
 * but we are using a class component.
 */
const SpatialWrapper = forwardRef((props, deckRef) => (
  <Spatial {...props} deckRef={deckRef} />
));
export default SpatialWrapper;
