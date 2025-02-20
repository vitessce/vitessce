/* eslint-disable max-len */
// Here, "Kg" stands for "knowledge graph"
export type KgNodeType = 'gene' | 'protein' | 'pathway' | 'cell-type';
export type TargetModalityType = 'gene' | 'protein'; // TODO: support protein, genomic region, etc.
export type StratificationType = 'sampleSet' | 'structural-region' | 'structural-presence';

// Why was this node included in the list?
export type KgNodeReason = (
  // The user selected during modality-agnostic selection.
  'modality-agnostic'
  // The user selected the linked node during modality-agnostic selection.
  // This node may then be modality-specific after some feature
  // transformation to a different modality.
  // eslint-disable-next-line no-use-before-define
  | KgNode
);
// Why did the data source include this node?
// Is the knowledge canonical or data-driven?
export type KgNodeMethod = 'canonical' | 'data-driven';
// If this is a node from a suggestion,
// export type SuggestionReason = 'ligand-receptor' | 'pathway-membership';
// export type SuggestionSource = string;

// A node from a knowledge graph.
export type KgNode = {
  // ID in the knowledge graph. Not necessarily human-readable.
  kgId: string;
  nodeType: KgNodeType;

  // Alternate identifiers
  // Human-readable name of the node.
  label: string;
  // Ontology term for this node. Should be a CURIE.
  term?: string;
  // Alternative identifiers like gene symbols or Ensembl IDs, in CURIE string format.
  altIds?: string[];

  // Provenance info
  // Name of a data source like 'EnrichrKG'.
  source?: string;
  sourceMethod?: KgNodeMethod;
  // Version of the data source.
  sourceVersion?: string;
  // Note: this is a recursive type.
  reason?: KgNodeReason;
};

// Are the edge and stratification types needed here?
export type KgEdge = {
  source: string;
  target: string;
  relation: string;
};

export type KgStratification = {
  name: string;
  stratificationId: string;
  stratificationType: StratificationType;
  sampleSets?: [
    string[], // Control sampleSet path
    string[], // Case sampleSet path
  ];
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

// Other async function types.
export type GetAlternativeTermsFunc = (curie: string) => Promise<string[]>;
export type GetTermMappingFunc = (keyCuriePrefix: string, valCuriePrefix: string) => Promise<Map<string, string>>;
