/**
 * Dataset-agnostic configuration for network visualization.
 * 
 * To adapt this view for a new dataset:
 * 1. Update NETWORK_DATA_URL to point to your network JSON file
 * 2. Update NODE_TYPE_CONFIG to define your node types and their visual properties
 * 3. Update COMPOSITE_NODE_CONFIG if your dataset has merged/composite nodes
 * 4. Update EDGE_TYPES if your dataset has different edge semantics
 * 5. Adjust visual constants (colors, opacity, sizes) as needed
 * 
 * All other view logic remains unchanged.
 */

/**
 * URL to fetch the network data from.
 * The data should be in JSON format with structure: { nodes: [...], links: [...] }
 */
export const NETWORK_DATA_URL = 'https://network-hidive.s3.eu-central-1.amazonaws.com/modified_network_kidney_20_10.json';

/**
 * Configuration for each node type in the network.
 * Maps node type identifiers to their visual properties.
 */
export const NODE_TYPE_CONFIG: Record<string, {
  color: string;
  label: string;
}> = {
  glomeruli: {
    color: '#ef4444',  // red
    label: 'Glomeruli'
  },
  nerves: {
    color: '#eab308',  // yellow
    label: 'Nerves'
  }
};

/**
 * Default node type to use as a fallback if type is not found in NODE_TYPE_CONFIG.
 */
export const DEFAULT_NODE_COLOR = '#6b7280'; // gray

/**
 * Configuration for composite/merged nodes.
 * Some datasets have nodes that represent merged groups of other nodes.
 */
export const COMPOSITE_NODE_CONFIG = {
  /** Node type that can be composite (merged from multiple nodes) */
  compositeNodeType: 'nerves',
  /** Prefix used to identify merged nodes in the data */
  mergedNodePrefix: 'merged_',
  /** Property name that stores the IDs of subcomponents in merged nodes */
  subComponentsProperty: 'subComponents'
};

/**
 * Edge type definitions for the network.
 * Used in motif search and graph algorithms.
 */
export const EDGE_TYPES = {
  /** Edge from first node type to second node type */
  forwardEdge: 'glomeruli_to_nerve',
  /** Edge from second node type to first node type */
  reverseEdge: 'nerve_to_glomeruli'
};

/**
 * Visual styling constants
 */
export const VISUAL_CONSTANTS = {
  /** Default border color for nodes without selection/highlighting */
  defaultBorderColor: '#999999',
  /** Border color for hovered nodes */
  hoverBorderColor: '#ffffff',
  /** Default opacity for deemphasized nodes */
  deemphasizedOpacity: 0.3,
  /** Opacity for emphasized/selected nodes */
  emphasizedOpacity: 1.0,
  /** Default edge color */
  edgeColor: '#999999',
  /** Node size for regular display */
  nodeSize: 15,
  /** Node size when selected */
  selectedNodeSize: 25,
  /** Border width for regular nodes */
  borderWidth: 4,
  /** Border width for selected nodes */
  selectedBorderWidth: 6,
  /** Border width for hovered nodes */
  hoverBorderWidth: 8
};

/**
 * Helper function to get node color based on node type.
 * @param nodeType - The ftuName or type property of the node
 * @returns The hex color for the node type
 */
export function getNodeColor(nodeType: string): string {
  return NODE_TYPE_CONFIG[nodeType]?.color || DEFAULT_NODE_COLOR;
}

/**
 * Helper function to check if a node is a composite/merged node.
 * @param nodeType - The ftuName or type property of the node
 * @param nodeId - The ID of the node
 * @returns True if the node is a composite node
 */
export function isCompositeNode(nodeType: string, nodeId: string): boolean {
  return nodeType === COMPOSITE_NODE_CONFIG.compositeNodeType 
    && nodeId.startsWith(COMPOSITE_NODE_CONFIG.mergedNodePrefix);
}

