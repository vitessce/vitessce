/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import { quadtree } from 'd3-quadtree';

/**
 * Returns a closure that returns a constant value.
 */
function constant(v) {
  return (() => v);
}

/**
 * Adds a tiny bit of randomness to a number.
 */
function jiggle(v) {
  return v + (Math.random() - 0.5) * 1e-6;
}

/**
 * A force function to be used with d3.forceSimulation.
 * This has been adapted for use here, with comments explaining each part.
 * Reference: https://bl.ocks.org/cmgiven/547658968d365bcc324f3e62e175709b
 */
export function forceCollideRects() {
  // D3 implements things with function prototypes rather than classes.
  // Pretend these variables are the "instance members" of a class.
  // Note that this function actually returns the internal force() function,
  // but that the force() function is a closure with access to these instance members.

  let nodes;
  let masses;
  let strength = 1;
  let iterations = 1;

  let sizes;
  let size = constant([0, 0]);

  // Given a node, return the center point along the x-axis.
  function xCenter(d) {
    return d.x + d.vx + sizes[d.index][0] / 2;
  }

  // Given a node, return the center point along the y-axis.
  function yCenter(d) {
    return d.y + d.vy + sizes[d.index][1] / 2;
  }

  // Given a quadtree node, initialize its .size property.
  function prepare(quad) {
    if (quad.data) {
      // This is a leaf node, so we set quad.size to the node's size.
      // (No need to compute the max of internal nodes,
      // since leaf nodes do not have any internal nodes).
      quad.size = sizes[quad.data.index];
    } else {
      quad.size = [0, 0];
      // Internal nodes of the quadtree are represented
      // as four-element arrays in left-to-right, top-to-bottom order.
      // Here, we are setting quad.size to [maxWidth, maxHeight]
      // among the internal nodes of this current `quad` node.
      for (let i = 0; i < 4; i++) {
        if (quad[i] && quad[i].size) {
          quad.size[0] = Math.max(quad.size[0], quad[i].size[0]);
          quad.size[1] = Math.max(quad.size[1], quad[i].size[1]);
        }
      }
    }
  }

  function force() {
    let node;
    let nodeSize;
    let nodeMass;
    let xi;
    let yi;

    // Create a quadtree based on node center points.
    // Initialize each quadtree node's .size property by calling
    // the prepare() function on each quadtree node.
    const tree = quadtree(nodes, xCenter, yCenter).visitAfter(prepare);

    // Update the .vx and .vy properties of both `node` and `data`
    // (the current node pair).
    function apply(quad, x0, y0, x1, y1) {
      // `quad` is a quadtree node.
      const { data } = quad;
      const xSize = (nodeSize[0] + quad.size[0]) / 2;
      const ySize = (nodeSize[1] + quad.size[1]) / 2;

      if (data && data.index > node.index) {
        // This is a leaf node because `data` is defined.
        // `x` is the difference in x centers between `node` and `data`.
        // `y` is the difference in y centers between `node` and `data`.
        let x = jiggle(xi - xCenter(data));
        let y = jiggle(yi - yCenter(data));
        const xd = Math.abs(x) - xSize;
        const yd = Math.abs(y) - ySize;

        // If `xd` and `yd` is less than zero,
        // then there is an overlap between the two nodes.
        if (xd < 0 && yd < 0) {
          const l = Math.sqrt(x * x + y * y);
          const m = masses[data.index] / (nodeMass + masses[data.index]);

          // We move the nodes either in the x or y direction.
          // Nodes are moved proportionally to:
          // their distance apart (`l`), their amount of overlap (`xd` or `yd`), their masses (`m`),
          // and the strength parameter (`strength`).
          if (Math.abs(xd) < Math.abs(yd)) {
            node.vx -= (x *= xd / l * strength) * m;
            data.vx += x * (1 - m);
          } else {
            node.vy -= (y *= yd / l * strength) * m;
            data.vy += y * (1 - m);
          }
        }
        // When the quadtree.visit callback returns _true_ for a node,
        // then the node's children will _not_ be visited.
        return x0 > xi + xSize || x1 < xi - xSize || y0 > yi + ySize || y1 < yi - ySize;
      }
      return false;
    }

    function iterate() {
      // On every iteration, use the `apply` function to visit every node
      // which has an index greater than the current node's index,
      // (visiting every node pair).
      for (let j = 0; j < nodes.length; j++) {
        node = nodes[j];
        nodeSize = sizes[j];
        nodeMass = masses[j];
        xi = xCenter(node);
        yi = yCenter(node);

        tree.visit(apply);
      }
    }

    // Do the specified number of iterations.
    for (let i = 0; i < iterations; i++) {
      iterate();
    }
  }

  // The "constructor".
  // Takes a list of nodes as input.
  force.initialize = (v) => {
    nodes = v;
    // Get the size [w, h] of each node using the size getter function.
    sizes = nodes.map(size);
    // Get the mass of each node,
    // which is the sum of its horizontal and vertical edge lengths.
    masses = sizes.map(d => d[0] + d[1]);
  };

  // Set the number of iterations.
  // If no value is provided as a parameter, this acts as a getter function.
  force.iterations = (...v) => {
    if (v.length) {
      iterations = +v[0];
      return force;
    }
    return iterations;
  };

  // Set the strength value.
  // If no value is provided as a parameter, this acts as a getter function.
  force.strength = (...v) => {
    if (v.length) {
      strength = +v[0];
      return force;
    }
    return strength;
  };

  // Set the size function.
  // The size function takes a node as a parameter and returns its size.
  // If no size function is provided as a parameter, this acts as a getter function.
  force.size = (...v) => {
    if (v.length) {
      size = (typeof v[0] === 'function' ? v[0] : constant(v[0]));
      return force;
    }
    return size;
  };

  // Returns the force closure.
  return force;
}
