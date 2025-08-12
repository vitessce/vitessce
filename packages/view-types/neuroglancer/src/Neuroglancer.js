/* eslint-disable react-refresh/only-export-components */
import React, { PureComponent, Suspense } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { NeuroglancerGlobalStyles } from './styles.js';
import { compareViewerState } from './utils.js';
import Neuroglancer from './ReactNeuroglancer.js';

function createWorker() {
  return new ChunkWorker();
}
export class NeuroglancerComp extends PureComponent {
  constructor(props) {
    super(props);
    // console.log('NG Middle component', Object.keys(props.cellColorMapping).length);
    this.bundleRoot = createWorker();
    this.cellColorMapping = props.cellColorMapping;
    this.viewerState = props.viewerState;
    this.justReceivedExternalUpdate = false;
    this.isFirstRender = false;
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
      viewer.inputEventBindings.sliceView.set('at:dblclick0', () => {});
      viewer.inputEventBindings.perspectiveView.set('at:dblclick0', () => {});

      this.prevClickHandler = (event) => {
        if (event.button === 0) {
          // Wait for mouseState to update
          // setTimeout(() => {
          requestAnimationFrame(() => {
            const { pickedValue } = viewer.mouseState;
            if (pickedValue && pickedValue.low !== undefined) {
              onSegmentClick(pickedValue.low);
            }
          });
        }
      };

      viewer.element.addEventListener('mouseup', this.prevClickHandler);
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
    // console.log(this.props)
    const { setViewerState } = this.props;
    const { viewerState: prevState } = this;
    console.log('onViewerStateChanged', nextState.projectionScale, prevState.projectionScale,!compareViewerState(prevState, nextState), !this.justReceivedExternalUpdate)
    //  Check !compareViewerState
    if (!this.justReceivedExternalUpdate && compareViewerState(prevState, nextState)) {
      // console.log("updated", this.justReceivedExternalUpdate)
      this.viewerState = nextState;
      this.justReceivedExternalUpdate = false;
      setViewerState(nextState);
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    console.log('componentWillUpdate')
    if (!compareViewerState(this.viewerState, nextProps.viewerState)) {
      console.log("!compare")
      this.viewerState = nextProps.viewerState;
      this.justReceivedExternalUpdate = true;
      setTimeout(() => {
        this.justReceivedExternalUpdate = false;
      }, 100);
    }
  }

  render() {
    console.log('rendered', this.props)
    const { classes, viewerState, cellColorMapping} = this.props; 

    return (
      <>
        <NeuroglancerGlobalStyles classes={classes} />
        <div className={classes.neuroglancerWrapper}>
          <Suspense fallback={<div>Loading...</div>}>
            {/* <LazyReactNeuroglancer */}
            <Neuroglancer
              brainMapsClientId='NOT_A_VALID_ID'
              viewerState={viewerState}
              onViewerStateChanged={this.onViewerStateChanged}
              bundleRoot={this.bundleRoot}
              cellColorMapping={cellColorMapping}
              ref={this.onRef}
            />
          </Suspense>
        </div>
      </>
    );
  }
}
