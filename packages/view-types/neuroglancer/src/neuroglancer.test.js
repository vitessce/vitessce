import { render } from '@testing-library/react';
import { Neuroglancer } from './Neuroglancer';

test('<Neuroglancer /> initializes WebGL context', () => {
  const { container } = render(<Neuroglancer viewerState={{}} onViewerStateChanged={() => {}} />);

  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('webgl');
  expect(container.querySelector('.neuroglancer-container')).toBeInTheDocument();
});