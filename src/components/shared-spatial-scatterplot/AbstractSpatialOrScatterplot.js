import React, { PureComponent } from 'react';
import DeckGL, { OrthographicView } from 'deck.gl';
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
    const { setViewState } = this.props;
    setViewState(nextViewState);
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
    const { deckRef, viewState, uuid } = this.props;
    const { gl, tool } = this.state;
    const layers = this.getLayers();

    const showCellSelectionTools = this.cellsLayer !== null;
    const showPanTool = this.cellsLayer !== null;

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
          views={[new OrthographicView({ id: 'ortho' })]} // id is a fix for https://github.com/uber/deck.gl/issues/3259
          layers={(gl && viewState.target.every(i => typeof i === 'number')) ? layers : ([])}
          glOptions={DEFAULT_GL_OPTIONS}
          onWebGLInitialized={this.onWebGLInitialized}
          onViewStateChange={this.onViewStateChange}
          viewState={viewState}
          controller={tool ? ({ dragPan: false }) : true}
          getCursor={tool ? getCursorWithTool : getCursor}
        >
          {this.onInitializeViewInfo}
        </DeckGL>
      </>
    );
  }
}
