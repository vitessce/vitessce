/* eslint-disable camelcase */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { z } from '@vitessce/schemas';
import { PluginViewType, PluginCoordinationType } from '@vitessce/plugins';
import {
  getExistingScopesForCoordinationType,
  initialize,
} from './view-config-utils.js';

function FakeComponent(props) {
  const { text } = props;
  return <span>{text}</span>;
}

const jointFileTypes = [];
const coordinationTypes = [
  new PluginCoordinationType('dataset', null, z.string().nullable()),
  new PluginCoordinationType('embeddingTargetX', 0, z.number()),
  new PluginCoordinationType('embeddingTargetY', 0, z.number()),
  new PluginCoordinationType('embeddingZoom', 3, z.number()),
  new PluginCoordinationType('embeddingType', null, z.string().nullable()),
];
const viewTypes = [
  new PluginViewType('description', FakeComponent, ['dataset']),
  new PluginViewType('scatterplot', FakeComponent, ['dataset', 'embeddingType', 'embeddingZoom', 'embeddingTargetX', 'embeddingTargetY']),
];

describe('src/app/view-config-utils.js', () => {
  describe('getExistingScopesForCoordinationType', () => {
    it('gets all scope names for a particular coordination type', () => {
      const config = {
        coordinationSpace: {
          dataset: {
            A: 'my-dataset-1',
            B: 'my-dataset-2',
          },
        },
        layout: [
          {
            coordinationScopes: {
              dataset: 'A',
            },
          },
          {
            coordinationScopes: {
              dataset: 'C',
            },
          },
        ],
      };
      expect(getExistingScopesForCoordinationType(config, 'dataset')).toEqual(['A', 'B', 'C']);
    });
  });

  describe('initialize', () => {
    it('initializes coordination space and component coordination scopes when initStrategy is auto', () => {
      const preInitializationConfig = {
        version: '1.0.16',
        name: 'My config name',
        description: 'My config description',
        initStrategy: 'auto',
        coordinationSpace: {
          embeddingTargetX: {
            A: 0,
          },
          embeddingTargetY: {
            A: 0,
          },
          embeddingType: {
            't-SNE': 't-SNE',
          },
        },
        datasets: [
          {
            files: [],
            name: 'A',
            uid: 'A',
          },
        ],
        layout: [
          {
            component: 'description',
            coordinationScopes: {},
            h: 2,
            w: 3,
            x: 9,
            y: 0,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingType: 't-SNE',
            },
            h: 4,
            w: 5,
            x: 0,
            y: 2,
          },
        ],
      };

      const initializedViewConfig = {
        version: '1.0.16',
        uid: 'A',
        name: 'My config name',
        description: 'My config description',
        initStrategy: 'auto',
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingTargetX: {
            A: 0,
          },
          embeddingTargetY: {
            A: 0,
          },
          embeddingType: {
            't-SNE': 't-SNE',
          },
          embeddingZoom: {
            A: 3,
          },
        },
        datasets: [
          {
            files: [],
            name: 'A',
            uid: 'A',
          },
        ],
        layout: [
          {
            component: 'description',
            coordinationScopes: {
              dataset: 'A',
            },
            h: 2,
            uid: 'A',
            w: 3,
            x: 9,
            y: 0,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingType: 't-SNE',
              embeddingZoom: 'A',
            },
            h: 4,
            uid: 'B',
            w: 5,
            x: 0,
            y: 2,
          },
        ],
      };

      expect(initialize(preInitializationConfig, jointFileTypes, coordinationTypes, viewTypes))
        .toEqual(initializedViewConfig);
    });

    it('does not initialize when initStrategy is none', () => {
      const preInitializationConfig = {
        version: '1.0.16',
        name: 'My config name',
        description: 'My config description',
        initStrategy: 'none', // initStrategy is none
        coordinationSpace: {
          embeddingTargetX: {
            A: 0,
          },
          embeddingTargetY: {
            A: 0,
          },
          embeddingType: {
            't-SNE': 't-SNE',
          },
        },
        datasets: [
          {
            files: [],
            name: 'A',
            uid: 'A',
          },
        ],
        layout: [
          {
            component: 'description',
            coordinationScopes: {},
            h: 2,
            w: 3,
            x: 9,
            y: 0,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingType: 't-SNE',
            },
            h: 4,
            w: 5,
            x: 0,
            y: 2,
          },
        ],
      };
      expect(
        initialize(
          preInitializationConfig, jointFileTypes, coordinationTypes, viewTypes,
        ).coordinationSpace,
      ).toEqual(preInitializationConfig.coordinationSpace);
    });
  });
});
