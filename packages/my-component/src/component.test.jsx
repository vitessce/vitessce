import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { MyComponent } from './component'

afterEach(() => {
  cleanup()
})

describe('MyComponent', async () => {
  it('should render the component', () => {
    render(
      <MyComponent
        a={1}
        b={2}
        color={'purple'}
      />,
    );
    expect(screen.getByText('1+2=4')).toBeInTheDocument();
    expect(screen.getByText('1+2=4')).toHaveStyle({ color: 'purple' });
    expect(screen.getByText('1+2=4')).not.toHaveStyle({ color: 'green' });
  });
});
