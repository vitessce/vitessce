import React, { PureComponent } from 'react';
import { deck, DEFAULT_GL_OPTIONS } from '@vitessce/gl';
import ToolMenu from './ToolMenu.js';
import { getCursor, getCursorWithTool } from './cursor.js';

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
    this.recenter = this.recenter.bind(this);
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
    const {
      setViewState, viewState, spatialAxisFixed,
    } = this.props;
    const use3d = this.use3d();
    setViewState({
      ...nextViewState,
      // If the axis is fixed, just use the current target in state i.e don't change target.
      target: spatialAxisFixed && use3d ? viewState.target : nextViewState.target,
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

  // TODO: remove this method and use the layer-level onHover instead.
  // (e.g., see delegateHover in spatial-beta/SpatialSubscriber.js).
  // eslint-disable-next-line consistent-return
  onHover(info) {
    const {
      coordinate, sourceLayer: layer, tile,
    } = info;
    const {
      setCellHighlight, cellHighlight, setComponentHover, layers,
      setHoverInfo,
    } = this.props;
    const hasBitmask = (layers || []).some(l => l.type === 'bitmask');
    if (!setCellHighlight || !tile) {
      return null;
    }
    if (!layer || !coordinate) {
      if (cellHighlight && hasBitmask) {
        setCellHighlight(null);
      }
      if (setHoverInfo) {
        setHoverInfo(null, null);
      }
      return null;
    }
    const {
      content,
      bbox,
      index: { z },
    } = tile;
    if (!content) {
      if (cellHighlight && hasBitmask) {
        setCellHighlight(null);
      }
      if (setHoverInfo) {
        setHoverInfo(null, null);
      }
      return null;
    }
    const { data, width, height } = content;
    const {
      left, right, top, bottom,
    } = bbox;
    const bounds = [
      left,
      data.height < layer.tileSize ? height : bottom,
      data.width < layer.tileSize ? width : right,
      top,
    ];
    if (!data) {
      if (cellHighlight && hasBitmask) {
        setCellHighlight(null);
      }
      return null;
    }
    // Tiled layer needs a custom layerZoomScale.
    if (layer.id.includes('bitmask')) {
      // The zoomed out layer needs to use the fixed zoom at which it is rendered.
      const layerZoomScale = Math.max(
        1,
        2 ** Math.round(-z),
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
        setCellHighlight(cellId ? String(cellId) : null);
      }
      if (setHoverInfo) {
        if (cellId) {
          setHoverInfo(hoverData, coordinate);
        } else {
          setHoverInfo(null, null);
        }
      }
    }
  }

  /**
   * Emits a function to project from the
   * cell ID space to the scatterplot or
   * spatial coordinate space, via the
   * `updateViewInfo` prop.
   */
  viewInfoDidUpdate(obsIndex, obsLocations, makeGetObsCoords) {
    const { updateViewInfo, uuid } = this.props;
    const { viewport } = this;
    if (updateViewInfo && viewport) {
      updateViewInfo({
        uuid,
        project: viewport.project,
        projectFromId: (obsId) => {
          try {
            if (obsIndex && obsLocations) {
              const getObsCoords = makeGetObsCoords(obsLocations);
              const obsIdx = obsIndex.indexOf(obsId);
              const obsCoord = getObsCoords(obsIdx);
              return viewport.project(obsCoord);
            }
            return [null, null];
          } catch (e) {
            return [null, null];
          }
        },
      });
    }
  }

  /**
   * Intended to be overridden by descendants.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  componentDidUpdate() {

  }

  /** Intended to be overridden by descendants.
   * Resets the view type to its original position.
  */
  // eslint-disable-next-line class-methods-use-this
  recenter() {}

  /**
   * Intended to be overridden by descendants.
   * @returns {boolean} Whether or not any layers are 3D.
   */
  // eslint-disable-next-line class-methods-use-this
  use3d() {
    return false;
  }

  /**
   * A common render function for both Spatial
   * and Scatterplot components.
   */
  render() {
    const {
      deckRef, viewState, uuid, hideTools, orbitAxis,
    } = this.props;
    const { gl, tool } = this.state;
    const layers = this.getLayers();
    const use3d = this.use3d();

    const showCellSelectionTools = this.obsSegmentationsData !== null;
    const showPanTool = layers.length > 0;
    // For large datasets or ray casting, the visual quality takes only a small
    // hit in exchange for much better performance by setting this to false:
    // https://deck.gl/docs/api-reference/core/deck#usedevicepixels
    const useDevicePixels = (!use3d
      && (
        this.obsSegmentationsData?.shape?.[0] < 100000
        || this.obsLocationsData?.shape?.[1] < 100000
      )
    );

    return (
      <>
        <ToolMenu
          activeTool={tool}
          setActiveTool={this.onToolChange}
          visibleTools={{
            pan: showPanTool && !hideTools,
            selectLasso: showCellSelectionTools && !hideTools,
          }}
          recenterOnClick={this.recenter}
        />
        <deck.DeckGL
          id={`deckgl-overlay-${uuid}`}
          ref={deckRef}
          views={[
            use3d
              ? new deck.OrbitView({ id: 'orbit', controller: true, orbitAxis })
              : new deck.OrthographicView({
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
        </deck.DeckGL>
      </>
    );
  }
}
