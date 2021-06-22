import React, { PureComponent } from 'react';
import DeckGL, { OrthographicView, OrbitView } from 'deck.gl';
import ToolMenu from './ToolMenu';
import { DEFAULT_GL_OPTIONS } from '../utils';
import { getCursor, getCursorWithTool } from './cursor';

/**
 * Abstract class component intended to be inherited by
 * the Spatial and Scatterplot class components.
 * Contains a common constructor, common DeckGL callbacks,
 * and common render function.
 */
export default class AbstractSpatialOrScatterplot extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      gl: null,
      tool: null,
    };

    this.viewport = null;

    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.onInitializeViewInfo = this.onInitializeViewInfo.bind(this);
    this.onWebGLInitialized = this.onWebGLInitialized.bind(this);
    this.onToolChange = this.onToolChange.bind(this);
    this.onHover = this.onHover.bind(this);
  }

  /**
   * Called by DeckGL upon a viewState change,
   * for example zoom or pan interaction.
   * Emit the new viewState to the `setViewState`
   * handler prop.
   * @param {object} params
   * @param {object} params.viewState The next deck.gl viewState.
   */
  onViewStateChange({ viewState: nextViewState }) {
    const { setViewState, viewState, layers } = this.props;
    const useFixedAxis = layers?.some(l => l.useFixedAxis);
    setViewState({
      ...nextViewState,
      target: useFixedAxis ? viewState.target : nextViewState.target,
    });
  }

  /**
   * Called by DeckGL upon viewport
   * initialization.
   * @param {object} viewState
   * @param {object} viewState.viewport
   */
  onInitializeViewInfo({ viewport }) {
    this.viewport = viewport;
  }

  /**
   * Called by DeckGL upon initialization,
   * helps to understand when to pass layers
   * to the DeckGL component.
   * @param {object} gl The WebGL context object.
   */
  onWebGLInitialized(gl) {
    this.setState({ gl });
  }

  /**
   * Called by the ToolMenu buttons.
   * Emits the new tool value to the
   * `onToolChange` prop.
   * @param {string} tool Name of tool.
   */
  onToolChange(tool) {
    const { onToolChange: onToolChangeProp } = this.props;
    this.setState({ tool });
    if (onToolChangeProp) {
      onToolChangeProp(tool);
    }
  }

  /**
   * Create the DeckGL layers.
   * @returns {object[]} Array of
   * DeckGL layer objects.
   * Intended to be overriden by descendants.
   */
  // eslint-disable-next-line class-methods-use-this
  getLayers() {
    return [];
  }

  // eslint-disable-next-line consistent-return
  onHover(info) {
    const { coordinate, layer, sourceLayer } = info;
    const { setCellHighlight, cellHighlight, setComponentHover } = this.props;
    if (!sourceLayer) {
      return null;
    }
    if (!setCellHighlight) {
      return null;
    }
    if (!coordinate) {
      return null;
    }
    const { channelData, bounds } = sourceLayer.props;
    if (!channelData) {
      return null;
    }
    const { data, width } = channelData;
    if (!data) {
      return null;
    }
    // Tiled layer needs a custom layerZoomScale.
    if (sourceLayer.id.includes('bitmask')) {
      const { tileSize } = layer.props.loader[0];
      const { z } = sourceLayer.props.tileId;
      // The zoomed out layer needs to use the fixed zoom at which it is rendered.
      // See the following for why we have this calculation with 512:
      // https://github.com/visgl/deck.gl/blob/2b15bc459c6534ea38ce1153f254ce0901f51d6f/modules/geo-layers/src/tile-layer/utils.js#L130.
      const layerZoomScale = Math.max(
        1,
        2 ** Math.round(-z + Math.log2(512 / tileSize)),
      );
      const dataCoords = [
        Math.floor((coordinate[0] - bounds[0]) / layerZoomScale),
        Math.floor((coordinate[1] - bounds[3]) / layerZoomScale),
      ];
      const coords = dataCoords[1] * width + dataCoords[0];
      const hoverData = data.map(d => d[coords]);
      const cellId = hoverData.find(i => i > 0);
      if (cellId !== Number(cellHighlight)) {
        if (setComponentHover) {
          setComponentHover();
        }
        // eslint-disable-next-line no-unused-expressions
        setCellHighlight(cellId ? String(cellId) : '');
      }
    }
  }

  /**
   * Emits a function to project from the
   * cell ID space to the scatterplot or
   * spatial coordinate space, via the
   * `updateViewInfo` prop.
   */
  viewInfoDidUpdate(getCellCoords) {
    const { updateViewInfo, cells, uuid } = this.props;
    const { viewport } = this;
    if (updateViewInfo && viewport) {
      updateViewInfo({
        uuid,
        project: (cellId) => {
          const cell = cells[cellId];
          try {
            const [positionX, positionY] = getCellCoords(cell);
            return viewport.project([positionX, positionY]);
          } catch (e) {
            return [null, null];
          }
        },
      });
    }
  }

  /**
   * Intended to be overriden by descendants.
   */
  componentDidUpdate() {

  }

  /**
   * A common render function for both Spatial
   * and Scatterplot components.
   */
  render() {
    const {
      deckRef, viewState, uuid, layers: layerProps,
    } = this.props;
    const { gl, tool } = this.state;
    const layers = this.getLayers();
    const use3D = layerProps.some(l => l.use3D);

    const showCellSelectionTools = this.cellsLayer !== null
      || (this.cellsEntries.length && this.cellsEntries[0][1].xy);
    const showPanTool = this.cellsLayer !== null || layerProps.findIndex(l => l.type === 'bitmask' || l.type === 'raster') >= 0;
    // For large datasets, the visual quality takes only a small
    // hit in exchange for much better performance by setting this to false:
    // https://deck.gl/docs/api-reference/core/deck#usedevicepixels
    const useDevicePixels = this.cellsEntries.length < 100000;

    return (
      <>
        <ToolMenu
          activeTool={tool}
          setActiveTool={this.onToolChange}
          visibleTools={{
            pan: showPanTool,
            selectRectangle: showCellSelectionTools,
            selectLasso: showCellSelectionTools,
          }}
        />
        <DeckGL
          id={`deckgl-overlay-${uuid}`}
          ref={deckRef}
          views={[
            use3D
              ? new OrbitView({ id: 'orbit', controller: true, orbitAxis: 'Y' })
              : new OrthographicView({
                id: 'ortho',
              }),
          ]} // id is a fix for https://github.com/uber/deck.gl/issues/3259
          layers={
            gl && viewState.target.slice(0, 2).every(i => typeof i === 'number')
              ? layers
              : []
          }
          glOptions={DEFAULT_GL_OPTIONS}
          onWebGLInitialized={this.onWebGLInitialized}
          onViewStateChange={this.onViewStateChange}
          viewState={viewState}
          useDevicePixels={useDevicePixels}
          controller={tool ? { dragPan: false } : true}
          getCursor={tool ? getCursorWithTool : getCursor}
          onHover={this.onHover}
        >
          {this.onInitializeViewInfo}
        </DeckGL>
      </>
    );
  }
}
