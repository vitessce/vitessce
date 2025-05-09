import React, { forwardRef } from 'react';
import { isEqual } from 'lodash-es';
import {
  deck, viv, getSelectionLayer, ScaledExpressionExtension,
} from '@vitessce/gl';
import { getSourceFromLoader, isInterleaved } from '@vitessce/spatial-utils';
import { Matrix4 } from 'math.gl';
import { PALETTE, getDefaultColor } from '@vitessce/utils';
import { AbstractSpatialOrScatterplot, createQuadTree, getOnHoverCallback } from '@vitessce/scatterplot';
import { getLayerLoaderTuple, HOVER_MODE, renderSubBitmaskLayers } from './utils.js';

const CELLS_LAYER_ID = 'cells-layer';
const MOLECULES_LAYER_ID = 'molecules-layer';
const NEIGHBORHOODS_LAYER_ID = 'neighborhoods-layer';

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
      if (renderingMode === 'Minimum Intensity Projection') {
        return [new viv.AdditiveColormap3DExtensions.MinimumIntensityProjectionExtension()];
      }
      if (renderingMode === 'Maximum Intensity Projection') {
        return [new viv.AdditiveColormap3DExtensions.MaximumIntensityProjectionExtension()];
      }
      return [new viv.AdditiveColormap3DExtensions.AdditiveBlendExtension()];
    }
    // No colormap: use ColorPalette extensions
    if (renderingMode === 'Minimum Intensity Projection') {
      return [new viv.ColorPalette3DExtensions.MinimumIntensityProjectionExtension()];
    }
    if (renderingMode === 'Maximum Intensity Projection') {
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
    this.obsSegmentationsQuadTree = null;
    this.obsSegmentationsData = null;
    this.obsLocationsData = null;

    this.imageLayers = [];
    this.obsSegmentationsBitmaskLayers = [];
    this.obsSegmentationsPolygonLayer = null;
    this.obsLocationsLayer = null;
    this.neighborhoodsLayer = null;

    this.layerLoaderSelections = {};
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
    this.onUpdateCellsData();
    this.onUpdateCellsLayer();
    this.onUpdateMoleculesData();
    this.onUpdateMoleculesLayer();
    this.onUpdateNeighborhoodsData();
    this.onUpdateNeighborhoodsLayer();
    this.onUpdateImages();
  }

  createPolygonSegmentationsLayer(layerDef, hasExplicitPolygons) {
    const {
      stroked, visible, opacity, radius,
    } = layerDef;
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
      setHoverInfo,
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
      onHover: (info) => {
        const standardOnHoverCallback = getOnHoverCallback(
          obsIndex,
          setCellHighlight,
          setComponentHover,
        );
        const obsId = obsIndex[info.index];
        setHoverInfo([obsId], [info.x, info.y], HOVER_MODE.CELL_LAYER);
        standardOnHoverCallback(info);
      },
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
  }

  createMoleculesLayer(layerDef) {
    const {
      obsLocations,
      obsLocationsFeatureIndex: obsLabelsTypes,
      setMoleculeHighlight,
      setHoverInfo,
      setComponentHover,
      obsLocationsIndex,
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
        const standardOnHoverCallback = getOnHoverCallback(
          obsLocationsIndex,
          setMoleculeHighlight,
          setComponentHover,
        );
        const obsId = obsLocationsIndex[info.index];
        setHoverInfo([obsId], [info.x, info.y], HOVER_MODE.MOLECULE_LAYER);
        standardOnHoverCallback(info);
      },
      updateTriggers: {
        getRadius: [layerDef],
        getPosition: [obsLocations],
        getLineColor: [obsLabelsTypes],
        getFillColor: [obsLabelsTypes],
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

  createSelectionLayer() {
    const { obsCentroidsIndex, obsCentroids } = this.props;
    const {
      viewState,
      setCellSelection,
    } = this.props;
    const { tool } = this.state;
    const { obsSegmentationsQuadTree } = this;
    const getCellCoords = makeDefaultGetObsCoords(obsCentroids);
    return getSelectionLayer(
      tool,
      viewState.zoom,
      CELLS_LAYER_ID,
      [
        {
          getObsCoords: getCellCoords,
          obsIndex: obsCentroidsIndex,
          obsQuadTree: obsSegmentationsQuadTree,
          onSelect: (obsIds) => {
            setCellSelection(obsIds);
          },
        },
      ],
    );
  }

  createScaleBarLayer() {
    const {
      viewState,
      width,
      height,
      imageLayerLoaders = {},
      imageLayerDefs,
    } = this.props;
    const use3d = (imageLayerDefs || []).some(i => i.use3d);
    // Just get the first layer/loader since they should all be spatially
    // resolved and therefore have the same unit size scale.
    const loaders = Object.values(imageLayerLoaders);
    if (!viewState || !width || !height || loaders.length < 1) return null;
    const loader = loaders[0];
    if (!loader) return null;
    const source = getSourceFromLoader(loader);
    if (!source.meta) return null;
    const { physicalSizes } = source.meta;
    if (physicalSizes && !use3d) {
      const { x } = physicalSizes;
      const { unit, size } = x;
      if (unit && size) {
        return new viv.ScaleBarLayer({
          id: 'scalebar-layer',
          unit,
          size,
          snap: true,
          viewState: { ...viewState, width, height },
        });
      }
      return null;
    }
    return null;
  }

  createRasterLayer(rawLayerDef, loader, i) {
    const { photometricInterpretation } = this.props;
    const layerDef = {
      ...rawLayerDef,
      channels: rawLayerDef.channels.filter(
        channel => channel.selection && channel.color && channel.slider,
      ),
    };

    // We need to keep the same selections array reference,
    // otherwise the Viv layer will not be re-used as we want it to,
    // since selections is one of its `updateTriggers`.
    // Reference: https://github.com/hms-dbmi/viv/blob/ad86d0f/src/layers/MultiscaleImageLayer/MultiscaleImageLayer.js#L127
    let selections;
    const nextLoaderSelection = layerDef.channels.map(c => c.selection);
    const prevLoaderSelection = this.layerLoaderSelections[layerDef.index];
    if (isEqual(prevLoaderSelection, nextLoaderSelection)) {
      selections = prevLoaderSelection;
    } else {
      selections = nextLoaderSelection;
      this.layerLoaderSelections[layerDef.index] = nextLoaderSelection;
    }
    const useTransparentColor = (!layerDef.visible
      && typeof layerDef.visible === 'boolean')
      || Boolean(layerDef.transparentColor);
    const transparentColor = useTransparentColor ? [0, 0, 0] : null;
    const layerProps = {
      colormap: layerDef.colormap,
      opacity: layerDef.opacity,
      useTransparentColor,
      transparentColor,
      colors: layerDef.channels.map(c => c.color),
      sliders: layerDef.channels.map(c => c.slider),
      resolution: layerDef.resolution,
      renderingMode: layerDef.renderingMode,
      xSlice: layerDef.xSlice,
      ySlice: layerDef.ySlice,
      zSlice: layerDef.zSlice,
      callback: layerDef.callback,
      visibilities: layerDef.channels.map(c => (!layerDef.visible && typeof layerDef.visible === 'boolean'
        ? false
        : c.visible)),
      excludeBackground: useTransparentColor,
    };
    if (!loader || !layerProps) return null;
    const {
      metadata: { transform },
      data,
    } = loader;
    let modelMatrix;
    if (transform) {
      const { scale, translate } = transform;
      modelMatrix = new Matrix4()
        .translate([translate.x, translate.y, 0])
        .scale(scale);
    } else if (layerDef.modelMatrix) {
      // eslint-disable-next-line prefer-destructuring
      modelMatrix = new Matrix4(layerDef.modelMatrix);
    }
    if (rawLayerDef.type === 'bitmask') {
      const {
        geneExpressionColormap,
        geneExpressionColormapRange = [0.0, 1.0],
        cellColorEncoding,
      } = this.props;
      return new viv.MultiscaleImageLayer({
        // `bitmask` is used by the AbstractSpatialOrScatterplot
        // https://github.com/vitessce/vitessce/pull/927/files#diff-9cab35a2ca0c5b6d9754b177810d25079a30ca91efa062d5795181360bc3ff2cR111
        id: `bitmask-layer-${layerDef.index}-${i}`,
        channelsVisible: layerProps.visibilities,
        opacity: layerProps.opacity,
        modelMatrix,
        hoveredCell: Number(this.props.cellHighlight),
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
        onViewportLoad: layerProps.callback,
        colorScaleLo: geneExpressionColormapRange[0],
        colorScaleHi: geneExpressionColormapRange[1],
        isExpressionMode: cellColorEncoding === 'geneSelection',
        colormap: geneExpressionColormap,
        expressionData: this.expression.data,
        // There is no onHover here,
        // see the onHover method of AbstractSpatialOrScatterplot.
      });
    }
    const [Layer, layerLoader] = getLayerLoaderTuple(data, layerDef.use3d);

    const extensions = getVivLayerExtensions(
      layerDef.use3d, layerProps.colormap, layerProps.renderingMode,
    );
    // Safer to only use this prop when we have an interleaved image i.e not multiple channels.
    const rgbInterleavedProps = {};
    if (isInterleaved((Array.isArray(data) ? data[0] : data).shape)) {
      rgbInterleavedProps.visible = layerDef.visible;
    }

    // If the photometricInterpretation props is RGB,
    // either based on the coordination space or
    // the image metadata,
    // then we use the following props which will override
    // the values in the layerProps object (since we pass
    // them via object destructuring afterwards).
    const rgbProps = photometricInterpretation === 'RGB' ? {
      colors: [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
      ],
      contrastLimits: [
        [0, 255],
        [0, 255],
        [0, 255],
      ],
      channelsVisible: [
        true, true, true,
      ],
    } : {};

    return new Layer({
      loader: layerLoader,
      id: `${layerDef.use3d ? 'volume' : 'image'}-layer-${layerDef.index}-${i}`,
      colors: layerProps.colors,
      contrastLimits: layerProps.sliders,
      selections,
      channelsVisible: layerProps.visibilities,
      opacity: layerProps.opacity,
      colormap: layerProps.colormap,
      modelMatrix,
      transparentColor: layerProps.transparentColor,
      useTransparentColor: layerProps.useTransparentColor,
      resolution: layerProps.resolution,
      renderingMode: layerProps.renderingMode,
      pickable: false,
      xSlice: layerProps.xSlice,
      ySlice: layerProps.ySlice,
      zSlice: layerProps.zSlice,
      onViewportLoad: layerProps.callback,
      excludeBackground: layerProps.excludeBackground,
      extensions,
      ...rgbInterleavedProps,
      ...rgbProps,
    });
  }

  use3d() {
    const {
      imageLayerDefs,
    } = this.props;
    return (imageLayerDefs || []).some(i => i.use3d);
  }

  createImageLayers() {
    const {
      imageLayerDefs,
      imageLayerLoaders = {},
      imageLayerCallbacks = [],
    } = this.props;
    const use3d = this.use3d();
    const use3dIndex = (imageLayerDefs || []).findIndex(i => i.use3d);
    return (imageLayerDefs || [])
      .filter(layer => (use3d ? layer.use3d === use3d : true))
      .map((layer, i) => this.createRasterLayer(
        { ...layer, callback: imageLayerCallbacks[use3d ? use3dIndex : i] },
        imageLayerLoaders[layer.index],
        i,
      ));
  }

  createBitmaskLayers() {
    const {
      obsSegmentationsLayerDefs,
      obsSegmentations,
      obsSegmentationsType,
      segmentationLayerCallbacks = [],
    } = this.props;
    if (obsSegmentations && obsSegmentationsType === 'bitmask' && Array.isArray(obsSegmentationsLayerDefs)) {
      const { loaders = [] } = obsSegmentations;
      const use3d = obsSegmentationsLayerDefs.some(i => i.use3d);
      const use3dIndex = obsSegmentationsLayerDefs.findIndex(i => i.use3d);
      return obsSegmentationsLayerDefs
        .filter(layer => (use3d ? layer.use3d === use3d : true))
        .map((layer, i) => this.createRasterLayer(
          { ...layer, callback: segmentationLayerCallbacks[use3d ? use3dIndex : i] },
          loaders[layer.index],
          i,
        ));
    }
    return [];
  }

  getLayers() {
    const {
      imageLayers,
      obsSegmentationsPolygonLayer,
      neighborhoodsLayer,
      obsLocationsLayer,
      obsSegmentationsBitmaskLayers,
    } = this;
    return [
      ...imageLayers,
      ...obsSegmentationsBitmaskLayers,
      obsSegmentationsPolygonLayer,
      neighborhoodsLayer,
      obsLocationsLayer,
      this.createScaleBarLayer(),
      this.createSelectionLayer(),
    ];
  }

  onUpdateCellsData() {
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

  onUpdateCellsLayer() {
    const {
      obsSegmentationsLayerDefs: obsSegmentationsLayerDef,
      obsSegmentationsIndex,
      obsSegmentations,
      obsSegmentationsType,
      obsCentroids,
      obsCentroidsIndex,
      hasSegmentations,
    } = this.props;
    if (obsSegmentationsLayerDef && obsSegmentationsIndex && obsSegmentations && obsSegmentationsType === 'polygon') {
      this.obsSegmentationsPolygonLayer = this.createPolygonSegmentationsLayer(
        obsSegmentationsLayerDef, true,
      );
    } else if (obsSegmentationsLayerDef && obsSegmentations && obsSegmentationsType === 'bitmask') {
      this.obsSegmentationsBitmaskLayers = this.createBitmaskLayers();
    } else if (!hasSegmentations
      && obsSegmentationsLayerDef && !obsSegmentations && !obsSegmentationsIndex
      && obsCentroids && obsCentroidsIndex
    ) {
      // For backwards compatibility (diamond case).
      this.obsSegmentationsPolygonLayer = this.createPolygonSegmentationsLayer(
        obsSegmentationsLayerDef, false,
      );
    } else {
      this.obsSegmentationsPolygonLayer = null;
    }
  }

  onUpdateCellColors() {
    const color = this.randomColorData;
    const { size } = this.props.cellColors;
    if (typeof size === 'number') {
      const cellIds = this.props.cellColors.keys();
      color.data = new Uint8Array(color.height * color.width * 3).fill(
        getDefaultColor(this.props.theme)[0],
      );
      // 0th cell id is the empty space of the image i.e black color.
      color.data[0] = 0;
      color.data[1] = 0;
      color.data[2] = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const id of cellIds) {
        if (id > 0) {
          const cellColor = this.props.cellColors.get(id);
          if (cellColor) {
            color.data.set(cellColor.slice(0, 3), Number(id) * 3);
          }
        }
      }
    }
    this.color = color;
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

  onUpdateMoleculesData() {
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

  onUpdateMoleculesLayer() {
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
      this.obsLocationsLayer = this.createMoleculesLayer(obsLocationsLayerDef);
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
    let forceUpdate = false;
    if (
      [
        'obsSegmentations',
        'obsSegmentationsType',
        'obsCentroids',
      ].some(shallowDiff)
    ) {
      // Cells data changed.
      this.onUpdateCellsData();
      forceUpdate = true;
    }

    if (['cellColors'].some(shallowDiff)) {
      // Cells Color layer props changed.
      // Must come before onUpdateCellsLayer
      // since the new layer may use the new processed color data.
      this.onUpdateCellColors();
      forceUpdate = true;
    }

    if (['expressionData'].some(shallowDiff)) {
      // Expression data prop changed.
      // Must come before onUpdateCellsLayer
      // since the new layer may use the new processed expression data.
      this.onUpdateExpressionData();
      forceUpdate = true;
    }

    if (
      [
        'obsSegmentationsLayerDefs',
        'obsSegmentations',
        'obsSegmentationsIndex',
        'obsSegmentationsType',
        'obsCentroids',
        'obsCentroidsIndex',
        'hasSegmentations',
        'cellFilter',
        'cellSelection',
        'geneExpressionColormapRange',
        'expressionData',
        'cellColorEncoding',
        'geneExpressionColormap',
        'segmentationLayerCallbacks',
      ].some(shallowDiff)
    ) {
      // Cells layer props changed.
      this.onUpdateCellsLayer();
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
      this.onUpdateMoleculesData();
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
      this.onUpdateMoleculesLayer();
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
        'photometricInterpretation',
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
SpatialWrapper.displayName = 'SpatialWrapper';
export default SpatialWrapper;
