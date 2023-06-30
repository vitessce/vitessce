import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import React from 'react';
import { PluginViewType } from '@vitessce/plugins';
import { VitessceGridLayout } from './VitessceGridLayout.js';

afterEach(() => {
  cleanup();
});

function FakeComponent(props) {
  const { text } = props;
  return <span>{text}</span>;
}
const layoutJson = {
  columns: {
    600: [0, 2, 4, 8],
  },
  components: [
    {
      component: 'FakeComponent',
      uid: 'fake',
      props: { text: 'Hello World' },
      x: 0,
      y: 0,
      w: 2,
    },
  ],
};

describe('VitessceGridLayout.js', () => {
  describe('<VitessceGridLayout />', () => {
    it('mount() works', async () => {
      const viewTypes = [new PluginViewType('FakeComponent', FakeComponent, [])];
      const { container } = render(<VitessceGridLayout
        layout={layoutJson}
        viewTypes={viewTypes}
        draggableHandle=".my-handle"
      />);

      expect(await screen.findByText('Hello World'));
      expect(container.querySelectorAll('.react-grid-item span:not(.react-resizable-handle)').length).toEqual(1);

      const style = container.querySelectorAll('style');
      expect(style.length).toEqual(1);
      expect(style[0].textContent).toContain('.my-handle {');
      expect(style[0].textContent).toContain('.my-handle:active {');
    });

    it('rowHeight works', () => {
      const viewTypes = [new PluginViewType('FakeComponent', FakeComponent, [])];
      const { container } = render(<VitessceGridLayout
        layout={layoutJson}
        viewTypes={viewTypes}
        draggableHandle=".my-handle"
        rowHeight={123}
      />);

      expect(container.querySelector('.react-grid-item').style.height).toEqual('123px');
    });
  });
});
