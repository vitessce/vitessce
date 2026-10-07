import React, { PureComponent } from 'react';
import { deck, DEFAULT_GL_OPTIONS } from '@vitessce/gl';
import { Matrix4 } from 'math.gl';
import { OrbitControls, PerspectiveCamera } from '../vendor/index.js';
import { RawView } from './rawView.js';
import ToolMenu from './ToolMenu.js';
import { getCursor, getCursorWithTool } from './cursor.js';

const ROTATION_THRESHOLD = 1;
const ZOOM_THRESHOLD = 0.01;
const TRANSLATION_THRESHOLD = 2;

function isSameZoomAndTarget(viewStateA, viewStateB) {
  return viewStateA?.zoom === viewStateB?.zoom
    && viewStateA?.target?.[0] === viewStateB?.target?.[0]
    && viewStateA?.target?.[1] === viewStateB?.target?.[1];
}

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
      // The current mouse position (in view coordinates)
      // while an annotation shape is being drawn.
      annotationHoverCoord: null,
      // The intermediate { viewState, endViewState } during a
      // viewState transition (e.g., between annotation frames).
      transitionViewState: null,
    };
    this.lastApplied = null;
    // The viewState prop at the start of the current transition, if any.
    this.transitionEndViewState = null;
    this.viewport = null;
    this.threeCamera = null;
    this.orbitControls = null;
    this.canvasCheckIntervalId = null;
    // The most recent external camera snapshot applied to the local camera.
    this.lastSyncedSnapshot = null;
    // The most recent camera snapshot published by this view.
    this.lastPublishedSnapshot = null;
    this.isApplyingExternalSync = false;
    this.isApplyingLocalChange = false;
    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.onTransitionStart = this.onTransitionStart.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.onTransitionInterrupt = this.onTransitionInterrupt.bind(this);
    this.onInitializeViewInfo = this.onInitializeViewInfo.bind(this);
    this.onWebGLInitialized = this.onWebGLInitialized.bind(this);
    this.onToolChange = this.onToolChange.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onClick = this.onClick.bind(this);
    this.recenter = this.recenter.bind(this);
    this.onOrbitControlsChange = this.onOrbitControlsChange.bind(this);
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
    if (this.transitionEndViewState) {
      // The viewState prop (from the coordination space) already holds the
      // end values of the transition, so the intermediate values are only
      // rendered, rather than being emitted via setViewState.
      this.setState({
        transitionViewState: {
          viewState: nextViewState,
          endViewState: this.transitionEndViewState,
        },
      });
      return;
    }
    const use3d = this.use3d();
    // Begin changes for neuroglancer.
    // The following logic reduces the number of viewState updates emitted,
    // which thereby reduces the number of re-renders required of Neuroglancer
    // (when the Neuroglancer view is coordinated with a DeckGL-based Spatial view).
    let targetChanged = false;
    if (nextViewState.target && viewState.target) {
      const dx = Math.abs((nextViewState.target[0] ?? 0) - (viewState.target[0] ?? 0));
      const dy = Math.abs((nextViewState.target[1] ?? 0) - (viewState.target[1] ?? 0));
      const scale = 2 ** (nextViewState.zoom ?? 0);
      const dxPx = Math.abs(dx) * scale;
      const dyPx = Math.abs(dy) * scale;
      targetChanged = dxPx > TRANSLATION_THRESHOLD || dyPx > TRANSLATION_THRESHOLD;
    }
    const prev = this.lastApplied || viewState;
    const zoomChanged = Math.abs((nextViewState.zoom ?? 0) - (prev.zoom ?? 0))
      > ZOOM_THRESHOLD;
    const orbitChanged = Math.abs((nextViewState.rotationOrbit ?? 0) - (prev.rotationOrbit ?? 0))
      > ROTATION_THRESHOLD;
    const xChanged = Math.abs((nextViewState.rotationX ?? 0) - (prev.rotationX ?? 0))
      > ROTATION_THRESHOLD;
    if (!(zoomChanged || orbitChanged || xChanged || targetChanged)) {
      return;
    }
    this.lastApplied = nextViewState;
    // End changes for neuroglancer.
    setViewState({
      ...nextViewState,
      // If the axis is fixed, just use the current target in state i.e don't change target.
      target: spatialAxisFixed && use3d ? viewState.target : nextViewState.target,
    });
  }

  /**
   * Called by DeckGL when a viewState transition starts,
   * when the viewState prop contains transition props
   * (e.g., when the view state changes due to an annotation frame).
   */
  onTransitionStart() {
    const { viewState } = this.props;
    this.transitionEndViewState = viewState;
  }

  /**
   * Called by DeckGL when a viewState transition ends.
   */
  onTransitionEnd() {
    this.transitionEndViewState = null;
    this.setState({ transitionViewState: null });
  }

  /**
   * Called by DeckGL when a viewState transition is interrupted,
   * for example by a change to the viewState prop.
   * This may be called while DeckGL is rendering, so the state is not updated here.
   * Instead, the stale transitionViewState is ignored by getDeckViewState.
   */
  onTransitionInterrupt() {
    this.transitionEndViewState = null;
  }

  /**
   * Get the viewState to pass to DeckGL.
   * @returns {object} The viewState.
   */
  getDeckViewState() {
    const { viewState } = this.props;
    const { transitionViewState } = this.state;
    if (
      transitionViewState
      && transitionViewState.endViewState === this.transitionEndViewState
      && isSameZoomAndTarget(viewState, this.transitionEndViewState)
    ) {
      // Render the intermediate values of the in-progress transition.
      return transitionViewState.viewState;
    }
    // Otherwise, the viewState prop has changed since the transition started,
    // which interrupts the transition (or starts a new one).
    if (viewState.transitionDuration) {
      return {
        ...viewState,
        onTransitionStart: this.onTransitionStart,
        onTransitionEnd: this.onTransitionEnd,
        onTransitionInterrupt: this.onTransitionInterrupt,
      };
    }
    return viewState;
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
   * Called by DeckGL upon a click.
   * When an annotation drawing tool is active,
   * emit the clicked position to the `onAnnotationVertexAdd` prop.
   * @param {object} info The deck.gl picking info.
   */
  onClick(info) {
    const { annotationActiveTool, onAnnotationVertexAdd } = this.props;
    if (annotationActiveTool && onAnnotationVertexAdd && info.coordinate) {
      onAnnotationVertexAdd(info.coordinate);
    }
  }

  /**
   * Get the AnnotationLayer props that are related to editing,
   * which are shared by the Spatial and Scatterplot components.
   * @returns {object} The props.
   */
  getAnnotationEditingLayerProps() {
    const { annotationInProgressShape, annotationSelectedShapeUid } = this.props;
    const { annotationHoverCoord } = this.state;
    return {
      inProgressShape: annotationInProgressShape ?? null,
      hoverCoord: annotationInProgressShape ? annotationHoverCoord : null,
      selectedShapeUid: annotationSelectedShapeUid ?? null,
    };
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
      setHoverInfo, annotationInProgressShape,
    } = this.props;
    if (annotationInProgressShape && coordinate) {
      // Track the mouse position to preview the in-progress annotation shape.
      this.setState({ annotationHoverCoord: [coordinate[0], coordinate[1]] });
    }
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

  setUpOrbitControlsIfReady() {
    if (this.orbitControls) return; // already set up
    const { deckRef, spatialCameraSnapshot } = this.props;
    if (!this.use3d()) return; // only for the RawView/3D path
    const canvas = deckRef?.current?.deck?.canvas;
    if (!canvas || !spatialCameraSnapshot) return;
    const { fovDegrees, projectionScale } = spatialCameraSnapshot;
    const camera = new PerspectiveCamera(
      fovDegrees,
      1,
      Math.max(projectionScale * 1e-4, 1e-3),
      Math.max(projectionScale * 100, 1e5)
    );
    camera.updateProjectionMatrix();

    // Attaching to the parent instead of te canvas due to the overlay which intercepts
    // all the pointer events. It puts OrbitControls
    // at the same DOM level, not underneath that overlay.
    const eventTarget = canvas.parentElement ?? canvas;
    const controls = new OrbitControls(camera, eventTarget);
    controls.zoomSpeed = 0.5;

    this.threeCamera = camera;
    this.orbitControls = controls;

    this.applyCameraSnapshot(spatialCameraSnapshot);
    controls.update();
    controls.addEventListener('change', this.onOrbitControlsChange);
  }

  /**
   * Move the local three.js camera and orbit target to match
   * an external camera snapshot.
   * @param {object} snapshot A spatialCameraSnapshot coordination value.
   */
  applyCameraSnapshot(snapshot) {
    const { position: pivot, quaternion, projectionScale, fovDegrees } = snapshot;
    const fovyRad = (fovDegrees * Math.PI) / 180;
    const distance = projectionScale / (2 * Math.tan(fovyRad / 2)) || 1;
    const rotation = new Matrix4().fromQuaternion(quaternion);
    const offset = rotation.transformAsVector([0, 0, distance]);
    const eye = pivot.map((p, i) => p + offset[i]);
    // OrbitControls calls camera.lookAt(target) on every update, which
    // rebuilds the orientation from camera.up. Use the snapshot's own up vector
    // so that the orientation (including roll) is preserved, rather than
    // snapping back to a world-Y-up orientation upon the next interaction.
    const up = rotation.transformAsVector([0, 1, 0]);
    this.threeCamera.up.set(...up);
    this.threeCamera.position.set(...eye);
    this.threeCamera.quaternion.set(...quaternion);
    this.orbitControls.target.set(...pivot);
    this.lastSyncedSnapshot = snapshot;
  }

  onOrbitControlsChange() {
    if (this.isApplyingExternalSync) return; // our own echo from the sync above, not a user drag
    const { setSpatialCameraSnapshot } = this.props;
    if (!setSpatialCameraSnapshot || !this.threeCamera || !this.orbitControls) {
      this.forceUpdate();
      return;
    }

    const camera = this.threeCamera;
    const { target } = this.orbitControls;
    const distance = camera.position.distanceTo(target);
    const fovyRad = (camera.fov * Math.PI) / 180;
    const projectionScale = distance * 2 * Math.tan(fovyRad / 2);
    const snapshot = {
      position: target.toArray(),
      quaternion: camera.quaternion.toArray(),
      projectionScale,
      fovDegrees: camera.fov,
    };
    // Keep track of our own snapshot, so that when it comes back
    // via the coordination space, it is not re-applied to the local camera.
    this.lastPublishedSnapshot = snapshot;
    setSpatialCameraSnapshot(snapshot);

    this.forceUpdate();
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

  componentDidMount() {
    // Canvas may not exist yet on first mount; retry briefly until it does.
    this.canvasCheckIntervalId = setInterval(() => {
      this.setUpOrbitControlsIfReady();
      if (this.orbitControls) clearInterval(this.canvasCheckIntervalId);
    }, 100);
  }

  componentWillUnmount() {
    if (this.canvasCheckIntervalId) clearInterval(this.canvasCheckIntervalId);
    if (this.orbitControls) {
      this.orbitControls.removeEventListener('change', this.onOrbitControlsChange);
      this.orbitControls.dispose();
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
      deckRef, viewState, uuid, hideTools, hideRecenter, orbitAxis,
      spatialCameraSnapshot, annotationActiveTool,
    } = this.props;
    const { gl, tool } = this.state;
    const hasActiveTool = Boolean(tool || annotationActiveTool);
    const layers = this.getLayers();
    const use3d = this.use3d();
    // RawView path: when there's a real camera snapshot to render from,
    // build a genuine view matrix (position + quaternion + fovy) instead of
    // OrbitView's 2-angle + log2-zoom approximation
    let activeView;
    let isRawView = false;
    if (use3d && spatialCameraSnapshot) {
      isRawView = true;
      const { position: pivot,
        quaternion,
        projectionScale,
        fovDegrees,
      } = spatialCameraSnapshot;
      let eye;
      let quaternionForMatrix;

      if (this.orbitControls && this.threeCamera) {
        if (
          spatialCameraSnapshot !== this.lastSyncedSnapshot
          && spatialCameraSnapshot !== this.lastPublishedSnapshot
          && !this.isApplyingLocalChange
        ) {
          this.applyCameraSnapshot(spatialCameraSnapshot);
        }
        eye = this.threeCamera.position.toArray();
        quaternionForMatrix = this.threeCamera.quaternion.toArray();
      } else {
        const fovyRad = (fovDegrees * Math.PI) / 180;
        const distance = projectionScale / (2 * Math.tan(fovyRad / 2)) || 1;
        const offset = new Matrix4().fromQuaternion(quaternion).transformAsVector([0, 0, distance]);
        eye = pivot.map((p, i) => p + offset[i]);
        quaternionForMatrix = quaternion;
      }

      const modelMatrix = new Matrix4()
        .translate(eye)
        .multiplyRight(new Matrix4().fromQuaternion(quaternionForMatrix));
      const rawViewMatrix = modelMatrix.invert();
      activeView = new RawView({
        id: 'raw',
        controller: false,
        viewState: {
          viewMatrix: rawViewMatrix,
          fovy: fovDegrees,
          near: Math.max(projectionScale * 1e-4, 1e-3),
          far: Math.max(projectionScale * 100, 1e5),
        },
      });
    } else if (use3d) {
      activeView = new deck.OrbitView({ id: 'orbit', controller: true, orbitAxis });
    } else {
      activeView = new deck.OrthographicView({ id: 'ortho' });
    }

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

    let controller;
    if (isRawView) {
      controller = false;
    } else if (hasActiveTool) {
      controller = { dragPan: false };
    } else {
      controller = true;
    }

    return (
      <>
        <ToolMenu
          activeTool={tool}
          setActiveTool={this.onToolChange}
          visibleTools={{
            pan: showPanTool && !hideTools,
            selectLasso: showCellSelectionTools && !hideTools,
            recenter: !hideRecenter,
          }}
          recenterOnClick={this.recenter}
        />
        <deck.DeckGL
          id={`deckgl-overlay-${uuid}`}
          ref={deckRef}
          views={[activeView]}
          layers={
            gl && viewState.target.slice(0, 2).every(i => typeof i === 'number')
              ? layers
              : []
          }
          glOptions={DEFAULT_GL_OPTIONS}
          onWebGLInitialized={this.onWebGLInitialized}
          onViewStateChange={this.onViewStateChange}
          viewState={this.getDeckViewState()}
          useDevicePixels={useDevicePixels}
          controller={controller}
          getCursor={hasActiveTool ? getCursorWithTool : getCursor}
          onHover={this.onHover}
          onClick={this.onClick}
          width="100%"
          height="100%"
        >
          {this.onInitializeViewInfo}
        </deck.DeckGL>
      </>
    );
  }
}
