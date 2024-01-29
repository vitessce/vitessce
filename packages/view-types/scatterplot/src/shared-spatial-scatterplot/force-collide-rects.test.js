import { describe, it, expect } from 'vitest';
import { forceSimulation } from 'd3-force';
import { forceCollideRects } from './force-collide-rects.js';

describe('force-collide-rects.js', () => {
  describe('forceCollideRects', () => {
    it('can be initialized with a size function', () => {
      const collisionForce = forceCollideRects()
        .size(d => ([d.width, d.height]));

      const size = collisionForce.size();
      const [w, h] = size({ width: 2, height: 3 });
      expect(w).toEqual(2);
      expect(h).toEqual(3);
    });

    it('cannot prevent a collision of rects after few iterations', () => {
      const collisionForce = forceCollideRects()
        .size(d => ([d.width, d.height]));

      const nodes = [
        {
          label: 'A', width: 100, height: 100, x: 2, y: 2,
        },
        {
          label: 'B', width: 100, height: 100, x: 3, y: 3,
        },
        {
          label: 'C', width: 100, height: 100, x: 3, y: 2,
        },
      ];

      forceSimulation()
        .nodes(nodes)
        .force('collision', collisionForce)
        .tick(2);

      const collisionAB = (
        Math.abs(nodes[0].x - nodes[1].x) < 100
            && Math.abs(nodes[0].y - nodes[1].y) < 100
      );
      expect(collisionAB).toEqual(true);
    });

    it('can prevent a collision of rects after many iterations', () => {
      const collisionForce = forceCollideRects()
        .size(d => ([d.width, d.height]));

      const nodes = [
        {
          label: 'A', width: 100, height: 100, x: 2, y: 2,
        },
        {
          label: 'B', width: 100, height: 100, x: 3, y: 3,
        },
        {
          label: 'C', width: 100, height: 100, x: 3, y: 2,
        },
      ];

      forceSimulation()
        .nodes(nodes)
        .force('collision', collisionForce)
        .tick(50);

      const collisionAB = (
        Math.abs(nodes[0].x - nodes[1].x) < 100
                && Math.abs(nodes[0].y - nodes[1].y) < 100
      );
      expect(collisionAB).toEqual(false);
    });
  });
});
