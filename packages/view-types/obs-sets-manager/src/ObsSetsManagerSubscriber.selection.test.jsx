import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { handleImportJSON, setObsSelection } from '@vitessce/sets-utils';
import { ObsSetsManagerSubscriber } from './ObsSetsManagerSubscriber.js';
import SetsManager from './SetsManager.js';

const state = vi.hoisted(() => ({ values: {}, setters: {} }));
vi.mock('@vitessce/vit-s', () => ({
  useCoordination: () => [state.values, state.setters],
  useLoaders: () => ({}),
  useSetWarning: () => () => {},
  TitleInfo: ({ children }) => children,
  useUrls: () => [],
  useReady: () => true,
  useObsSetsData: () => [{ obsIndex: [], obsSets: null }, 'success', [], null],
  useCoordinationScopes: scopes => scopes,
}));
vi.mock('./SetsManager.js', () => ({ default: vi.fn(() => null) }));

function reset() {
  state.values = { dataset: 'A',
    obsType: 'cell',
    additionalObsSets: null,
    obsSetSelection: [],
    obsSetColor: [],
    obsSetExpansion: [] };
  state.setters = Object.fromEntries([
    'AdditionalObsSets', 'ObsSetSelection', 'ObsSetColor', 'ObsSetExpansion', 'ObsColorEncoding',
  ].map(name => [`set${name}`, (value) => {
    state.values = { ...state.values, [name[0].toLowerCase() + name.slice(1)]: value };
  }]));
}

function select(ids) {
  setObsSelection(ids, state.values.additionalObsSets, state.values.obsSetColor,
    state.setters.setObsSetSelection, state.setters.setAdditionalObsSets,
    state.setters.setObsSetColor, state.setters.setObsColorEncoding);
}

describe('selection updates in the sets manager', () => {
  it('does not traverse previous selections when a new lasso selection is added', () => {
    reset();
    select(Array.from({ length: 65536 }, (_, i) => `cell-${i}`));
    const previousSet = state.values.additionalObsSets.tree[0].children[0].set;
    const firstMember = previousSet[0];
    const readMember = vi.fn(() => firstMember);
    Object.defineProperty(previousSet, '0', { get: readMember });
    const { rerender } = render(<ObsSetsManagerSubscriber coordinationScopes={{}} />);
    readMember.mockClear();

    select(['cell-1', 'cell-3']);
    rerender(<ObsSetsManagerSubscriber coordinationScopes={{}} />);

    expect(SetsManager.mock.lastCall[0].setSelection).toEqual([['My Selections', 'Selection 2']]);
    expect(SetsManager.mock.lastCall[0].additionalSets.tree[0].children[1].set)
      .toEqual([['cell-1', null], ['cell-3', null]]);
    // Only names and set sizes are needed to display the manager. Reading old
    // members here revalidates/copies the entire selection history before paint.
    expect(readMember).not.toHaveBeenCalled();
  });

  it('accepts legacy JSON through the import boundary and still rejects malformed imports', () => {
    reset();
    render(<ObsSetsManagerSubscriber coordinationScopes={{}} />);
    const imported = handleImportJSON(JSON.stringify({
      version: '0.1.2',
      tree: [{ name: 'Imported', children: [{ name: 'Group', set: ['cell-1'] }] }],
    }), 'obs');
    SetsManager.mock.lastCall[0].onImportTree(imported);
    expect(state.values.additionalObsSets.tree[0].children[0].set).toEqual([['cell-1', null]]);
    expect(() => handleImportJSON(JSON.stringify({
      version: '0.1.3',
      tree: [{ name: 'Invalid', children: [{ name: 'Group', set: [[123, null]] }] }],
    }), 'obs')).toThrow('Tree validation failed');
  });
});
