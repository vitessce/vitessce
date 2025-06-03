/* eslint-disable react-refresh/only-export-components */
import React, { PureComponent, Suspense } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { isEqualWith, pick } from 'lodash-es';
import { NeuroglancerGlobalStyles } from './styles.js';

const LazyReactNeuroglancer = React.lazy(async () => {
  const ReactNeuroglancer = await import('@janelia-flyem/react-neuroglancer');
  return ReactNeuroglancer;
});

function createWorker() {
  return new ChunkWorker();
}

/**
 * Is this a valid viewerState object?
 * @param {object} viewerState
 * @returns {boolean}
 */
function isValidState(viewerState) {
  const { projectionScale, projectionOrientation, position, dimensions } = viewerState || {};
  return (
    dimensions !== undefined
    && typeof projectionScale === 'number'
    && Array.isArray(projectionOrientation)
    && projectionOrientation.length === 4
    && Array.isArray(position)
    && position.length === 3
  );
}

// TODO: Do we want to use the same epsilon value
// for every viewstate property being compared?
const EPSILON = 1e-7;
const VIEWSTATE_KEYS = ['projectionScale', 'projectionOrientation', 'position'];

// Custom numeric comparison function
// for isEqualWith, to be able to set a custom epsilon.
function customizer(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    // Returns true if the values are equivalent, else false.
    return Math.abs(a - b) > EPSILON;
  }
  // Return undefined to fallback to the default
  // comparison function.
  return undefined;
}

/**
 * Returns true if the two states are equal, or false if not.
 * @param {object} prevState Previous viewer state.
 * @param {object} nextState Next viewer state.
 * @returns
 */
function compareViewerState(prevState, nextState) {
  if (isValidState(nextState)) {
    // Subset the viewerState objects to only the keys
    // that we want to use for comparison.
    const prevSubset = pick(prevState, VIEWSTATE_KEYS);
    const nextSubset = pick(nextState, VIEWSTATE_KEYS);
    return isEqualWith(prevSubset, nextSubset, customizer);
  }
  return true;
}

export class Neuroglancer extends PureComponent {
  constructor(props) {
    super(props);

    this.bundleRoot = createWorker();

    this.viewerState = props.viewerState;
    this.justReceivedExternalUpdate = false;

    this.prevElement = null;
    this.prevClickHandler = null;
    this.prevMouseStateChanged = null;
    this.prevHoverHandler = null;

    this.onViewerStateChanged = this.onViewerStateChanged.bind(this);
    this.onRef = this.onRef.bind(this);
  }

  onRef(viewerRef) {
    // Here, we have access to the viewerRef.viewer object,
    // which we can use to add/remove event handlers.
    const {
      onSegmentClick,
      onSelectHoveredCoords,
    } = this.props;

    if (viewerRef) {
      // Mount
      const { viewer } = viewerRef;
      this.prevElement = viewer.element;
      this.prevMouseStateChanged = viewer.mouseState.changed;
      this.prevClickHandler = (event) => {
        if (event.button === 0) {
          setTimeout(() => {
            const { pickedValue } = viewer.mouseState;
            if (pickedValue && pickedValue?.low) {
              onSegmentClick(pickedValue?.low);
            }
          }, 100);
        }
      };
      viewer.element.addEventListener('mousedown', this.prevClickHandler);

      this.prevHoverHandler = () => {
        if (viewer.mouseState.pickedValue !== undefined) {
          const pickedSegment = viewer.mouseState.pickedValue;
          onSelectHoveredCoords(pickedSegment?.low);
        }
      };

      viewer.mouseState.changed.add(this.prevHoverHandler);
    } else {
      // Unmount (viewerRef is null)
      if (this.prevElement && this.prevClickHandler) {
        this.prevElement.removeEventListener('mousedown', this.prevClickHandler);
      }
      if (this.prevMouseStateChanged && this.prevHoverHandler) {
        this.prevMouseStateChanged.remove(this.prevHoverHandler);
      }
    }
  }

  onViewerStateChanged(nextState) {
    const { setViewerState } = this.props;
    const { viewerState: prevState } = this;

    if (!this.justReceivedExternalUpdate && !compareViewerState(prevState, nextState)) {
      this.viewerState = nextState;
      this.justReceivedExternalUpdate = false;
      setViewerState(nextState);
    }
  }

  UNSAFE_componentWillUpdate(prevProps) {
    if (!compareViewerState(this.viewerState, prevProps.viewerState)) {
      this.viewerState = prevProps.viewerState;
      this.justReceivedExternalUpdate = true;
      setTimeout(() => {
        this.justReceivedExternalUpdate = false;
      }, 100);
    }
  }

  render() {
    const {
      classes,
    } = this.props;

    return (
      <>
        <NeuroglancerGlobalStyles classes={classes} />
        <div className={classes.neuroglancerWrapper}>
          <Suspense fallback={<div>Loading...</div>}>
            <LazyReactNeuroglancer
              brainMapsClientId="NOT_A_VALID_ID"
              viewerState={this.viewerState}
              onViewerStateChanged={this.onViewerStateChanged}
              bundleRoot={this.bundleRoot}
              ref={this.onRef}
            />
          </Suspense>
        </div>
      </>
    );
  }
}
