import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'

import VitessceGrid from './VitessceGrid';
import {
  ViewConfigProvider, createViewConfigStore,
  AuxiliaryProvider, createAuxiliaryStore,
} from './state/hooks';

afterEach(() => {
  cleanup()
});

describe('VitessceGrid.js', () => {
  describe('<VitessceGrid />', () => {
    it('renders', async () => {
      const config = {
        version: '1.0.0',
        description: 'fake description',
        datasets: [],
        name: 'fake name',
        layout: [
          {
            component: 'FakeComponent',
            props: { description: 'fake prop description' },
            uid: 'A',
            x: 0,
            y: 0,
          },
        ],
      };

      function FakeComponent() {
        return <p>FakeComponent!</p>;
      }
      const getComponent = () => FakeComponent;
      render(
        <ViewConfigProvider createStore={createViewConfigStore}>
          <AuxiliaryProvider createStore={createAuxiliaryStore}>
            <VitessceGrid config={config} getComponent={getComponent} />
          </AuxiliaryProvider>
        </ViewConfigProvider>,
      );
      expect(await screen.findByText('FakeComponent!'));
    });
  });
});
