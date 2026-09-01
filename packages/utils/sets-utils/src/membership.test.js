import { describe, it, expect } from 'vitest';
import { MISSING_VALUE_PLACEHOLDER } from '@vitessce/utils';
import { cloneDeep } from 'lodash-es';
import { buildMembershipCsr } from '@vitessce/workers';
import { treeToLeafSets, treeToMembershipMap } from './cell-set-utils.js';
import { lazyTreeToMembershipMap, membershipFromCodes } from './membership.js';
import { codesToCellSetsTree } from './CellSetsZarrLoader.js';
import { tree } from './cell-set-utils.test.fixtures.js';

const PERICYTES = ['Cell Type Annotations', 'Vasculature', 'Pericytes'];

// Decode a CSR encoding the way the membership store's lookup does.
function decode(csr, leafSets, obsIndex, obsId) {
  const obsI = obsIndex.indexOf(obsId);
  if (obsI === -1) return undefined;
  const start = csr.offsets[obsI];
  const end = csr.offsets[obsI + 1];
  if (start === end) return undefined;
  return Array.from(csr.setIds.slice(start, end)).map(id => leafSets[id].path);
}

describe('obs set membership store', () => {
  const obsIndex = ['cell_1', 'cell_2', 'cell_3', 'cell_4', 'cell_5', 'cell_6', 'cell_7'];

  it('the worker encoding decodes to the same answer as the main-thread map', () => {
    // This is the composition the worker path performs: pack the leaf sets, build
    // the CSR off-thread, then resolve set IDs back to paths on lookup.
    const leafSets = treeToLeafSets(tree);
    const setSizes = new Uint32Array(leafSets.length);
    const setObsIds = [];
    leafSets.forEach(({ set }, i) => {
      setSizes[i] = set.length;
      set.forEach(([obsId]) => setObsIds.push(obsId));
    });
    const csr = buildMembershipCsr(obsIndex, setObsIds, setSizes);
    const expected = treeToMembershipMap(tree);
    obsIndex.forEach((obsId) => {
      expect(decode(csr, leafSets, obsIndex, obsId)).toEqual(expected.get(obsId));
    });
    // Every membership was representable, which is what lets the store accept it.
    expect(csr.setIds.length).toEqual(setObsIds.length);
  });

  it('answers correctly before any worker result arrives', () => {
    // Worker construction is unavailable under jsdom, so this exercises the
    // synchronous fallback that also covers browsers without worker support.
    const membership = lazyTreeToMembershipMap(tree, obsIndex);
    const expected = treeToMembershipMap(tree);
    obsIndex.forEach((obsId) => {
      expect(membership.get(obsId)).toEqual(expected.get(obsId));
    });
    expect(membership.size).toEqual(expected.size);
    expect(membership.has('cell_1')).toEqual(true);
    expect(membership.has('not_a_cell')).toEqual(false);
    expect(membership.get('not_a_cell')).toEqual(undefined);
  });

  it('does no work until first lookup', () => {
    // Traversal has to read `tree`, so an untouched getter proves the map was never
    // built. The value is stable because the traversal reads it more than once.
    const treeValue = cloneDeep(tree).tree;
    let reads = 0;
    const spyTree = {
      version: '0.1.3',
      datatype: 'cell',
      get tree() {
        reads += 1;
        return treeValue;
      },
    };
    const membership = lazyTreeToMembershipMap(spyTree);
    expect(reads).toEqual(0);
    expect(membership.get('cell_1')).toEqual([PERICYTES]);
    expect(reads).toBeGreaterThan(0);
  });

  it('builds once and shares across instances', () => {
    const treeValue = cloneDeep(tree).tree;
    let reads = 0;
    const spyTree = {
      version: '0.1.3',
      datatype: 'cell',
      get tree() {
        reads += 1;
        return treeValue;
      },
    };
    const first = lazyTreeToMembershipMap(spyTree);
    const second = lazyTreeToMembershipMap(spyTree);
    first.get('cell_1');
    const readsAfterFirstBuild = reads;
    first.get('cell_2');
    // Memoized on the tree, so a second store over the same tree — a repeated
    // loader invocation, or another view — reuses the built map.
    second.get('cell_3');
    expect(second.size).toEqual(first.size);
    expect(reads).toEqual(readsAfterFirstBuild);
  });

  it('tolerates an absent tree and an absent obsIndex', () => {
    expect(lazyTreeToMembershipMap(null, obsIndex).get('cell_1')).toEqual(undefined);
    expect(lazyTreeToMembershipMap(null, obsIndex).size).toEqual(0);
    expect(lazyTreeToMembershipMap(null, obsIndex).has('cell_1')).toEqual(false);
    // Without an obsIndex there is nothing to align to, so it stays on the
    // main-thread path.
    expect(lazyTreeToMembershipMap(tree).get('cell_1')).toEqual([PERICYTES]);
  });
});

describe('membershipFromCodes', () => {
  const obsIndex = ['cell_1', 'cell_2', 'cell_3', 'cell_4'];
  const columns = [
    { name: 'Cell Type', codes: Int8Array.from([0, 1, -1, 0]), categories: ['T cell', 'B cell'] },
    { name: 'Leiden', codes: Int8Array.from([1, 1, 0, -1]), categories: ['0', '1'] },
  ];

  it('matches the tree-based membership map, including missing codes', () => {
    const options = [{ name: 'Cell Type' }, { name: 'Leiden' }];
    const codesTree = codesToCellSetsTree({ obsIndex, columns }, options);
    const expected = treeToMembershipMap(codesTree);
    const membership = membershipFromCodes(obsIndex, columns);
    obsIndex.forEach((obsId) => {
      expect(membership.get(obsId)).toEqual(expected.get(obsId));
      expect(membership.has(obsId)).toEqual(true);
    });
    expect(membership.size).toEqual(expected.size);
    // A missing code reports the placeholder-named set, as the tree does.
    expect(membership.get('cell_3')).toEqual([['Cell Type', MISSING_VALUE_PLACEHOLDER], ['Leiden', '0']]);
    expect(membership.get('not_a_cell')).toEqual(undefined);
    expect(membership.has('not_a_cell')).toEqual(false);
  });

  it('reports zero size with no columns', () => {
    expect(membershipFromCodes(obsIndex, []).size).toEqual(0);
  });
});
