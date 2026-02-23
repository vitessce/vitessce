/* eslint-disable react-refresh/only-export-components */
import React, { PureComponent, Suspense } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { CircularProgress } from '@vitessce/styles';
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
    this.prevElement = null;
    this.prevClickHandler = null;
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
      this.prevElement = viewer.element;
      this.prevMouseStateChanged = viewer.mouseState.changed;
      viewer.inputEventBindings.sliceView.set('at:dblclick0', () => {});
      viewer.inputEventBindings.perspectiveView.set('at:dblclick0', () => {});
      this.prevClickHandler = (event) => {
        if (event.button === 0) {
          // Wait for mouseState to update
          requestAnimationFrame(() => {
            const { pickedValue, pickedRenderLayer } = viewer.mouseState;
            // Only trigger selection when a segment is clicked rather than any click on the view
            if (pickedValue && pickedValue.low !== undefined && pickedRenderLayer) {
              this.latestOnSegmentClick?.(pickedValue.low);
            }
          });
        }
      };
      this.prevHoverHandler = () => {
        if (viewer.mouseState.pickedValue !== undefined) {
          const pickedSegment = viewer.mouseState.pickedValue;
          this.latestOnSelectHoveredCoords?.(pickedSegment?.low);
        }
      };
      viewer.element.addEventListener('mouseup', this.prevClickHandler);
      viewer.mouseState.changed.add(this.prevHoverHandler);
    } else {
      // Unmount (viewerRef is null)
      if (this.prevElement && this.prevClickHandler) {
        this.prevElement.removeEventListener('mouseup', this.prevClickHandler);
        this.prevClickHandler = null;
      }
      if (this.prevMouseStateChanged && this.prevHoverHandler) {
        this.prevMouseStateChanged.remove(this.prevHoverHandler);
        this.prevHoverHandler = null;
      }
      this.prevElement = null;
      this.prevMouseStateChanged = null;
    }
  }

  onViewerStateChanged(nextState) {
    const { setViewerState } = this.props;
    setViewerState(nextState);
  }

  componentDidUpdate(prevProps) {
    const { onSegmentClick, onSelectHoveredCoords } = this.props;
    if (prevProps.onSegmentClick !== onSegmentClick) {
      this.latestOnSegmentClick = onSegmentClick;
    }
    if (prevProps.onSelectHoveredCoords !== onSelectHoveredCoords) {
      this.latestOnSelectHoveredCoords = onSelectHoveredCoords;
    }
  }

  render() {
    const { classes, viewerState, cellColorMapping, onLayerLoadingChange } = this.props;

    return (
      <>
        <NeuroglancerGlobalStyles classes={classes} />
        <div className={classes.neuroglancerWrapper}>
          <Suspense fallback={<CircularProgress sx={{ display: 'block', margin: 'auto' }} />}>
            <LazyReactNeuroglancer
              brainMapsClientId="NOT_A_VALID_ID"
              viewerState={viewerState}
              onViewerStateChanged={this.onViewerStateChanged}
              onLayerLoadingChange={onLayerLoadingChange}
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
