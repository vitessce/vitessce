import { convertBigInt64ArrayToInt32Array, IncorrectDataTypeError } from './utils.js';
const toArray = typedArr => Array.from(typedArr).map(Number);
describe('loaders/utils', () => {
    describe('convertBigInt64ArrayToInt32Array', () => {
        it('check data equality', async () => {
            const data = [1n, 2n, 3n, 4n, 5n];
            const bigIntArray = new BigInt64Array(data); // eslint-disable-line no-undef
            expect(new Int32Array(toArray(bigIntArray)))
                .toEqual(convertBigInt64ArrayToInt32Array(bigIntArray));
        });
        it('check error', async () => {
            const array = new Int32Array([1, 2, 3, 4, 5]);
            expect(() => convertBigInt64ArrayToInt32Array(array))
                .toThrow(IncorrectDataTypeError);
        });
    });
});
