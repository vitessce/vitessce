import expect from 'expect';
import JsonLoader from './JsonLoader';
import cellsGoodFixture from '../schemas/fixtures/cells.good.json';
import cellsBadFixture from '../schemas/fixtures/cells.bad.json';


describe('loaders/JsonLoader', () => {
  describe('validation against JSON schema', () => {
    it('can validate against a schema when data looks good', () => {
      const loader = new JsonLoader({
        type: 'cells',
      });
      expect(loader.schema).toBeDefined();
      const [valid, reason] = loader.validate(cellsGoodFixture);
      expect(valid).toBeTruthy();
      expect(reason).toBeUndefined();
    });

    it('can validate against a schema when data looks bad', () => {
      const loader = new JsonLoader({
        type: 'cells',
      });
      expect(loader.schema).toBeDefined();
      const [valid, reason] = loader.validate(cellsBadFixture);
      expect(valid).toBeFalsy();
      expect(reason[0].message).toEqual('should NOT have additional properties');
    });
  });
});
