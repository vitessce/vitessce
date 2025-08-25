import { InternMap } from 'internmap';


// Simple DAG class, with minimum functionality:
// to find a path from targetInput-to-targetOutput.
// Edges can have arbitrary attributes.
export class DAG {
  /**
     * DAG constructor.
     * @param {{ from: string, to: string, attributes: any}[]} edges
     */
  constructor(edges) {
    /**
     * Adjacency list representation of the DAG.
     * Maps each input to an array of outputs.
     * @type {Map<string, string[]>}
     */
    this.graph = new Map();
    /**
     * Mapping from [from, to] pairs to edge data.
     * @type {InternMap<[string, string], any>}
     */
    this.edgeData = new InternMap([], JSON.stringify);

    // Build adjacency list
    edges.forEach((edge) => {
      const { from, to } = edge;
      if (!this.graph.has(from)) {
        this.graph.set(from, []);
      }
      this.graph.get(from).push(to);
      this.edgeData.set([from, to], edge.attributes);
    });
  }

  /**
   * Find a path from start to end using DFS.
   * @param {string} start
   * @param {string} end
   * @returns {{ from: string, to: string, attributes: any }[] | null} Returns
   * the path as an array of edges or null if no path exists.
   */
  findPath(start, end) {
    const path = [];
    const visited = new Set();

    // Depth-first search (DFS) to find a path from start to end.
    const dfs = (node) => {
      if (node === end) {
        return true;
      }
      visited.add(node);

      const neighbors = this.graph.get(node) || [];
      // Do not use forEach to allow early exit (returning).
      // eslint-disable-next-line no-restricted-syntax
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          path.push([node, neighbor]);
          if (dfs(neighbor)) {
            return true;
          }
          path.pop(); // backtrack
        }
      }

      return false;
    };

    // Start DFS from the start node.
    const found = dfs(start);
    if (found) {
      // Convert path to a list of edge objects with info
      return path.map(([from, to]) => ({
        from,
        to,
        attributes: this.edgeData.get([from, to]),
      }));
    }
    // If no path is found, return null.
    return null;
  }
}
