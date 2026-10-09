/* eslint-disable react-refresh/only-export-components */
import React, { PureComponent, Suspense } from 'react';
import { ChunkWorker, AsyncComputationWorker } from '@vitessce/neuroglancer-workers';
import { NeuroglancerGlobalStyles } from './styles.js';

const LazyReactNeuroglancer = React.lazy(() => import('./ReactNeuroglancer.js'));

function createWorker() {
  const worker = new ChunkWorker();
  worker.AsyncComputationWorker = AsyncComputationWorker;
  return worker;
}

/**
 * Resolve the NG managed-layer name of the currently picked annotation.
 * mouseState.pickedAnnotationLayer is the AnnotationLayerState set by the
 * annotation render layer (this.base.state), which is one of the user layer's
 * annotationStates.states; fall back to matching pickedRenderLayer.
 */
function getPickedAnnotationLayerName(viewer, mouseState) {
  const { pickedAnnotationLayer, pickedRenderLayer } = mouseState;
  // eslint-disable-next-line no-restricted-syntax
  for (const managedLayer of viewer.layerManager.managedLayers) {
    const userLayer = managedLayer.layer;
    if (userLayer) {
      if (pickedAnnotationLayer
        && userLayer.annotationStates?.states?.includes(pickedAnnotationLayer)) {
        return managedLayer.name;
      }
      if (pickedRenderLayer && userLayer.renderLayers?.includes(pickedRenderLayer)) {
        return managedLayer.name;
      }
    }
  }
  return null;
}

export class NeuroglancerComp extends PureComponent {
  constructor(props) {
    super(props);
    this.cellColorMapping = props.cellColorMapping;
    this.justReceivedExternalUpdate = false;
    this.prevMouseStateChanged = null;
    this.prevHoverHandler = null;
    this.onViewerStateChanged = this.onViewerStateChanged.bind(this);
    this.onRef = this.onRef.bind(this);
    // To avoid closure for onSegmentClick(), to update the selection
    this.latestOnSegmentClick = props.onSegmentClick;
    this.latestOnSelectHoveredCoords = props.onSelectHoveredCoords;
    this.state = { bundleRootReady: false };
  }

  onRef(viewerRef) {
    // Here, we have access to the viewerRef.viewer object,
    // which we can use to add/remove event handlers.

    if (viewerRef) {
      // Mount
      const { viewer } = viewerRef;
      this.prevMouseStateChanged = viewer.mouseState.changed;
      // For now, can omit the sliceView bindings, as we only use perspectiveView
      // viewer.inputEventBindings.sliceView.set('at:dblclick0', () => {});
      viewer.inputEventBindings.perspectiveView.set('at:dblclick0', () => {});

      // Disable space interaction to prevent triggering 4panels layout.
      viewer.inputEventBindings.sliceView.set('at:space', () => {});
      viewer.inputEventBindings.perspectiveView.set('at:space', () => {});

      // Remap plain wheel to  ctrl+wheel (zoom) action
      // by traversing the parent binding maps.
      const remapWheelToZoom = (map) => {
        if (map.bindings) {
          const ctrlWheelAction = map.bindings.get('at:control+wheel');
          if (ctrlWheelAction) {
            // Replace plain wheel with the zoom action
            map.bindings.set('at:wheel', ctrlWheelAction);
            const ctrlWheelBubble = map.bindings.get('bubble:control+wheel');
            if (ctrlWheelBubble) {
              map.bindings.set('bubble:wheel', ctrlWheelBubble);
            }
          }
        }
        if (map.parents) {
          map.parents.forEach(p => remapWheelToZoom(p));
        }
      };

      remapWheelToZoom(viewer.inputEventBindings.perspectiveView);

      const { onViewerReady } = this.props;

      this.prevHoverHandler = () => {
        const ms = viewer.mouseState;
        // Read props at hover time (not at mount) so URLs that resolve later are used.
        const { getMeshIdToCellId, centroidAnnotationUrlsByLayerName } = this.props;
        if (ms.pickedAnnotationId != null) {
          // Resolve which annotation layer was picked. Only centroid layers
          // (obsType matches a segmentation) carry a MeshID in their by_id records;
          // transcript/standalone point layers must not be mapped to cell meshes.
          const layerName = getPickedAnnotationLayerName(viewer, ms);
          const annotationUrl = layerName
            ? centroidAnnotationUrlsByLayerName?.[layerName]
            : null;
          if (!annotationUrl) {
            this.latestOnSelectHoveredCoords?.(null);
            return;
          }
          // For centroid hover: pickedAnnotationId is a by_id lookup key (not MeshID).
          // Fetch by_id record to get actual MeshID (at offset 12),
          // then convert MeshID to CellID for scatterplot highlight.
          const byIdKey = String(ms.pickedAnnotationId);
          fetch(`${annotationUrl}/by_id/${byIdKey}`)
            .then(r => r.arrayBuffer())
            .then((buf) => {
              const dv = new DataView(buf);
              const actualMeshId = String(dv.getInt32(12, true));
              const cellId = getMeshIdToCellId?.(actualMeshId) ?? actualMeshId;
              this.latestOnSelectHoveredCoords?.(cellId);
            })
            .catch(() => {});
          return;
        }
        // TODO: Undo if meshes and cells have same id
        if (ms.pickedValue !== undefined && ms.pickedValue !== null) {
          const meshId = String(ms.pickedValue?.low);
          const cellId = getMeshIdToCellId?.(meshId) ?? meshId;
          this.latestOnSelectHoveredCoords?.(cellId);
          return;
        }
        this.latestOnSelectHoveredCoords?.(null);
      };

      onViewerReady?.(() => {
        const panel = viewer.display.panels.values().next().value;
        /* eslint-disable-next-line no-underscore-dangle */
        return panel?.projectionParameters?.value_?.viewProjectionMat;
      });

      viewer.mouseState.changed.add(this.prevHoverHandler);
    } else {
      if (this.prevMouseStateChanged && this.prevHoverHandler) {
        this.prevMouseStateChanged.remove(this.prevHoverHandler);
        this.prevHoverHandler = null;
      }
      this.prevMouseStateChanged = null;
    }
  }

  onViewerStateChanged(nextState) {
    const { setViewerState } = this.props;
    setViewerState(nextState);
  }

  componentDidUpdate(prevProps) {
    const { onSelectHoveredCoords } = this.props;
    if (prevProps.onSelectHoveredCoords !== onSelectHoveredCoords) {
      this.latestOnSelectHoveredCoords = onSelectHoveredCoords;
    }
  }

  componentDidMount() {
    this.bundleRoot = createWorker();
    this.setState({ bundleRootReady: true });
  }

  componentWillUnmount() {
    this.bundleRoot?.terminate();
    this.bundleRoot = null;
  }

  render() {
    const { classes,
      viewerState,
      cellColorMapping,
      onLayerLoadingChange,
      onAnnotationSourceReady,
      onViewerReady,
      meshOpacityByLayer,
    } = this.props;
    const { bundleRootReady } = this.state;
    return (
      <>
        <NeuroglancerGlobalStyles classes={classes} />
        <div className={classes.neuroglancerWrapper}>
          <Suspense fallback={<div>Loading...</div>}>
            {bundleRootReady && (
              <LazyReactNeuroglancer
                brainMapsClientId="NOT_A_VALID_ID"
                viewerState={viewerState}
                onViewerStateChanged={this.onViewerStateChanged}
                onLayerLoadingChange={onLayerLoadingChange}
                bundleRoot={this.bundleRoot}
                cellColorMapping={cellColorMapping}
                ref={this.onRef}
                onAnnotationSourceReady={onAnnotationSourceReady}
                onViewerReady={onViewerReady}
                meshOpacityByLayer={meshOpacityByLayer}
              />
            )}
          </Suspense>
        </div>
      </>
    );
  }
}
