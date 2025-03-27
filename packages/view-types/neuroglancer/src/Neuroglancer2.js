import React, { PureComponent, Suspense } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { cloneDeep, get, isEqual, forEach, throttle, debounce, pick } from 'lodash-es';
import { useStyles, globalNeuroglancerCss } from './styles.js';

const LazyReactNeuroglancer = React.lazy(async () => {
  const ReactNeuroglancer = await import('@janelia-flyem/react-neuroglancer');
  return ReactNeuroglancer;
});

function createWorker() {
  return new ChunkWorker();
}

function isValidState(viewerState) {
  const { projectionScale, projectionOrientation, position, dimensions } = viewerState || {};
  return (dimensions !== undefined && typeof projectionScale === 'number' && Array.isArray(projectionOrientation) && projectionOrientation.length === 4 && Array.isArray(position) && position.length === 3);
}

function compareViewerState(prevState, nextState) {
  if(isValidState(nextState)) {
    const prevSubset = pick(prevState, ['projectionScale', 'projectionOrientation', 'position']);
    const nextSubset = pick(nextState, ['projectionScale', 'projectionOrientation', 'position']);
    return isEqual(prevSubset, nextSubset);
  }
  return true;
}
export class Neuroglancer extends PureComponent {
  constructor(props) {
    super(props);

    this.viewerState = props.viewerState;
    this.bundleRoot = createWorker();

    this.onViewerStateChanged = this.onViewerStateChanged.bind(this);
  }

  onViewerStateChanged(nextState) {
    const { setViewerState } = this.props;
    const { viewerState: prevState } = this;
    
    if(!compareViewerState(prevState, nextState)) {
      this.viewerState = nextState;
      setViewerState(nextState);
    }
  }

  componentDidUpdate(prevProps) {
    const shallowDiff = propName => (prevProps[propName] !== this.props[propName]);
    let forceUpdate = false;
    if (['onSegmentClick', 'onSelectHoveredCoords', 'viewerState'].some(shallowDiff)) {
      forceUpdate = true;
    }

    if (forceUpdate) {
      this.forceUpdate();
    }
  }


  render() {
    const {
      onSegmentClick,
      onSelectHoveredCoords,
      viewerState,
      classes,
    } = this.props;

    return (
      <>
        <style>{globalNeuroglancerCss}</style>
        <div className={classes.neuroglancerWrapper}>
          <Suspense fallback={<div>Loading...</div>}>
            <LazyReactNeuroglancer
              brainMapsClientId="NOT_A_VALID_ID"
              viewerState={viewerState}
              onViewerStateChanged={this.onViewerStateChanged}
              bundleRoot={this.bundleRoot}
              ref={(viewerRef) => {
                if(viewerRef) {
                  const { viewer } = viewerRef;
                  viewer.element.addEventListener('mousedown', (event) => {
                    if (event.button === 0) {
                      setTimeout(() => {
                        const { pickedValue } = viewer.mouseState;
                        if (pickedValue && pickedValue?.low) {
                          onSegmentClick(pickedValue?.low);
                        }
                      }, 100);
                    }
                  });
              
              
                  function addHover() {
                    if (viewer.mouseState.pickedValue !== undefined) {
                      const pickedSegment = viewer.mouseState.pickedValue;
                      console.log(pickedSegment)
                      onSelectHoveredCoords(pickedSegment?.low);
                    }
                  }
              
                  viewer.mouseState.changed.add(addHover);
                }
              }}
            />
          </Suspense>
        </div>
      </>
    );
  }
}
