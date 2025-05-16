export interface NetworkData {
   nodes: NetworkNode[];
   links: NetworkLink[];
   clustering?: NodeClustering;
   colorByFtuName: { [groupId: string]: number };
}

export interface NodeClustering {
   ftuName: string;
   clusters: (string | NodeCluster)[];
   interconnectivity: NodeInterconnectivity;
}

export interface NodeCluster {
   id: string;
   connections: number;
   highestInterconnectivity: number;
   nodes: (string | NodeCluster)[];
}

export interface NodeInterconnectivity {
   matrix: string[][][];
   indexById: { [id: string]: number };
   nodeIds: string[];
}

export interface NetworkNode {
   id: string;
   ftuName: string;
   fileFormat: string;
   subComponents?: string[];
   color?: string;
   size?: number;
   cell_type?: string;
}

export interface NetworkLink {
   id: string;
   source: string;
   target: string;
}
