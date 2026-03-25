/* eslint-disable react-refresh/only-export-components */
import React, { PureComponent, Suspense } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { NeuroglancerGlobalStyles } from './styles.js';

const LazyReactNeuroglancer = React.lazy(() => import('./ReactNeuroglancer.js'));

const DRAG_THRESHOLD = 4;

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
    this.mouseDownHandler = null;
    this.mouseMoveHandler = null;
    this.isDragging = false;
    this.mouseStartX = 0;
    this.mouseStartY = 0;
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

      // Compare mousedown vs mouseup position to detect drag
      // Avoids relying on mousemove which can fire spuriously in Neuroglancer
      this.mouseStartX = 0;
      this.mouseStartY = 0;
      this.mouseDownHandler = (e) => {
        this.mouseStartX = e.clientX;
        this.mouseStartY = e.clientY;
      };

      this.prevClickHandler = (event) => {
        if (event.button === 0) {
          const dx = event.clientX - this.mouseStartX;
          const dy = event.clientY - this.mouseStartY;
          // To differentiate between between drag (for rotation) and click
          const wasDrag = Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD;

          if (!wasDrag) {
            requestAnimationFrame(() => {
              const { pickedValue, pickedRenderLayer } = viewer.mouseState;
              // Only trigger selection when a segment is clicked rather than any click on the view
              if (pickedValue && pickedValue.low !== undefined && pickedRenderLayer) {
                this.latestOnSegmentClick?.(pickedValue.low);
              }
            });
          }
        }
      };
      this.prevHoverHandler = () => {
        if (viewer.mouseState.pickedValue !== undefined) {
          const pickedSegment = viewer.mouseState.pickedValue;
          this.latestOnSelectHoveredCoords?.(pickedSegment?.low);
        }
      };

      viewer.element.addEventListener('mousedown', this.mouseDownHandler, { capture: true });
      viewer.element.addEventListener('mouseup', this.prevClickHandler, { capture: true });
      viewer.mouseState.changed.add(this.prevHoverHandler);
    } else {
      // Unmount (viewerRef is null)
      if (this.prevElement) {
        this.prevElement.removeEventListener('mouseup', this.prevClickHandler, { capture: true });
        this.prevElement.removeEventListener('mousedown', this.mouseDownHandler, { capture: true });
        this.prevClickHandler = null;
        this.mouseDownHandler = null;
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
    const { classes, viewerState, cellColorMapping } = this.props;

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
            />
          </Suspense>
        </div>
      </>
    );
  }
}
