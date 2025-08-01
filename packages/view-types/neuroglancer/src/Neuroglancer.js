/* eslint-disable react-refresh/only-export-components */
import React, { PureComponent, Suspense } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { NeuroglancerGlobalStyles } from './styles.js';
import { compareViewerState } from './utils.js';
import Neuroglancer from './JaneReactNeuroglancer.js';


// const LazyReactNeuroglancer = React.lazy(() => import('./JaneReactNeuroglancer.js'));

function createWorker() {
  return new ChunkWorker();
}

export class NeuroglancerComp extends PureComponent {
  constructor(props) {
    super(props);
    console.log("NG Middle component", Object.keys(props.cellColorMapping).length);
    this.bundleRoot = createWorker();
    this.cellColorMapping = props.cellColorMapping;
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
      console.log("ref")

      // viewer.state.changed.add(() => {
      //      console.log("onViewerStateChanged")
      //     const { setViewerState } = this.props;
      //     const { viewerState: prevState } = this.viewerState;
      //     if (!compareViewerState(prevState, viewer.state)) {
      //       console.log("updated")
      //       this.viewerState = viewer.state;
      //       this.justReceivedExternalUpdate = false;
      //       setViewerState(viewer.state);
      //     }
      // })
      this.prevElement = viewer.element;
      this.prevMouseStateChanged = viewer.mouseState.changed;
      // this.prevClickHandler = (event) => {
      //   if (event.button === 0) {
      //     setTimeout(() => {
      //       const { pickedValue } = viewer.mouseState;
      //       if (pickedValue && pickedValue?.low) {
      //         onSegmentClick(pickedValue?.low);
      //       }
      //     }, 100);
      //   }
      // };
      // viewer.element.addEventListener('mousedown', this.prevClickHandler);

      // this.prevHoverHandler = () => {
      //   if (viewer.mouseState.pickedValue !== undefined) {
      //     const pickedSegment = viewer.mouseState.pickedValue;
      //     onSelectHoveredCoords(pickedSegment?.low);
      //   }
      // };

    //   viewer.mouseState.changed.add(this.prevHoverHandler);
    // } else {
    //   // Unmount (viewerRef is null)
    //   if (this.prevElement && this.prevClickHandler) {
    //     this.prevElement.removeEventListener('mousedown', this.prevClickHandler);
    //   }
    //   if (this.prevMouseStateChanged && this.prevHoverHandler) {
    //     this.prevMouseStateChanged.remove(this.prevHoverHandler);
    //   }
    }
  }

  onViewerStateChanged(nextState) {
    console.log("onViewerStateChanged", this.props)
    const { setViewerState } = this.props;
    const { viewerState: prevState } = this;
    if (!this.justReceivedExternalUpdate && !compareViewerState(prevState, nextState)) {
      console.log("updated")
      this.viewerState = nextState;
      this.justReceivedExternalUpdate = false;
      setViewerState(nextState);
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (!compareViewerState(this.viewerState, nextProps.viewerState)) {
      this.viewerState = nextProps.viewerState;
      this.justReceivedExternalUpdate = true;
      setTimeout(() => {
        this.justReceivedExternalUpdate = false;
      }, 100);
    }
  }

  render() {
    // console.log("rendered", this.props, this.cellColorMapping)
    const { classes, viewerState, cellColorMapping, onMinimalPoseChanged, onSegmentClick } = this.props; 

    return (
      <>
        <NeuroglancerGlobalStyles classes={classes} />
        <div className={classes.neuroglancerWrapper}>
          <Suspense fallback={<div>Loading...</div>}>
            {/* <LazyReactNeuroglancer */}
            <Neuroglancer
              brainMapsClientId="NOT_A_VALID_ID"
              viewerState={viewerState}
              onViewerStateChanged={this.onViewerStateChanged}
              onSelectedChanged={onSegmentClick}
              // onMinimalPoseChanged={this.onViewerStateChanged}
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
