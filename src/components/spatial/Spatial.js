import React, {
  useState, useCallback, useMemo, forwardRef, useEffect,
} from 'react';
import DeckGL, {
  ScatterplotLayer, PolygonLayer, OrthographicView, COORDINATE_SYSTEM,
} from 'deck.gl';
import { MultiscaleImageLayer, ImageLayer, ScaleBarLayer } from '@hms-dbmi/viv';
import { quadtree } from 'd3-quadtree';

import { SelectablePolygonLayer, getSelectionLayers } from '../../layers';
import ToolMenu from '../ToolMenu';
import {
  cellLayerDefaultProps, PALETTE, DEFAULT_COLOR,
  DEFAULT_GL_OPTIONS,
  createDefaultUpdateStatus, createDefaultUpdateCellsSelection,
  createDefaultUpdateCellsHover,
  createDefaultUpdateViewInfo, createDefaultClearPleaseWait,
} from '../utils';

const COMPONENT_NAME = 'Spatial';
const CELLS_LAYER_ID = 'cells-layer';


export function square(x, y, r) {
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
}

/**
 * React component which expresses the spatial relationships between cells and molecules.
 * @prop {string} uuid
 * @prop {object} view
 * @prop {number} height Parameter for controlling deck.gl canvas size.
 * @prop {number} width Parameter for controlling deck.gl canvas size.
 * @prop {number} view.zoom
 * @prop {number[]} view.target See https://github.com/uber/deck.gl/issues/2580 for more information.
 * @prop {object} molecules
 * @prop {object} cells
 * @prop {object} neighborhoods
 * @prop {number} cellRadius
 * @prop {number} moleculeRadius
 * @prop {number} cellOpacity The value for `opacity` to pass
 * to the deck.gl cells PolygonLayer.
 * @prop {number} lineWidthScale Width of cell border in view space (deck.gl).
 * @prop {number} lineWidthMaxPixels Max width of the cell border in pixels (deck.gl).
 * @prop {object} imageLayerProps
 * @prop {object} imageLayerLoaders
 * @prop {object} cellColors Object mapping cell IDs to colors.
 * @prop {Set} selectedCellIds Set of selected cell IDs.
 * @prop {function} getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @prop {function} getCellColor Getter function for cell color as [r, g, b] array.
 * @prop {function} getCellPolygon
 * @prop {function} getCellIsSelected Getter function for cell layer isSelected.
 * @prop {function} getMoleculeColor
 * @prop {function} getMoleculePosition
 * @prop {function} getNeighborhoodPolygon
 * @prop {function} updateStatus
 * @prop {function} updateCellsSelection
 * @prop {function} updateCellsHover
 * @prop {function} updateViewInfo
 * @prop {function} clearPleaseWait
 * @prop {function} onCellClick Getter function for cell layer onClick.
 */
const Spatial = forwardRef((props, deckRef) => {
  const {
    uuid = null,
    view = {
      zoom: 2,
      target: [0, 0, 0],
    },
    height,
    width,
    molecules = {},
    cells = {},
    neighborhoods = {},
    areNeighborhoodsOn = false,
    cellRadius = 50,
    areCellsOn = true,
    moleculeRadius = 10,
    cellOpacity = 1.0,
    moleculesOpacity = 1.0,
    lineWidthScale = 10,
    lineWidthMaxPixels = 2,
    areMoleculesOn = true,
    imageLayerProps = {},
    imageLayerLoaders = {},
    cellColors = {},
    selectedCellIds = new Set(),
    getCellCoords = cell => cell.xy,
    getCellColor = cellEntry => (cellColors && cellColors.get(cellEntry[0])) || DEFAULT_COLOR,
    getCellPolygon = (cellEntry) => {
      const cell = cellEntry[1];
      return cell.poly.length ? cell.poly : square(cell.xy[0], cell.xy[1], cellRadius);
    },
    getCellIsSelected = cellEntry => (
      selectedCellIds.size
        ? selectedCellIds.has(cellEntry[0])
        : true // If nothing is selected, everything is selected.
    ),
    getMoleculeColor = d => PALETTE[d[2] % PALETTE.length],
    getMoleculePosition = d => [d[0], d[1], 0],
    getNeighborhoodPolygon = (neighborhoodsEntry) => {
      const neighborhood = neighborhoodsEntry[1];
      return neighborhood.poly;
    },
    updateStatus = createDefaultUpdateStatus(COMPONENT_NAME),
    updateCellsSelection = createDefaultUpdateCellsSelection(COMPONENT_NAME),
    updateCellsHover = createDefaultUpdateCellsHover(COMPONENT_NAME),
    updateViewInfo = createDefaultUpdateViewInfo(COMPONENT_NAME),
    clearPleaseWait = createDefaultClearPleaseWait(COMPONENT_NAME),
    onCellClick = (info) => {
      const cellId = info.object[0];
      const newSelectedCellIds = new Set(selectedCellIds);
      if (selectedCellIds.has(cellId)) {
        newSelectedCellIds.delete(cellId);
        updateCellsSelection(newSelectedCellIds);
      } else {
        newSelectedCellIds.add(cellId);
        updateCellsSelection(newSelectedCellIds);
      }
    },
  } = props;

  // In Deck.gl, layers are considered light weight, and
  // can be created and destroyed quickly, if the data they wrap is stable.
  // https://deck.gl/#/documentation/developer-guide/using-layers?section=creating-layer-instances-is-cheap

  const [gl, setGl] = useState(null);
  const [tool, setTool] = useState(null);
  const [viewState, setViewState] = useState(view);

  useEffect(() => {
    setViewState(prevViewState => ({ ...prevViewState, height, width }));
  }, [height, width]);


  const onInitializeViewInfo = useCallback(({ viewport }) => {
    updateViewInfo({
      uuid,
      project: (cellId) => {
        const cellInfo = cells[cellId];
        try {
          const [positionX, positionY] = getCellCoords(cellInfo);
          return viewport.project([positionX, positionY]);
        } catch (e) {
          return [null, null];
        }
      },
    });
  }, [updateViewInfo, uuid, cells, getCellCoords]);

  const onDeckViewStateChange = ({ viewState: nextViewState }) => {
    setViewState(nextViewState);
  };

  const moleculesData = useMemo(() => {
    let result = null;
    if (molecules) {
      // Process molecules data and cache into re-usable array.
      result = [];
      result = Object
        .entries(molecules)
        .flatMap(([molecule, coords], index) => coords.map(([x, y]) => [x, y, index, molecule]));
      if (clearPleaseWait) clearPleaseWait('molecules');
    }
    return result;
  }, [molecules, clearPleaseWait]);

  const cellsData = useMemo(() => {
    let result = null;
    if (cells) {
      // Process cells data and cache into re-usable array.
      result = Object.entries(cells);
      if (clearPleaseWait) clearPleaseWait('cells');
    }
    return result;
  }, [cells, clearPleaseWait]);

  const neighborhoodsData = useMemo(() => {
    let result = null;
    if (neighborhoods) {
      // Process neighborhoods data and cache into re-usable array.
      result = Object.entries(neighborhoods);
      if (clearPleaseWait) clearPleaseWait('neighborhoods');
    }
    return result;
  }, [neighborhoods, clearPleaseWait]);

  const cellsQuadTree = useMemo(() => {
    // Use the cellsData variable since it is already
    // an array, converted by Object.entries().
    if (!cellsData) {
      // Abort if the cells data is not yet available.
      return null;
    }
    const tree = quadtree()
      .x(d => getCellCoords(d[1])[0])
      .y(d => getCellCoords(d[1])[1])
      .addAll(cellsData);
    return tree;
  }, [getCellCoords, cellsData]);

  // Graphics rendering has the y-axis positive going south,
  // so we need to flip it for rendering tooltips.
  const flipYTooltip = true;

  const cellsLayer = useMemo(() => new SelectablePolygonLayer({
    id: CELLS_LAYER_ID,
    backgroundColor: [0, 0, 0],
    isSelected: getCellIsSelected,
    stroked: true,
    getPolygon: getCellPolygon,
    updateTriggers: {
      getFillColor: [cellOpacity],
    },
    getFillColor: (cellEntry) => {
      const color = getCellColor(cellEntry);
      color[3] = cellOpacity * 255;
      return color;
    },
    getLineColor: (cellEntry) => {
      const color = getCellColor(cellEntry);
      color[3] = 255;
      return color;
    },
    onClick: (info) => {
      if (tool) {
        // If using a tool, prevent individual cell selection.
        // Let SelectionLayer handle the clicks instead.
        return;
      }
      onCellClick(info);
    },
    visible: areCellsOn,
    ...cellLayerDefaultProps(cellsData, updateStatus, updateCellsHover, uuid, flipYTooltip),
    getLineWidth: cellOpacity < 0.7 ? 1 : 0,
    lineWidthScale,
    lineWidthMaxPixels,

  }), [cellsData, updateStatus, updateCellsHover,
    uuid, onCellClick, tool, getCellColor, getCellPolygon, cellOpacity,
    getCellIsSelected, areCellsOn, lineWidthScale, lineWidthMaxPixels, flipYTooltip]);

  const moleculesLayer = useMemo(() => new ScatterplotLayer({
    id: 'molecules-layer',
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    data: moleculesData,
    pickable: true,
    opacity: moleculesOpacity,
    autoHighlight: true,
    getRadius: moleculeRadius,
    radiusMaxPixels: 3,
    getPosition: getMoleculePosition,
    getLineColor: getMoleculeColor,
    getFillColor: getMoleculeColor,
    onHover: (info) => {
      if (info.object) { updateStatus(`Gene: ${info.object[3]}`); }
    },
    visible: areMoleculesOn,
  }), [moleculesData, moleculeRadius, getMoleculePosition, getMoleculeColor,
    updateStatus, moleculesOpacity, areMoleculesOn]);

  const neighborhoodsLayer = useMemo(() => new PolygonLayer({
    id: 'neighborhoods-layer',
    getPolygon: getNeighborhoodPolygon,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    data: neighborhoodsData,
    pickable: true,
    autoHighlight: true,
    stroked: true,
    filled: false,
    getElevation: 0,
    getLineWidth: 10,
    visible: areNeighborhoodsOn,
  }), [neighborhoodsData, getNeighborhoodPolygon, areNeighborhoodsOn]);

  const renderImageLayer = useCallback((layerId, loader) => {
    const layerProps = imageLayerProps[layerId];
    if (!loader || !layerProps) return null;
    const { scale, translate, isPyramid } = loader;
    const Layer = isPyramid ? MultiscaleImageLayer : ImageLayer;
    return new Layer({
      loader,
      id: layerId,
      colorValues: layerProps.colors,
      sliderValues: layerProps.sliders,
      loaderSelection: layerProps.selections,
      channelIsOn: layerProps.visibilities,
      opacity: layerProps.opacity,
      colormap: layerProps.colormap.length > 0 && layerProps.colormap,
      scale: scale || 1,
      translate: translate ? [translate.x, translate.y] : [0, 0],
    });
  }, [imageLayerProps]);

  const scalebarLayer = useMemo(() => {
    // Just get the first layer/loader since they should all be spatially
    // resolved and therefore have the same unit size scale.
    const [layerIdAndLoader] = Object.entries(imageLayerLoaders);
    const { height: viewHeight, width: viewWidth } = viewState;
    if (!layerIdAndLoader || !viewHeight || !viewWidth) return null;
    const loader = layerIdAndLoader[1];
    if (!loader) return null;
    const { physicalSizes } = loader;
    if (physicalSizes) {
      const { x } = physicalSizes;
      const { unit, value } = x;
      if (unit && value) {
        return new ScaleBarLayer({
          id: 'scalebar-layer',
          loader,
          unit,
          size: value,
          viewState,
        });
      }
      return null;
    }
    return null;
  }, [imageLayerLoaders, viewState]);

  const imageLayers = useMemo(() => Object.entries(imageLayerLoaders)
    .map(([layerId, layerLoader]) => renderImageLayer(layerId, layerLoader)), [
    renderImageLayer, imageLayerLoaders,
  ]);

  const layers = [
    ...imageLayers,
    cellsLayer,
    neighborhoodsLayer,
    moleculesLayer,
    scalebarLayer,
  ];

  const selectionLayers = getSelectionLayers(
    tool,
    view.zoom,
    CELLS_LAYER_ID,
    getCellCoords,
    updateCellsSelection,
    cellsQuadTree,
  );

  const deckProps = {
    views: [new OrthographicView({ id: 'ortho' })], // id is a fix for https://github.com/uber/deck.gl/issues/3259
    // gl needs to be initialized for us to use it in Texture creation
    layers: gl ? layers.concat(selectionLayers) : [],
    viewState,
    onViewStateChange: onDeckViewStateChange,
    ...(tool ? {
      controller: { dragPan: false },
      getCursor: () => 'crosshair',
    } : {
      controller: true,
      getCursor: interactionState => (interactionState.isDragging ? 'grabbing' : 'default'),
    }),
  };

  return (
    <>
      <ToolMenu
        activeTool={tool}
        setActiveTool={setTool}
      />
      <DeckGL
        ref={deckRef}
        glOptions={DEFAULT_GL_OPTIONS}
        onWebGLInitialized={setGl}
        {...deckProps}
      >
        {onInitializeViewInfo}
      </DeckGL>
    </>
  );
});

export default Spatial;
