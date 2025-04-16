import { describe, it, expect } from 'vitest';
import JsonLoader from './JsonLoader.js';
import cellsGoodFixture from '../legacy-loaders/schemas/fixtures/cells.good.json';
import cellsBadFixture from '../legacy-loaders/schemas/fixtures/cells.bad.json';
describe('loaders/JsonLoader', () => {
    describe('validation against JSON schema', () => {
        it('can validate against a schema when data looks good', () => {
            const loader = new JsonLoader(null, {
                fileType: 'cells.json',
            });
            expect(loader.schema).toBeDefined();
            const [valid, reason] = loader.validate(cellsGoodFixture);
            expect(valid).toBeTruthy();
            expect(reason).toBeUndefined();
        });
        it('can validate against a schema when data looks bad', () => {
            const loader = new JsonLoader(null, {
                fileType: 'cells.json',
            });
            expect(loader.schema).toBeDefined();
            const [valid, reason] = loader.validate(cellsBadFixture);
            expect(valid).toBeFalsy();
            expect(JSON.parse(reason)[0].message).toEqual("Unrecognized key(s) in object: 'tsne'");
        });
    });
});
