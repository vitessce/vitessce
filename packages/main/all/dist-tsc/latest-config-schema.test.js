import { describe, expect, it } from 'vitest';
import { CoordinationType } from '@vitessce/constants-internal';
import { baseCoordinationTypes, } from './base-plugins.js';
describe('view config schema', () => {
    describe('coordination types', () => {
        it('defines schema for all valid coordination types', () => {
            const coordinationTypeNamesFromConstants = Object.values(CoordinationType).sort();
            const coordinationTypeNamesFromBasePlugins = baseCoordinationTypes.map(ct => ct.name).sort();
            expect(coordinationTypeNamesFromConstants)
                .toEqual(expect.arrayContaining(coordinationTypeNamesFromBasePlugins));
        });
        it('defines schema for only valid coordination types (does not have extra)', () => {
            const coordinationTypeNamesFromConstants = Object.values(CoordinationType).sort();
            const coordinationTypeNamesFromBasePlugins = baseCoordinationTypes.map(ct => ct.name).sort();
            expect(coordinationTypeNamesFromBasePlugins)
                .toEqual(expect.arrayContaining(coordinationTypeNamesFromConstants));
        });
    });
});
