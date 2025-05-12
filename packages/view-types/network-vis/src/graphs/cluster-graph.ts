import { UndirectedGraph } from 'graphology';
import { GraphOptions } from 'graphology-types';
import { NodeCluster, NodeClustering, NodeInterconnectivity } from '../data/network-data';

export enum ClusterGraphNodeType {
   link,
   node,
   nodeCluster
}

export enum ClusterGraphLinkType {
   connection,
   spacer
}

export interface ClusterGraphNode {
   id: string;
   ftuName: string;
   type: ClusterGraphNodeType;
}

export interface D3NodeClusterNode extends NodeCluster, ClusterGraphNode {
   nodesList: string[];
   linkList: string[];
   x: number;
   y: number;
}

export class ClusterGraph extends UndirectedGraph {
   private interconnectivity: NodeInterconnectivity;
   constructor(
      private connectionGraph: UndirectedGraph,
      private clustering: NodeClustering,
      options?: GraphOptions
   ) {
      super(options);
      this.interconnectivity = this.clustering.interconnectivity;
      this.clustering.clusters.forEach((element) => {
         this.addNodeFromClusterElement(element);
      });

      this.connectAllNodesInGraph();
   }

   public expandNodeCluster(nodeClusterNode: D3NodeClusterNode) {
      this.dropNode(nodeClusterNode.id);
      const expandedNodes: string[] = [];
      nodeClusterNode.nodes.forEach((element) => {
         const expandedNode = this.addNodeFromClusterElement(
            element,
            nodeClusterNode.x,
            nodeClusterNode.y
         );
         expandedNodes.push(expandedNode);
      });
      expandedNodes.forEach((node) => {
         const attributes = this.getNodeAttributes(node);
         this.connectNodeInGraph(attributes, nodeClusterNode.x, nodeClusterNode.y);
      });
   }

   private addNodeFromClusterElement(
      element: string | NodeCluster,
      x: number = 0,
      y: number = 0
   ): string {
      const isCluster = typeof element === 'object';
      x = x + 10 * Math.random() - 5;
      y = y + 10 * Math.random() - 5;
      if (isCluster) {
         const nodeList = this.getNodesInCluster(element);
         const linkList = this.getLinksBetweenNodes(nodeList);
         return this.addNode(element.id, {
            ...element,
            type: ClusterGraphNodeType.nodeCluster,
            nodesList: nodeList,
            linkList: linkList,
            ftuName: this.clustering.ftuName,
            x: x,
            y: y
         });
      } else {
         return this.addNode(element, {
            id: element,
            type: ClusterGraphNodeType.node,
            ...this.connectionGraph.getNodeAttributes(element),
            x: x,
            y: y
         });
      }
   }

   private getNodesInCluster(cluster: NodeCluster): string[] {
      const nodes: string[] = [];
      cluster.nodes.forEach((element) => {
         const isCluster = typeof element === 'object';
         if (isCluster) nodes.push(...this.getNodesInCluster(element));
         else nodes.push(element);
      });
      return nodes;
   }

   private getLinksBetweenNodes(nodes: string[]): string[] {
      const links: string[] = [];
      nodes.forEach((node) => {
         const index = this.interconnectivity.indexById[node];
         this.interconnectivity.matrix[index].forEach((connectingLinks, i) => {
            const otherNode = this.interconnectivity.nodeIds[i];
            if (!nodes.includes(otherNode)) return;
            links.push(...connectingLinks);
         });
      });
      return [...new Set(links)];
   }

   private connectAllNodesInGraph() {
      this.forEachNode((node, attributes) => this.connectNodeInGraph(attributes));
   }

   private connectNodeInGraph(attributes: any, x: number = 0, y: number = 0) {
      if (attributes.type == ClusterGraphNodeType.link) return;
      const sourceNode = attributes.id;
      let nodes = [attributes.id];
      if (attributes.type == ClusterGraphNodeType.nodeCluster) {
         nodes = attributes.nodesList;
      } else {
         const looseConnections = this.connectionGraph.neighbors(attributes.id);
         // console.log('add loose connections: %o', looseConnections);
         looseConnections.forEach((looseConnection) => {
            const looseConnectionAttributes =
               this.connectionGraph.getNodeAttributes(looseConnection);
            if (
               looseConnectionAttributes.ftuName == this.clustering.ftuName ||
               this.hasNode(looseConnection)
            )
               return;
            // console.log('add loose connection: %o', looseConnection);
            this.addNode(looseConnection, {
               id: looseConnection,
               type: ClusterGraphNodeType.link,
               ...looseConnectionAttributes,
               x: x + 10 * Math.random() - 5,
               y: y + 10 * Math.random() - 5
            });
            this.addUndirectedEdge(attributes.id, looseConnection, {
               type: ClusterGraphLinkType.connection,
               source: attributes.id,
               target: looseConnection
            });
         });
      }
      nodes.forEach((node) => {
         const index = this.interconnectivity.indexById[node];
         const interconnectivity = this.interconnectivity.matrix[index];
         interconnectivity.forEach((connectingNodes, i) => {
            if (i == index || connectingNodes.length == 0) return;
            connectingNodes.forEach((connectingNode) => {
               const targetNode = this.interconnectivity.nodeIds[i];
               if (nodes.includes(targetNode)) return;
               if (!this.hasNode(connectingNode)) {
                  // console.log(connectingNode);
                  const connectingNodeAttributes =
                     this.connectionGraph.getNodeAttributes(connectingNode);
                  this.addNode(connectingNode, {
                     id: connectingNode,
                     type: ClusterGraphNodeType.link,
                     ...connectingNodeAttributes,
                     x: x + 10 * Math.random() - 5,
                     y: y + 10 * Math.random() - 5
                  });
               }
               this.createGraphConnection(sourceNode, connectingNode, targetNode);
            });
         });
      });
   }

   private createGraphConnection(sourceNode: string, connectingNode: string, targetNode: string) {
      if (!this.hasUndirectedEdge(sourceNode, connectingNode)) {
         this.addUndirectedEdge(sourceNode, connectingNode, {
            type: ClusterGraphLinkType.connection,
            source: sourceNode,
            target: connectingNode
         });
      }
      this.forEachNode((node, attributes) => {
         if (attributes.type == ClusterGraphNodeType.nodeCluster) {
            if (!attributes.nodesList.includes(targetNode)) return;
            if (!this.hasUndirectedEdge(connectingNode, node)) {
               this.addUndirectedEdge(connectingNode, node, {
                  type: ClusterGraphLinkType.connection,
                  source: connectingNode,
                  target: node
               });
            }
            if (!this.hasUndirectedEdge(sourceNode, node)) {
               this.addUndirectedEdge(sourceNode, node, {
                  type: ClusterGraphLinkType.spacer,
                  source: sourceNode,
                  target: node
               });
            }
         } else {
            if (node != targetNode || this.hasUndirectedEdge(connectingNode, targetNode)) return;
            this.addUndirectedEdge(connectingNode, targetNode, {
               type: ClusterGraphLinkType.connection,
               source: connectingNode,
               target: targetNode
            });
         }
      });
   }
}
