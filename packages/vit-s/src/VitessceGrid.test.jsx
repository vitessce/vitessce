import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import React from 'react';
import { PluginViewType } from '@vitessce/plugins';
import VitessceGrid from './VitessceGrid.js';
import {
  ViewConfigProvider, createViewConfigStore,
  AuxiliaryProvider, createAuxiliaryStore,
} from './state/hooks.js';

afterEach(() => {
  cleanup();
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

      function createViewConfigStoreClosure() {
        return createViewConfigStore(null, config);
      }

      function FakeComponent() {
        return <p>FakeComponent!</p>;
      }
      const viewTypes = [new PluginViewType('FakeComponent', FakeComponent, [])];
      const fileTypes = [];
      const coordinationTypes = [];
      render(
        <ViewConfigProvider createStore={createViewConfigStoreClosure}>
          <AuxiliaryProvider createStore={createAuxiliaryStore}>
            <VitessceGrid
              success
              configKey={null}
              config={config}
              viewTypes={viewTypes}
              fileTypes={fileTypes}
              coordinationTypes={coordinationTypes}
            />
          </AuxiliaryProvider>
        </ViewConfigProvider>,
      );
      expect(await screen.findByText('FakeComponent!'));
    });
  });
});
