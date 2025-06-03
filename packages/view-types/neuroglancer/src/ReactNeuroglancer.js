import React from 'react';
import ReactNeuroglancer from '@janelia-flyem/react-neuroglancer';

const Component = typeof ReactNeuroglancer.default === 'function' ? ReactNeuroglancer.default : ReactNeuroglancer;

const ReactNeuroglancerWrapper = React.forwardRef((props, ref) => (
  <Component ref={ref} {...props} />
));

export default ReactNeuroglancerWrapper;
