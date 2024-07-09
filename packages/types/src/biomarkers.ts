// Here, "Kg" stands for "knowledge graph"
export type KgNodeType = 'gene' | 'protein' | 'pathway' | 'cell-type';
export type TargetModalityType = 'gene' | 'protein'; // TODO: support protein, genomic region, etc.
export type GroupType = 'clinical' | 'structural-region' | 'structural-presence';

// Why was this node included in the list?
export type KgNodeReason = (
    'modality-agnostic' // The user selected during modality-agnostic selection.
    | KgNode // The user selected the linked node during modality-agnostic selection. This node may then be modality-specific after some feature transformation to a different modality.
);
// Why did the data source include this node? Is the knowledge canonical or data-driven?
export type KgNodeMethod = 'canonical' | 'data-driven';
// If this is a node from a suggestion,
// export type SuggestionReason = 'ligand-receptor' | 'pathway-membership';
// export type SuggestionSource = string;

// A node from a knowledge graph.
export type KgNode = {
  kgId: string; // ID in the knowledge graph. Not necessarily human-readable.
  nodeType: KgNodeType;

  // Alternate identifiers
  label: string; // Human-readable name of the node.
  term?: string; // Ontology term for this node. Should be a CURIE.
  altIds?: string[]; // Alternative identifiers like gene symbols or Ensembl IDs, in CURIE string format.
  
  // Provenance info
  source?: string; // Name of a data source like 'EnrichrKG'.
  sourceMethod?: KgNodeMethod;
  sourceVersion?: string; // Version of the data source.
  reason?: KgNodeReason;
};

// Are the edge and stratification types needed here?
export type KgEdge = {
  source: KgNode;
  target: KgNode;
  relation: string;
};

export type KgStratification = {
  name: string;
  stratificationId: string;
  groupType: GroupType;
};

// Async function types that operate on KgNodes.
export type AutocompleteFeatureFunc = (partial: string, targetModality: null | TargetModalityType) => Promise<KgNode[]>;
export type TransformFeatureFunc = (node: KgNode, targetModality: TargetModalityType) => Promise<KgNode[]>;
export type RelatedFeaturesFunc = (node: KgNode) => Promise<KgNode[]>;
export type FeatureToUrlFunc = (node: KgNode) => Promise<string>;
export type FeatureToIntervalFunc = (node: KgNode, assembly: string) => Promise<{ chr: string, start: number, end: number }>;

// TODO: should the node types be more precise?
export type ObsSetToFeaturesFunc = (node: KgNode) => Promise<KgNode[]>;
export type FeaturesToObsSetFunc = (nodes: KgNode[]) => Promise<KgNode>;
