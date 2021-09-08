import expect from 'expect';
<<<<<<< HEAD:src/schemas/config-1.0.6.schema.test.js
import { CoordinationType } from '../app/constants';
import viewConfigSchema from './config-1.0.6.schema.json';
=======
import { COORDINATION_TYPES } from '../app/state/coordination';
import viewConfigSchema from './config-1.0.5.schema.json';
>>>>>>> 37ef3d9b (Lint):src/schemas/config-1.0.5.schema.test.js

describe('view config schema', () => {
  describe('coordination types', () => {
    it('defines schema for all valid coordination types', () => {
      const allCoordinationTypes = Object.values(CoordinationType);
      const inCoordinationSpace = Object.keys(
        viewConfigSchema.properties.coordinationSpace.properties,
      );
      const inCoordinationScopes = Object.keys(
        viewConfigSchema.definitions.components.items.properties
          .coordinationScopes.properties,
      );

      expect(inCoordinationSpace).toEqual(expect.arrayContaining(allCoordinationTypes));
      expect(inCoordinationScopes).toEqual(expect.arrayContaining(allCoordinationTypes));
    });

    it('defines schema for only valid coordination types (does not have extra)', () => {
      const allCoordinationTypes = Object.values(CoordinationType);
      const inCoordinationSpace = Object.keys(
        viewConfigSchema.properties.coordinationSpace.properties,
      );
      const inCoordinationScopes = Object.keys(
        viewConfigSchema.definitions.components.items.properties
          .coordinationScopes.properties,
      );

      expect(allCoordinationTypes).toEqual(expect.arrayContaining(inCoordinationSpace));
      expect(allCoordinationTypes).toEqual(expect.arrayContaining(inCoordinationScopes));
    });
  });
});
