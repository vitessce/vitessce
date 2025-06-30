/* eslint-disable react-refresh/only-export-components */
import React, { PureComponent, Suspense } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';

import { NeuroglancerGlobalStyles } from './styles.js';

import { compareViewerState } from './utils.js';

const LazyReactNeuroglancer = React.lazy(() => import('./ReactNeuroglancer.js'));

function createWorker() {
  return new ChunkWorker();
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
    // console.log("Neuroglancer loaded", this.viewerState, this.cellSetUpdated)
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
    // console.log("onViewerStateChanged")
    const { setViewerState } = this.props;
    const { viewerState: prevState } = this;
    if (!this.justReceivedExternalUpdate && !compareViewerState(prevState, nextState)) {
      // console.log("updated")
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
