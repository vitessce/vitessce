import { describe, it, expect } from 'vitest';
import { DataType, ViewType } from './constants.js';
import {
  DATA_TYPE_COORDINATION_VALUE_USAGE,
} from './constant-relationships.js';
import { COMPONENT_COORDINATION_TYPES } from './coordination.js';

describe('src/app/constant-relationships.js', () => {
  describe('DataType-to-CoordinationType usage mapping', () => {
    it('every data type is mapped to an array of coordination types', () => {
      const dataTypes = Object.values(DataType).sort();
      const mappedDataTypes = Object.keys(DATA_TYPE_COORDINATION_VALUE_USAGE).sort();
      expect(dataTypes.length).toEqual(mappedDataTypes.length);
    });
  });
  describe('ViewType-to-CoordinationType usage mapping', () => {
    it('every view type is mapped to an array of coordination types', () => {
      const viewTypes = Object.values(ViewType).sort();
      const mappedViewTypes = Object.keys(COMPONENT_COORDINATION_TYPES).sort();
      expect(viewTypes.length).toEqual(mappedViewTypes.length);
    });
  });
});
