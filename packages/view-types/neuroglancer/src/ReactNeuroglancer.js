/* *****
  This react wrapper is originally developed by janelia-flyem group now called neuroglancerHub
  code source: https://github.com/neuroglancerhub/react-neuroglancer/blob/master/src/index.jsx

  The following  modifications were added  for Vitessce integration and
  are  marked with a comment referring to Vitessce
  1. applyColorsAndVisibility() adds the cellColorMapping (prop) from the cell-set selection
  2. componentDidMount() and componentDidUpdate() renders and updates the viewerState using
  the restoreState() for updating the camera setting and segments.
  3. A set of functions to avoid frequent state updates and provide smoother animations
  within the rendering cycling using requestAnimationFrame()
*/


/* eslint-disable max-len, consistent-return, react/destructuring-assignment,  class-methods-use-this, no-restricted-syntax, no-continue, no-unused-vars, react/forbid-prop-types, no-dupe-keys */
import React from 'react';
import { AnnotationUserLayer } from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/annotation/user_layer.js';
import { getObjectColor } from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/segmentation_display_state/frontend.js';
import { SegmentationUserLayer } from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/segmentation_user_layer.js';
import { serializeColor } from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/util/color.js';
import { setupDefaultViewer } from '@janelia-flyem/neuroglancer';
import { Uint64 } from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/util/uint64.js';
import { urlSafeParse } from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/util/json.js';
/* eslint-disable max-len */
// import { encodeFragment } from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/ui/url_hash_binding';

import { diffCameraState } from './utils.js';
// TODO: Grey color used by Vitessce - maybe set globally
const GREY_HEX = '#323232';

const viewersKeyed = {};
let viewerNoKey;

/**
 * @typedef {Object} NgProps
 * @property {number} perspectiveZoom
 * @property {Object} viewerState
 * @property {string} brainMapsClientId
 * @property {string} key
 * @property {Object<string, string>} cellColorMapping
 *
 * @property {Array} eventBindingsToUpdate
 * An array of event bindings to change in Neuroglancer.  The array format is as follows:
 * [[old-event1, new-event1], [old-event2], old-event3]
 * Here, `old-event1`'s will be unbound and its action will be re-bound to `new-event1`.
 * The bindings for `old-event2` and `old-event3` will be removed.
 * Neuroglancer has its own syntax for event descriptors, and here are some examples:
 * 'keya', 'shift+keyb' 'control+keyc', 'digit4', 'space', 'arrowleft', 'comma', 'period',
 * 'minus', 'equal', 'bracketleft'.
 *
 * @property {(segment:any|null, layer:any) => void} onSelectedChanged
 * A function of the form `(segment, layer) => {}`, called each time there is a change to
 * the segment the user has 'selected' (i.e., hovered over) in Neuroglancer.
 * The `segment` argument will be a Neuroglancer `Uint64` with the ID of the now-selected
 * segment, or `null` if no segment is now selected.
 * The `layer` argument will be a Neuroglaner `ManagedUserLayer`, whose `layer` property
 * will be a Neuroglancer `SegmentationUserLayer`.
 *
 * @property {(segments:any, layer:any) => void} onVisibleChanged
 * A function of the form `(segments, layer) => {}`, called each time there is a change to
 * the segments the user has designated as 'visible' (i.e., double-clicked on) in Neuroglancer.
 * The `segments` argument will be a Neuroglancer `Uint64Set` whose elements are `Uint64`
 * instances for the IDs of the now-visible segments.
 * The `layer` argument will be a Neuroglaner `ManagedUserLayer`, whose `layer` property
 * will be a Neuroglancer `SegmentationUserLayer`.
 *
 * @property {() => void} onSelectionDetailsStateChanged
 * A function of the form `() => {}` to respond to selection changes in the viewer.
 * @property {() => void} onViewerStateChanged
 *
 * @property {Array<Object>} callbacks
 * // ngServer: string,
 */

// Adopted from neuroglancer/ui/url_hash_binding.ts
export function parseUrlHash(url) {
  let state = null;

  let s = url.replace(/^[^#]+/, '');
  if (s === '' || s === '#' || s === '#!') {
    s = '#!{}';
  }

  if (s.startsWith('#!+')) {
    s = s.slice(3);
    // Firefox always %-encodes the URL even if it is not typed that way.
    s = decodeURIComponent(s);
    state = urlSafeParse(s);
  } else if (s.startsWith('#!')) {
    s = s.slice(2);
    s = decodeURIComponent(s);
    state = urlSafeParse(s);
  } else {
    throw new Error('URL hash is expected to be of the form \'#!{...}\' or \'#!+{...}\'.');
  }

  return state;
}

export function getNeuroglancerViewerState(key) {
  const v = key ? viewersKeyed[key] : viewerNoKey;
  return v ? v.state.toJSON() : {};
}

export function getNeuroglancerColor(idStr, key) {
  try {
    const id = Uint64.parseString(idStr);
    const v = key ? viewersKeyed[key] : viewerNoKey;
    if (v) {
      // eslint-disable-next-line no-restricted-syntax
      for (const layer of v.layerManager.managedLayers) {
        if (layer.layer instanceof SegmentationUserLayer) {
          const { displayState } = layer.layer;
          const colorVec = getObjectColor(displayState, id);

          // To get the true color, undo how getObjectColor() indicates hovering.
          if (displayState.segmentSelectionState.isSelected(id)) {
            for (let i = 0; i < 3; i += 1) {
              colorVec[i] = (colorVec[i] - 0.5) / 0.5;
            }
          }

          const colorStr = serializeColor(colorVec);
          return colorStr;
        }
      }
    }
  } catch {
    // suppress eslint no-empty
  }
  return '';
}

export function closeSelectionTab(key) {
  const v = key ? viewersKeyed[key] : viewerNoKey;
  if (v && v.closeSelectionTab) {
    v.closeSelectionTab();
  }
}

export function getLayerManager(key) {
  const v = key ? viewersKeyed[key] : viewerNoKey;
  if (v) {
    return v.layerManager;
  }
  return undefined;
}

export function getManagedLayer(key, name) {
  const layerManager = getLayerManager(key);
  if (layerManager) {
    return layerManager.managedLayers.filter(layer => layer.name === name)[0];
  }
  return undefined;
}

export function getAnnotationLayer(key, name) {
  const layer = getManagedLayer(key, name);
  if (layer && layer.layer instanceof AnnotationUserLayer) {
    return layer.layer;
  }
  return undefined;
}

export function getAnnotationSource(key, name) {
  const layer = getAnnotationLayer(key, name);
  /* eslint-disable-next-line no-underscore-dangle */
  if (layer && layer.dataSources && layer.dataSources[0].loadState_) {
    /* eslint-disable-next-line no-underscore-dangle */
    const { dataSource } = layer.dataSources[0].loadState_;
    if (dataSource) {
      return dataSource.subsources[0].subsource.annotation;
    }
  }
  return undefined;
}

export function addLayerSignalRemover(key, name, remover) {
  const layerManager = getLayerManager(key);
  if (layerManager && name && remover) {
    if (!layerManager.customSignalHandlerRemovers) {
      layerManager.customSignalHandlerRemovers = {};
    }
    if (!layerManager.customSignalHandlerRemovers[name]) {
      layerManager.customSignalHandlerRemovers[name] = [];
    }

    layerManager.customSignalHandlerRemovers[name].push(remover);
  }
}

export function unsubscribeLayersChangedSignals(layerManager, signalKey) {
  if (layerManager) {
    if (layerManager.customSignalHandlerRemovers) {
      if (layerManager.customSignalHandlerRemovers[signalKey]) {
        layerManager.customSignalHandlerRemovers[signalKey].forEach(
          (remover) => {
            remover();
          },
        );
        // eslint-disable-next-line no-param-reassign
        delete layerManager.customSignalHandlerRemovers[signalKey];
      }
    }
  }
}

export function configureLayersChangedSignals(key, layerConfig) {
  const layerManager = getLayerManager(key);
  if (layerManager) {
    const { layerName } = layerConfig;
    unsubscribeLayersChangedSignals(layerManager, layerName);
    if (layerConfig.process) {
      const recordRemover = remover => addLayerSignalRemover(undefined, layerName, remover);
      recordRemover(
        layerManager.layersChanged.add(() => {
          const layer = getManagedLayer(undefined, layerName);
          if (layer) {
            layerConfig.process(layer);
          }
        }),
      );
      const layer = getManagedLayer(undefined, layerName);
      if (layer) {
        layerConfig.process(layer);
      }

      return () => {
        if (layerConfig.cancel) {
          layerConfig.cancel();
        }
        unsubscribeLayersChangedSignals(layerManager, layerName);
      };
    }
  }
  return layerConfig.cancel;
}

function configureAnnotationSource(source, props, recordRemover) {
  if (source && !source.signalReady) {
    if (props.onAnnotationAdded) {
      recordRemover(
        source.childAdded.add((annotation) => {
          props.onAnnotationAdded(annotation);
        }),
      );
    }
    if (props.onAnnotationDeleted) {
      recordRemover(
        source.childDeleted.add((id) => {
          props.onAnnotationDeleted(id);
        }),
      );
    }
    if (props.onAnnotationUpdated) {
      recordRemover(
        source.childUpdated.add((annotation) => {
          props.onAnnotationUpdated(annotation);
        }),
      );
    }
    if (props.onAnnotationChanged && source.referencesChanged) {
      recordRemover(source.referencesChanged.add(props.onAnnotationChanged));
    }
    // eslint-disable-next-line no-param-reassign
    source.signalReady = true;
    recordRemover(() => {
      // eslint-disable-next-line no-param-reassign
      source.signalReady = false;
    });
  }
}

function getLoadedDataSource(layer) {
  /* eslint-disable-next-line no-underscore-dangle */
  if (
    layer.dataSources
    && layer.dataSources.length > 0
    /* eslint-disable-next-line no-underscore-dangle */
    && layer.dataSources[0].loadState_
    /* eslint-disable-next-line no-underscore-dangle */
    && layer.dataSources[0].loadState_.dataSource
  ) {
    /* eslint-disable-next-line no-underscore-dangle */
    return layer.dataSources[0].loadState_.dataSource;
  }
  /* eslint-disable-consistent-return */
}

function getAnnotationSourceFromLayer(layer) {
  const dataSource = getLoadedDataSource(layer);
  if (dataSource) {
    return dataSource.subsources[0].subsource.annotation;
  }
}

function configureAnnotationSourceChange(
  annotationLayer,
  props,
  recordRemover,
) {
  const configure = () => {
    const source = getAnnotationSourceFromLayer(annotationLayer);
    if (source) {
      configureAnnotationSource(source, props, recordRemover);
    }
  };

  const sourceChanged = annotationLayer.dataSourcesChanged;
  if (sourceChanged && !sourceChanged.signalReady) {
    recordRemover(sourceChanged.add(configure));
    sourceChanged.signalReady = true;
    recordRemover(() => {
      sourceChanged.signalReady = false;
    });
    configure();
  }
}

export function configureAnnotationLayer(layer, props, recordRemover) {
  if (layer) {
    // eslint-disable-next-line no-param-reassign
    layer.expectingExternalTable = true;
    if (
      layer.selectedAnnotation
      && !layer.selectedAnnotation.changed.signalReady
    ) {
      if (props.onAnnotationSelectionChanged) {
        recordRemover(
          layer.selectedAnnotation.changed.add(() => {
            props.onAnnotationSelectionChanged(layer.selectedAnnotation.value);
          }),
        );
        recordRemover(() => {
          // eslint-disable-next-line no-param-reassign
          layer.selectedAnnotation.changed.signalReady = false;
        });
        // eslint-disable-next-line no-param-reassign
        layer.selectedAnnotation.changed.signalReady = true;
      }
    }
    configureAnnotationSourceChange(layer, props, recordRemover);
  }
}

export function configureAnnotationLayerChanged(layer, props, recordRemover) {
  if (!layer.layerChanged.signalReady) {
    const remover = layer.layerChanged.add(() => {
      configureAnnotationLayer(layer.layer, props, recordRemover);
    });
    // eslint-disable-next-line no-param-reassign
    layer.layerChanged.signalReady = true;
    recordRemover(remover);
    recordRemover(() => {
      // eslint-disable-next-line no-param-reassign
      layer.layerChanged.signalReady = false;
    });

    configureAnnotationLayer(layer.layer, props, recordRemover);
  }
}

export function getAnnotationSelectionHost(key) {
  const viewer = key ? viewersKeyed[key] : viewerNoKey;
  if (viewer) {
    if (viewer.selectionDetailsState) {
      return 'viewer';
    }
    return 'layer';
  }

  return null;
}

export function getSelectedAnnotationId(key, layerName) {
  const viewer = key ? viewersKeyed[key] : viewerNoKey;
  if (viewer) {
    if (viewer.selectionDetailsState) {
      // New neurolgancer version
      // v.selectionDetailsState.value.layers[0].layer.managedLayer.name
      if (viewer.selectionDetailsState.value) {
        const { layers } = viewer.selectionDetailsState.value;
        if (layers) {
          const layer = layers.find(
            _layer => _layer.layer.managedLayer.name === layerName,
          );
          if (layer && layer.state) {
            return layer.state.annotationId;
          }
        }
      }
    } else {
      const layer = getAnnotationLayer(undefined, layerName);
      if (layer && layer.selectedAnnotation && layer.selectedAnnotation.value) {
        return layer.selectedAnnotation.value.id;
      }
    }
  }

  return null;
}

/** @extends {React.Component<NgProps>} */
export default class Neuroglancer extends React.Component {
  static defaultProps = {
    perspectiveZoom: 20,
    eventBindingsToUpdate: null,
    brainMapsClientId: 'NOT_A_VALID_ID',
    viewerState: null,
    onSelectedChanged: null,
    onVisibleChanged: null,
    onSelectionDetailsStateChanged: null,
    onViewerStateChanged: null,
    key: null,
    callbacks: [],
    ngServer: 'https://neuroglancer-demo.appspot.com/',
  };

  constructor(props) {
    super(props);
    this.ngContainer = React.createRef();
    this.viewer = null;
    /* ** Vitessce Integration update start ** */
    this.muteViewerChanged = false;
    this.prevVisibleIds = new Set();
    this.prevColorMap = null;
    this.disposers = [];
    this.prevColorOverrides = new Set();
    this.overrideColorsById = Object.create(null);
    this.allKnownIds = new Set();
  }

  minimalPoseSnapshot = () => {
    const v = this.viewer;
    const projScale = v.projectionScale?.value;
    const projQuat = v.projectionOrientation?.orientation;
    return {
      position: Array.from(v.position.value || []),
      projectionScale: projScale,
      projectionOrientation: Array.from(projQuat || []),
    };
  };

  // Coalesce many NG changes → one upstream update per frame.
  scheduleEmit = () => {
    let raf = null;
    return () => {
      if (this.muteViewerChanged) return; // muted when we push changes
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        // console.log('Minimal', this.minimalPoseSnapshot())
        this.props.onViewerStateChanged?.(this.minimalPoseSnapshot());
      });
    };
  };

  // Guard to mute outgoing emits we are programmatically making changes
  withoutEmitting = (fn) => {
    this.muteViewerChanged = true;
    try { fn(); } finally {
      requestAnimationFrame(() => { this.muteViewerChanged = false; });
    }
  };

  // Only consider actual changes in camera settings, i.e., position/rotation/zoom
  didLayersChange = (prevVS, nextVS) => {
    const stripColors = layers => (layers || []).map((l) => {
      if (!l) return l;
      const { segmentColors, ...rest } = l;
      return rest;
    });
    const prevLayers = stripColors(prevVS?.layers);
    const nextLayers = stripColors(nextVS?.layers);
    return JSON.stringify(prevLayers) !== JSON.stringify(nextLayers);
  };

  /* To add colors to the segments, turning unselected to grey  */
  applyColorsAndVisibility = (cellColorMapping) => {
    if (!this.viewer) return;
    // Track all ids we've ever seen so we can grey the ones
    // that drop out of the current selection.
    const selected = { ...(cellColorMapping || {}) }; // clone, don't mutate props
    for (const id of Object.keys(selected)) this.allKnownIds.add(id);
    // If empty on first call, seed from initial segmentColors (if present)
    if (this.allKnownIds.size === 0) {
      const init = this.props.viewerState?.layers?.[0]?.segmentColors || {};
      for (const id of Object.keys(init)) this.allKnownIds.add(id);
    }

    // Build a full color table: selected keep their hex, others grey
    const fullSegmentColors = {};
    for (const id of this.allKnownIds) {
      fullSegmentColors[id] = selected[id] || GREY_HEX;
    }
    // Patch layers with the new segmentColors (pose untouched)
    const baseLayers = (this.props.viewerState?.layers)
      ?? (this.viewer.state.toJSON().layers || []);

    const newLayers = baseLayers.map((layer, idx) => {
      // if only one layer, take that or check layer.type === 'segmentation'.
      if (idx === 0 || layer?.type === 'segmentation') {
        return { ...layer, segmentColors: fullSegmentColors };
      }
      return layer;
    });
    this.withoutEmitting(() => {
      this.viewer.state.restoreState({ layers: newLayers });
    });
    /* ** Vitessce integration update end ** */
  };

  componentDidMount() {
    const {
      viewerState,
      brainMapsClientId,
      eventBindingsToUpdate,
      callbacks,
      // ngServer,
      key,
      bundleRoot,
    } = this.props;
    this.viewer = setupDefaultViewer({
      brainMapsClientId,
      target: this.ngContainer.current,
      bundleRoot,
    });

    this.setCallbacks(callbacks);

    if (eventBindingsToUpdate) {
      this.updateEventBindings(eventBindingsToUpdate);
    }

    this.viewer.expectingExternalUI = true;
    // if (ngServer) {
    //   this.viewer.makeUrlFromState = (state) => {
    //     const newState = { ...state };
    //     if (state.layers) {
    //       // Do not include clio annotation layers
    //       newState.layers = state.layers.filter((layer) => {
    //         if (layer.source) {
    //           const sourceUrl = layer.source.url || layer.source;
    //           if (typeof sourceUrl === 'string') {
    //             return !sourceUrl.startsWith('clio://');
    //           }
    //         }
    //         return true;
    //       });
    //     }
    //     return `${ngServer}/#!${encodeFragment(JSON.stringify(newState))}`;
    //   };
    // }
    if (this.viewer.selectionDetailsState) {
      this.viewer.selectionDetailsState.changed.add(
        this.selectionDetailsStateChanged,
      );
    }
    this.viewer.layerManager.layersChanged.add(this.layersChanged);

    /* ** Vitessce Integration update start ** */
    const emit = this.scheduleEmit();
    // Disposers to unsubscribe handles for NG signals to prevent leaks/duplicates.
    this.disposers.push(this.viewer.projectionScale.changed.add(emit));
    this.disposers.push(this.viewer.projectionOrientation.changed.add(emit));
    this.disposers.push(this.viewer.position.changed.add(emit));

    // Initial restore ONLY if provided
    if (viewerState) {
      // restore state only when all the changes are added -
      // avoids calling .changed() for each change and leads to smooth updates
      this.withoutEmitting(() => {
        this.viewer.state.restoreState(viewerState);
      });
    }
    /* ** Vitessce Integration update end ** */

    // if (viewerState) {
    //   const newViewerState = viewerState;
    //   if (newViewerState.projectionScale === null) {
    //     delete newViewerState.projectionScale;
    //   }
    //   if (newViewerState.crossSectionScale === null) {
    //     delete newViewerState.crossSectionScale;
    //   }
    //   if (newViewerState.projectionOrientation === null) {
    //     delete newViewerState.projectionOrientation;
    //   }
    //   if (newViewerState.crossSectionOrientation === null) {
    //     delete newViewerState.crossSectionOrientation;
    //   }
    //   this.viewer.state.restoreState(newViewerState);
    // } else {
    //   this.viewer.state.restoreState({
    //     layers: {
    //       grayscale: {
    //         type: "image",
    //         source:
    //           "dvid://https://flyem.dvid.io/ab6e610d4fe140aba0e030645a1d7229/grayscalejpeg"
    //       },
    //       segmentation: {
    //         type: "segmentation",
    //         source:
    //           "dvid://https://flyem.dvid.io/d925633ed0974da78e2bb5cf38d01f4d/segmentation"
    //       }
    //     },
    //     perspectiveZoom,
    //     navigation: {
    //       zoomFactor: 8
    //     }
    //   });
    // }
    // Make the Neuroglancer viewer accessible from getNeuroglancerViewerState().
    // That function can be used to synchronize an external Redux store with any
    // state changes made internally by the viewer.
    if (key) {
      viewersKeyed[key] = this.viewer;
    } else {
      viewerNoKey = this.viewer;
    }

    // TODO: This is purely for debugging and we need to remove it.
    // window.viewer = this.viewer;
  }

  componentDidUpdate(prevProps, prevState) {
    const { viewerState, cellColorMapping } = this.props;
    // The restoreState() call clears the 'selected' (hovered on) segment, which is needed
    // by Neuroglancer's code to toggle segment visibilty on a mouse click.  To free the user
    // from having to move the mouse before clicking, save the selected segment and restore
    // it after restoreState().
    const selectedSegments = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const layer of this.viewer.layerManager.managedLayers) {
      if (layer.layer instanceof SegmentationUserLayer) {
        const { segmentSelectionState } = layer.layer.displayState;
        selectedSegments[layer.name] = segmentSelectionState.selectedSegment;
      }
    }
    // if (viewerState) {
    //   let newViewerState = { ...viewerState };
    //   let restoreStates = [
    //     () => {
    //       this.viewer.state.restoreState(newViewerState);
    //     },
    //   ];
    //   if (viewerState.projectionScale === null) {
    //     delete newViewerState.projectionScale;
    //     restoreStates.push(() => {
    //       this.viewer.projectionScale.reset();
    //     });
    //   }
    //   if (viewerState.crossSectionScale === null) {
    //     delete newViewerState.crossSectionScale;
    //   }
    //   restoreStates.forEach((restore) => restore());
    // }

    // eslint-disable-next-line no-restricted-syntax
    for (const layer of this.viewer.layerManager.managedLayers) {
      if (layer.layer instanceof SegmentationUserLayer) {
        const { segmentSelectionState } = layer.layer.displayState;
        segmentSelectionState.set(selectedSegments[layer.name]);
      }
    }

    // For some reason setting position to an empty array doesn't reset
    // the position in the viewer. This should handle those cases by looking
    // for the empty position array and calling the position reset function if
    // found.
    // if ('position' in viewerState) {
    //   if (Array.isArray(viewerState.position)) {
    //     if (viewerState.position.length === 0) {
    //       this.viewer.position.reset();
    //     }
    //   }
    // }


    /* ** Vitessce Integration update start ** */
    if (!viewerState) return;
    // updates NG's viewerstate by calling `restoreState() for segment and position changes separately
    const prevVS = prevProps.viewerState;
    const camState = diffCameraState(prevVS, viewerState);
    // Restore pose ONLY if it actually changed
    if (camState.changed) {
      const patch = {};
      if (camState.scale) {
        patch.projectionScale = viewerState.projectionScale;
        // Couple position with zoom even if it didn’t cross the hard epsilon
        if (Array.isArray(viewerState.position)) patch.position = viewerState.position;
      } else if (camState.pos) {
        patch.position = viewerState.position;
      }
      if (camState.rot) patch.projectionOrientation = viewerState.projectionOrientation;

      // Restore the state with updated camera setting/position changes
      this.withoutEmitting(() => this.viewer.state.restoreState(patch));
    }
    // If layers changed (segment list / sources etc.): restore ONLY layers, then colors
    if (this.didLayersChange(prevVS, viewerState)) {
      this.withoutEmitting(() => {
        const layers = Array.isArray(viewerState.layers) ? viewerState.layers : [];
        this.viewer.state.restoreState({ layers });
        if (cellColorMapping && Object.keys(cellColorMapping).length) {
          this.applyColorsAndVisibility(cellColorMapping);
        }
      });
    }

    // If colors changed (but layers didn’t): re-apply colors
    // this was to avid NG randomly assigning colors to the segments by resetting them
    const prevSize = prevProps.cellColorMapping
      ? Object.keys(prevProps.cellColorMapping).length : 0;
    const currSize = cellColorMapping ? Object.keys(cellColorMapping).length : 0;
    const mappingRefChanged = prevProps.cellColorMapping !== cellColorMapping;
    if (!this.didLayersChange(prevVS, viewerState)
      && (mappingRefChanged || prevSize !== currSize)) {
      this.withoutEmitting(() => {
        this.applyColorsAndVisibility(cellColorMapping);
      });
    }

    // Treat "real" layer source/type changes differently from segment list changes.
    // We only restore layers (not pose) when sources change OR on the first time segments appear.
    const stripSegFields = layers => (layers || []).map((l) => {
      if (!l) return l;
      const { segments, segmentColors, ...rest } = l;
      return rest; // ignore segments + segmentColors for comparison
    });

    const prevLayers = prevProps.viewerState?.layers;
    const nextLayers = viewerState?.layers;

    const prevCore = JSON.stringify(stripSegFields(prevLayers));
    const nextCore = JSON.stringify(stripSegFields(nextLayers));
    const sourcesChanged = prevCore !== nextCore; // real structural change?

    const prevSegCount = (prevLayers && prevLayers[0] && Array.isArray(prevLayers[0].segments))
      ? prevLayers[0].segments.length : 0;
    const nextSegCount = (nextLayers && nextLayers[0] && Array.isArray(nextLayers[0].segments))
      ? nextLayers[0].segments.length : 0;

    // first-time seeding – from 0 segments → N segments
    const initialSegmentsAdded = prevSegCount === 0 && nextSegCount > 0;

    if (sourcesChanged || initialSegmentsAdded) {
      this.withoutEmitting(() => {
        // restore only the layers to avoid clobbering pose/rotation/zoom.
        this.viewer.state.restoreState({ layers: nextLayers });
      });
    }
    /* ** Vitessce Integration update end ** */
  }

  componentWillUnmount() {
    /* eslint-disable no-empty */
    this.disposers.forEach((off) => { try { off(); } catch {} });
    this.disposers = [];
    const { key } = this.props;
    if (key) {
      delete viewersKeyed[key];
    } else {
      viewerNoKey = undefined;
    }
  }

  /* setCallbacks allows us to set a callback on a neuroglancer event
   * each callback created should be in the format:
   * [
   *   {
   *     name: 'unique-name',
   *     event: 'the neuroglancer event to target, eg: click0, keyt',
   *     function: (slice) => { slice.whatever }
   *   },
   *   {...}
   * ]
   *
   */
  setCallbacks(callbacks) {
    callbacks.forEach((callback) => {
      this.viewer.bindCallback(callback.name, callback.function);
      this.viewer.inputEventBindings.sliceView.set(
        callback.event,
        callback.name,
      );
    });
  }

  updateEventBindings = (eventBindingsToUpdate) => {
    const root = this.viewer.inputEventBindings;

    const traverse = (current) => {
      const replace = (eaMap, event0, event1) => {
        const action = eaMap.get(event0);
        if (action) {
          eaMap.delete(event0);
          if (event1) {
            eaMap.set(event1, action);
          }
        }
      };

      const eventActionMap = current.bindings;
      eventBindingsToUpdate.forEach((oldNewBinding) => {
        const eventOldBase = Array.isArray(oldNewBinding)
          ? oldNewBinding[0]
          : oldNewBinding;

        const eventOldA = `at:${eventOldBase}`;
        const eventNewA = oldNewBinding[1]
          ? `at:${oldNewBinding[1]}`
          : undefined;
        replace(eventActionMap, eventOldA, eventNewA);

        const eventOldB = `bubble:${eventOldBase}`;
        const eventNewB = oldNewBinding[1]
          ? `bubble:${oldNewBinding[1]}`
          : undefined;
        replace(eventActionMap, eventOldB, eventNewB);
      });

      current.parents.forEach((parent) => {
        traverse(parent);
      });
    };

    traverse(root.global);
    traverse(root.perspectiveView);
    traverse(root.sliceView);
  };

  selectionDetailsStateChanged = () => {
    if (this.viewer) {
      const { onSelectionDetailsStateChanged } = this.props;
      if (onSelectionDetailsStateChanged) {
        onSelectionDetailsStateChanged();
      }
    }
  };

  layersChanged = () => {
    if (this.handlerRemovers) {
      // If change handlers have been added already, call the function to remove each one,
      // so there won't be duplicates when new handlers are added below.
      this.handlerRemovers.forEach(remover => remover());
    }

    if (this.viewer) {
      const { onSelectedChanged, onVisibleChanged } = this.props;
      if (onSelectedChanged || onVisibleChanged) {
        this.handlerRemovers = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const layer of this.viewer.layerManager.managedLayers) {
          if (layer.layer instanceof SegmentationUserLayer) {
            const { segmentSelectionState } = layer.layer.displayState;
            const { visibleSegments } = layer.layer.displayState.segmentationGroupState.value;
            if (segmentSelectionState && onSelectedChanged) {
              // Bind the layer so it will be an argument to the handler when called.
              const selectedChanged = this.selectedChanged.bind(
                undefined,
                layer,
              );
              const remover = segmentSelectionState.changed.add(selectedChanged);
              this.handlerRemovers.push(remover);
              layer.registerDisposer(remover);
            }

            if (visibleSegments && onVisibleChanged) {
              const visibleChanged = this.visibleChanged.bind(undefined, layer);
              const remover = visibleSegments.changed.add(visibleChanged);
              this.handlerRemovers.push(remover);
              layer.registerDisposer(remover);
            }
          }
        }
      }
    }
  };

  /* ** Vitessce Integration update start ** */
  selectedChanged = (layer) => {
    if (!this.viewer) return;
    const { onSelectedChanged } = this.props;
    if (onSelectedChanged) {
      const { segmentSelectionState } = layer.layer.displayState;
      if (!segmentSelectionState) return;
      const selected = segmentSelectionState.selectedSegment;
      if (selected) {
        onSelectedChanged(selected, layer);
      }
    }
  };

  visibleChanged = (layer) => {
    if (this.viewer) {
      const { onVisibleChanged } = this.props;
      if (onVisibleChanged) {
        const { visibleSegments } = layer.layer.displayState.segmentationGroupState.value;
        if (visibleSegments) {
          onVisibleChanged(visibleSegments, layer);
        }
      }
    }
  };

  render() {
    const { perspectiveZoom } = this.props;
    return (
      <div className="neuroglancer-container" ref={this.ngContainer}>
        <p>Neuroglancer here with zoom {perspectiveZoom}</p>
      </div>
    );
  }
}
