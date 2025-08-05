import { describe, it, expect } from 'vitest';
import { DAG } from './dag.js';


describe('DAG', () => {
  describe('findPath', () => {
    it('Can find a path from start to end.', () => {
      // Example usage:
      const edges = [
        { from: 'A', to: 'B', attributes: { some_key: 'a_to_b' } },
        { from: 'B', to: 'C', attributes: { some_key: 'b_to_c', hello: 'world' } },
        { from: 'A', to: 'D', attributes: { some_key: 'a_to_d' } },
        { from: 'D', to: 'E', attributes: { some_key: 'd_to_e' } },
        { from: 'E', to: 'C', attributes: { some_key: 'e_to_c' } },
      ];

      const dag = new DAG(edges);
      const path = dag.findPath('A', 'C');
      expect(path).toEqual([
        { from: 'A', to: 'B', attributes: { some_key: 'a_to_b' } },
        { from: 'B', to: 'C', attributes: { some_key: 'b_to_c', hello: 'world' } },
      ]);

      const path2 = dag.findPath('D', 'C');
      expect(path2).toEqual([
        { from: 'D', to: 'E', attributes: { some_key: 'd_to_e' } },
        { from: 'E', to: 'C', attributes: { some_key: 'e_to_c' } },
      ]);

      const path3 = dag.findPath('D', 'B');
      expect(path3).toEqual(null);
    });
  });
});
