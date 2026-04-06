/* eslint-disable react-refresh/only-export-components */
import React, { PureComponent, Suspense } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { NeuroglancerGlobalStyles } from './styles.js';

const LazyReactNeuroglancer = React.lazy(() => import('./ReactNeuroglancer.js'));

function createWorker() {
  return new ChunkWorker();
}
export class NeuroglancerComp extends PureComponent {
  constructor(props) {
    super(props);
    this.bundleRoot = createWorker();
    this.cellColorMapping = props.cellColorMapping;
    this.justReceivedExternalUpdate = false;
    this.prevMouseStateChanged = null;
    this.prevHoverHandler = null;
    this.onViewerStateChanged = this.onViewerStateChanged.bind(this);
    this.onRef = this.onRef.bind(this);
    // To avoid closure for onSegmentClick(), to update the selection
    this.latestOnSegmentClick = props.onSegmentClick;
    this.latestOnSelectHoveredCoords = props.onSelectHoveredCoords;
  }

  onRef(viewerRef) {
    // Here, we have access to the viewerRef.viewer object,
    // which we can use to add/remove event handlers.

    if (viewerRef) {
      // Mount
      const { viewer } = viewerRef;
      this.prevMouseStateChanged = viewer.mouseState.changed;
      viewer.inputEventBindings.sliceView.set('at:dblclick0', () => {});
      viewer.inputEventBindings.perspectiveView.set('at:dblclick0', () => {});

      // To disable space interaction causing 4panels layout
      viewer.inputEventBindings.sliceView.set('at:space', () => {});
      viewer.inputEventBindings.perspectiveView.set('at:space', () => {});

      this.prevHoverHandler = () => {
        if (viewer.mouseState.pickedValue !== undefined) {
          const pickedSegment = viewer.mouseState.pickedValue;
          this.latestOnSelectHoveredCoords?.(pickedSegment?.low);
        }
      };

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

  render() {
    const { classes, viewerState, cellColorMapping, fileUidToLayerScope } = this.props;

    return (
      <>
        <NeuroglancerGlobalStyles classes={classes} />
        <div className={classes.neuroglancerWrapper}>
          <Suspense fallback={<div>Loading...</div>}>
            <LazyReactNeuroglancer
              brainMapsClientId="NOT_A_VALID_ID"
              viewerState={viewerState}
              onViewerStateChanged={this.onViewerStateChanged}
              bundleRoot={this.bundleRoot}
              cellColorMapping={cellColorMapping}
              ref={this.onRef}
              fileUidToLayerScope={fileUidToLayerScope}
            />
          </Suspense>
        </div>
      </>
    );
  }
}
