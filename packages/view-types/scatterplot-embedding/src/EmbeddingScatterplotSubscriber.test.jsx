import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { Scatterplot } from '@vitessce/scatterplot';
import { EmbeddingScatterplotSubscriber } from './EmbeddingScatterplotSubscriber.js';

const state = vi.hoisted(() => ({
  values: {}, setters: {}, index: [], embedding: null, sets: null,
}));
vi.mock('@vitessce/vit-s', () => ({
  TitleInfo: ({ children }) => children,
  useReady: () => true,
  useUrls: () => [],
  useDeckCanvasSize: () => [0, 0, null],
  useUint8FeatureSelection: () => ({}),
  useExpressionValueGetter: () => () => 0,
  useGetObsInfo: () => () => ({}),
  useObsEmbeddingData: () => [{ obsIndex: state.index, obsEmbedding: state.embedding }, 'success', [], null],
  useObsSetsData: () => [{ obsSets: state.sets }, 'success', [], null],
  useAnnotationStoryData: () => [{}, 'success', [], null],
  useAnnotationFrameCoordination: () => {},
  useFeatureSelection: () => [null, [], 'success', []],
  useObsFeatureMatrixIndices: () => [{ obsIndex: state.index }, 'success', [], null],
  useFeatureLabelsData: () => [{}, 'success', [], null],
  useMultiObsLabels: () => [[], [], [], [], []],
  useSampleSetsData: () => [{}, 'success', [], null],
  useSampleEdgesData: () => [{}, 'success', [], null],
  useCoordination: () => [state.values, state.setters],
  useLoaders: () => ({}),
  useSetComponentHover: () => () => {},
  useSetComponentViewInfo: () => () => {},
  useInitialCoordination: () => ({ embeddingZoom: 0, embeddingTargetX: 0, embeddingTargetY: 0 }),
  useExpandedFeatureLabelsMap: () => [null, 'success'],
  useViewMapping: () => [{}, {}, {}],
}));
vi.mock('@vitessce/scatterplot', () => ({
  Scatterplot: vi.fn(() => null),
  ScatterplotTooltipSubscriber: () => null,
  ScatterplotOptions: () => null,
  getPointSizeDevicePixels: () => 1,
  getPointOpacity: () => 1,
}));
vi.mock('@vitessce/legend', () => ({ Legend: () => null }));

it('switches from feature value coloring to a lasso selection without showing the previous selection', () => {
  state.index = Array.from({ length: 1000 }, (_, i) => `cell-${i}`);
  state.embedding = {
    shape: [2, state.index.length],
    data: [
      Float32Array.from(state.index, (_, i) => i % 32),
      Float32Array.from(state.index, (_, i) => Math.floor(i / 32)),
    ],
  };
  state.sets = {
    version: '0.1.3',
    tree: [{
      name: 'Types',
      children: [{ name: 'All', set: state.index.map(id => [id, null]) }],
    }],
  };
  // Coloring by feature values, with a previous set selection still stored.
  state.values = {
    dataset: 'A',
    obsType: 'cell',
    embeddingType: 'UMAP',
    embeddingZoom: 0,
    embeddingTargetX: 0,
    embeddingTargetY: 0,
    embeddingPointsVisible: true,
    embeddingContoursVisible: false,
    obsSetSelection: [['Types', 'All']],
    additionalObsSets: null,
    obsSetColor: [{ path: ['Types', 'All'], color: [0, 0, 255] }],
    obsColorEncoding: 'geneSelection',
  };
  state.setters = Object.fromEntries([
    'AdditionalObsSets', 'ObsSetSelection', 'ObsSetColor', 'ObsColorEncoding',
  ].map(name => [`set${name}`, (value) => {
    state.values = { ...state.values, [name[0].toLowerCase() + name.slice(1)]: value };
  }]));
  const props = { uuid: 'umap', theme: 'dark' };
  const { rerender } = render(<EmbeddingScatterplotSubscriber {...props} />);
  const initialColorIndices = Scatterplot.mock.lastCall[0].obsColorIndices;
  const currentSelect = Scatterplot.mock.lastCall[0].setCellSelection;
  Scatterplot.mockClear();

  act(() => {
    // The same callback the selection layer calls after its hit test.
    currentSelect(state.index.slice(0, 600));
    rerender(<EmbeddingScatterplotSubscriber {...props} />);
  });

  const lastPlot = Scatterplot.mock.lastCall[0];
  expect(lastPlot.cellColorEncoding).toEqual('cellSetSelection');
  expect(lastPlot.obsColorIndices).not.toBe(initialColorIndices);
  // Set selection coloring is only shown together with the new colors. Showing
  // it with the previous colors would color every cell by the previous selection.
  Scatterplot.mock.calls.forEach(([plot]) => {
    if (plot.cellColorEncoding === 'cellSetSelection') {
      expect(plot.obsSetSelection).toEqual(state.values.obsSetSelection);
    }
  });
});
