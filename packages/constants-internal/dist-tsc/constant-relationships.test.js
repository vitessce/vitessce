import { describe, it, expect } from 'vitest';
import { DataType } from './constants.js';
import { DATA_TYPE_COORDINATION_VALUE_USAGE, } from './constant-relationships.js';
describe('src/app/constant-relationships.js', () => {
    describe('DataType-to-CoordinationType usage mapping', () => {
        it('every data type is mapped to an array of coordination types', () => {
            const dataTypes = Object.values(DataType).sort();
            const mappedDataTypes = Object.keys(DATA_TYPE_COORDINATION_VALUE_USAGE).sort();
            expect(dataTypes.length).toEqual(mappedDataTypes.length);
        });
    });
});
