import React, { PureComponent } from 'react';
import { deck, DEFAULT_GL_OPTIONS } from '@vitessce/gl';
import { Matrix4 } from 'math.gl';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RawView } from './rawView.js';
import ToolMenu from './ToolMenu.js';
import { getCursor, getCursorWithTool } from './cursor.js';

const ROTATION_THRESHOLD = 1;
const ZOOM_THRESHOLD = 0.01;
const TRANSLATION_THRESHOLD = 2;
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
    this.lastApplied = null;
    this.viewport = null;
    this.threeCamera = null;
    this.orbitControls = null;
    this.canvasCheckIntervalId = null;
    this.lastSyncedSnapshot = null;
    this.isApplyingExternalSync = false;
    this.isApplyingLocalChange = false;
    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.onInitializeViewInfo = this.onInitializeViewInfo.bind(this);
    this.onWebGLInitialized = this.onWebGLInitialized.bind(this);
    this.onToolChange = this.onToolChange.bind(this);
    this.onHover = this.onHover.bind(this);
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

  setUpOrbitControlsIfReady() {
    if (this.orbitControls) return; // already set up
    const { deckRef, rawCameraSnapshot } = this.props;
    if (!this.use3d()) return; // only for the RawView/3D path
    const canvas = deckRef?.current?.deck?.canvas;
    if (!canvas || !rawCameraSnapshot) return;
    // console.log('[OrbitControls setup]', {
    //     hasDeckRef: !!deckRef?.current,
    //     deckRefKeys: deckRef?.current ? Object.keys(deckRef.current) : null,
    //     hasDeck: !!deckRef?.current?.deck,
    //     hasCanvas: !!canvas,
    //     hasSnapshot: !!rawCameraSnapshot,
    //   });

    const { position, quaternion, target, fovDegrees } = rawCameraSnapshot;
    const camera = new THREE.PerspectiveCamera(fovDegrees, 1, 0.1, 100000);
    camera.position.set(...position);
    camera.quaternion.set(...quaternion);
    camera.updateProjectionMatrix();

    // Attaching to the parent instead of te canvas due to the overlay which intercepts
    // all the pointer events. It puts OrbitControls
    // at the same DOM level, not underneath that overlay.
    const eventTarget = canvas.parentElement ?? canvas;
    const controls = new OrbitControls(camera, eventTarget);
    controls.target.set(...target);
    controls.update();
    controls.addEventListener('change', this.onOrbitControlsChange);

    this.threeCamera = camera;
    this.orbitControls = controls;
  }

  onOrbitControlsChange() {
    if (this.isApplyingExternalSync) return; // our own echo from the sync above, not a user drag
    const { setSpatialBetaCameraSnapshot } = this.props;
    if (!setSpatialBetaCameraSnapshot || !this.threeCamera || !this.orbitControls) {
      this.forceUpdate();
      return;
    }

    const camera = this.threeCamera;
    const { target } = this.orbitControls;
    const distance = camera.position.distanceTo(target);
    const fovyRad = (camera.fov * Math.PI) / 180;
    const projectionScale = distance * 2 * Math.tan(fovyRad / 2);
    // console.log('[sb publish]', { distance, projectionScale });
    // console.log('[sb publish rot]', camera.quaternion.toArray());
    setSpatialBetaCameraSnapshot({
      position: target.toArray(), // NG has no free eye -- only a pivot
      projectionOrientation: camera.quaternion.toArray(),
      projectionScale,
    });

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
    // console.log(viewport, JSON.stringify(viewport));
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
      rawCameraSnapshot,
    } = this.props;
    // console.log('[RawView] prop received', JSON.stringify(rawCameraSnapshot));
    const { gl, tool } = this.state;
    const layers = this.getLayers();
    const use3d = this.use3d();
    // RawView path: when there's a real NG camera snapshot to render from,
    // build a genuine view matrix (position + quaternion + fovy) instead of
    // OrbitView's 2-angle + log2-zoom approximation
    let activeView;
    let isRawView = false;
    if (use3d && rawCameraSnapshot) {
      isRawView = true;
      const { position: pivot,
        quaternion,
        projectionScale,
        fovDegrees,
        target,
      } = rawCameraSnapshot;
      let eye;
      let quaternionForMatrix;

      if (this.orbitControls && this.threeCamera) {
        if (rawCameraSnapshot !== this.lastSyncedSnapshot && !this.isApplyingLocalChange) {
          const fovyRad = (fovDegrees * Math.PI) / 180;
          const distance = projectionScale / (2 * Math.tan(fovyRad / 2)) || 1;
          const offset = new Matrix4().fromQuaternion(quaternion)
            .transformAsVector([0, 0, distance]);
          const externalEye = pivot.map((p, i) => p + offset[i]);
          this.threeCamera.position.set(...externalEye);
          this.threeCamera.quaternion.set(...quaternion);
          this.orbitControls.target.set(...target);
          this.lastSyncedSnapshot = rawCameraSnapshot;
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
          near: 0.1,
          far: 100000,
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
    } else if (tool) {
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
          viewState={viewState}
          useDevicePixels={useDevicePixels}
          controller={controller}
          getCursor={tool ? getCursorWithTool : getCursor}
          onHover={this.onHover}
          width="100%"
          height="100%"
        >
          {this.onInitializeViewInfo}
        </deck.DeckGL>
      </>
    );
  }
}
