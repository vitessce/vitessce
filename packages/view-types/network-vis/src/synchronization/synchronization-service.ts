import Graph, { UndirectedGraph } from 'graphology';
import { Subject } from 'rxjs';
// import * as colorgrad from 'colorgrad-js/bundler';
import chroma from 'chroma-js';
import { ClusterGraph } from '../graphs/cluster-graph';


export class SynchronizationService {
   private selectedIdsChange$: Subject<string> = new Subject();
   public onSelectedIdsChange$ = this.selectedIdsChange$.asObservable();

   private nodeDropped$: Subject<string> = new Subject();
   public onNodeDropped$ = this.nodeDropped$.asObservable();

   private highlightEnter$: Subject<string> = new Subject();
   public onHighlightEnter$ = this.highlightEnter$.asObservable();

   private highlightLeave$: Subject<string> = new Subject();
   public onHighlightLeave$ = this.highlightLeave$.asObservable();

   public selectedId?: string;
   public selectedFtuName: string | undefined;
   public egoGraph?: UndirectedGraph;
   public egoGraphDepthByLinks?: { [id: string]: number };
   public layerColorsNodes?: string[];
   public layerColorsLinks?: string[];
   public layerColorsGray?: string[];
   private egoGraphHasIntermediateConnections = false;

   public get hasSelectedId(): boolean {
      return this.selectedId != undefined;
   }

   public get hasIntermediateConnections(): boolean {
      return this.shouldHaveIntermediateConnections && this.egoGraphHasIntermediateConnections;
   }

   constructor(
      public clusterGraph: ClusterGraph | undefined,
      private graph: Graph,
      private shouldHaveIntermediateConnections: boolean = true
   ) {
      this.updateLayerColors();
   }

   public onNodeClicked(
      clickedId: string | undefined,
      ctrlKey: boolean = false,
      altKey: boolean = false,
      shiftKey: boolean = false
   ) {
      if (!clickedId) {
         this.selectedId = undefined;
      } else if (altKey) {
         this.graph.dropNode(clickedId);
         if (this.selectedId == clickedId) this.selectedId = undefined;
      } else {
         this.selectedId = clickedId;
      }
      if (this.hasSelectedId) {
         this.updateEgoGraph(ctrlKey);
         this.selectedFtuName = this.graph.getNodeAttributes(this.selectedId).ftuName;
      } else this.selectedFtuName = undefined;
      this.updateLayerColors();
      if (altKey && clickedId!==undefined) this.nodeDropped$.next(clickedId);
      if(this.selectedId!==undefined) this.selectedIdsChange$.next(this.selectedId);
   }

   public onHighlightEnter(id: string) {
      this.highlightEnter$.next(id);
   }

   public onHighlightLeave(id: string) {
      this.highlightLeave$.next(id);
   }

   private updateLayerColors() {
      const totalDepth = (this.hasSelectedId && this.egoGraph!==undefined) ? this.egoGraph.getAttribute('linkDepth') : 4;

      // const gradient = colorgrad.customGradient(['#09D72B', '#7D1BDE'], null, 'hsv');
      // this.layerColorsNodes = gradient.colors(totalDepth).map((c) => c.hex());
      // this.layerColorsLinks = gradient.colors(totalDepth).map((c) => c.hex());

      // const grayGradient = colorgrad.customGradient(['#333', '#111'], null, 'hsv');
      // this.layerColorsGray = grayGradient.colors(totalDepth).map((c) => c.hex());
      const gradient = chroma.scale(['#09D72B', '#7D1BDE']).mode('hsv').colors(totalDepth);
      this.layerColorsNodes = gradient;
      this.layerColorsLinks = gradient;
      
      const grayGradient = chroma.scale(['#333', '#111']).mode('hsv').colors(totalDepth);
      this.layerColorsGray = grayGradient;
   }

   private updateEgoGraph(forceNormalEgoGraph: boolean) {
      if (this.shouldHaveIntermediateConnections && !forceNormalEgoGraph) {
         this.createEgoGraphWithIntermediaryConnections();
         this.egoGraphHasIntermediateConnections = true;
      }

      if (
         !this.shouldHaveIntermediateConnections ||
         forceNormalEgoGraph ||
         this.egoGraph!==undefined &&this.egoGraph.getAttribute('depth') == 1
      ) {
         this.egoGraphHasIntermediateConnections = false;
         this.createEgoGraph();
      }
   }

   private createEgoGraph() {
      this.egoGraph = new UndirectedGraph();
      this.egoGraph.addNode(this.selectedId, {
         ...this.graph.getNodeAttributes(this.selectedId),
         depth: 0,
         nrInDepth: 0
      });

      let nodesToExpand = [this.selectedId];
      let nextNodesToExpand = [];
      let depth = 1;
      let nrInDepth = 0;
      let edgeNrInDepth = 0;
      const nodeCountByDepth: number[] = [1];
      const edgeCountByDepth: number[] = [0];
      const visitedNodes: string[] = [];
      this.egoGraphDepthByLinks = {};

      while (nodesToExpand.length > 0) {
         const nodeToExpand = nodesToExpand.pop();
         if(nodeToExpand!==undefined) visitedNodes.push(nodeToExpand);
         const neighbors = this.graph.neighbors(nodeToExpand);

         for (const nextNode of neighbors) {
            if (visitedNodes.includes(nextNode)) continue;
            if (!this.egoGraph.hasNode(nextNode)) {
               this.egoGraph.addNode(nextNode, {
                  ...this.graph.getNodeAttributes(nextNode),
                  depth: depth,
                  nrInDepth: nrInDepth++
               });
            } else if (this.egoGraph.getNodeAttribute(nextNode, 'depth') == depth - 1) {
               if (this.egoGraphDepthByLinks[nextNode] == undefined)
                  this.egoGraphDepthByLinks[nextNode] = depth;
               continue;
            }
            this.egoGraphDepthByLinks[nextNode] = depth;
            if (!this.egoGraph.hasEdge(nodeToExpand, nextNode)) {
               this.egoGraph.addEdge(nodeToExpand, nextNode, {
                  links: undefined,
                  source: nodeToExpand,
                  target: nextNode,
                  edgeNrInDepth: edgeNrInDepth++
               });
               nextNodesToExpand.push(nextNode);
            }
         }

         if (nodesToExpand.length == 0) {
            nodeCountByDepth.push(nrInDepth);
            edgeCountByDepth.push(edgeNrInDepth);
            if (nrInDepth > 0) depth++;
            nrInDepth = 0;
            edgeNrInDepth = 0;
            nodesToExpand = nextNodesToExpand;
            nextNodesToExpand = [];
         }
      }
      const linkDepth = Math.max(...Object.values(this.egoGraphDepthByLinks), 0) + 1;
      this.egoGraph.setAttribute('depth', depth);
      this.egoGraph.setAttribute('linkDepth', linkDepth);
      this.egoGraph.setAttribute('nodeCountByDepth', nodeCountByDepth);
      this.egoGraph.setAttribute('edgeCountByDepth', edgeCountByDepth);
   }

   private createEgoGraphWithIntermediaryConnections() {
      this.egoGraph = new UndirectedGraph();
      this.egoGraph.addNode(this.selectedId, {
         ...this.graph.getNodeAttributes(this.selectedId),
         depth: 0,
         nrInDepth: 0
      });

      let nodesToExpand = [this.selectedId];
      let nextNodesToExpand = [];
      let depth = 1;
      let nrInDepth = 0;
      let edgeNrInDepth = 0;
      const nodeCountByDepth: number[] = [1];
      const edgeCountByDepth: number[] = [0];
      const visitedNodes: string[] = [];
      this.egoGraphDepthByLinks = {};

      while (nodesToExpand.length > 0) {
         const nodeToExpand = nodesToExpand.pop();
         if(nodeToExpand!==undefined)visitedNodes.push(nodeToExpand);
         const neighbors = this.graph.neighbors(nodeToExpand);
         for (const link of neighbors) {
            const nextNodes = this.graph.neighbors(link);
            for (const nextNode of nextNodes) {
               if (visitedNodes.includes(nextNode)) continue;
               if (!this.egoGraph.hasNode(nextNode)) {
                  this.egoGraph.addNode(nextNode, {
                     ...this.graph.getNodeAttributes(nextNode),
                     depth: depth,
                     nrInDepth: nrInDepth++
                  });
               } else if (this.egoGraph.getNodeAttribute(nextNode, 'depth') == depth - 1) {
                  if (this.egoGraphDepthByLinks[link] == undefined)
                     this.egoGraphDepthByLinks[link] = depth;
                  continue;
               }
               this.egoGraphDepthByLinks[link] = depth;
               if (!this.egoGraph.hasEdge(nodeToExpand, nextNode)) {
                  this.egoGraph.addEdge(nodeToExpand, nextNode, {
                     links: [this.graph.getNodeAttributes(link)],
                     source: nodeToExpand,
                     target: nextNode,
                     edgeNrInDepth: edgeNrInDepth++
                  });
                  nextNodesToExpand.push(nextNode);
               } else {
                  const attributes = this.egoGraph.getEdgeAttributes(nodeToExpand, nextNode);
                  attributes.links = [...attributes.links, this.graph.getNodeAttributes(link)];
               }
            }
         }
         if (nodesToExpand.length == 0) {
            nodeCountByDepth.push(nrInDepth);
            edgeCountByDepth.push(edgeNrInDepth);
            if (nrInDepth > 0) depth++;
            nrInDepth = 0;
            edgeNrInDepth = 0;
            nodesToExpand = nextNodesToExpand;
            nextNodesToExpand = [];
         }
      }
      const linkDepth = Math.max(...Object.values(this.egoGraphDepthByLinks), 0) + 1;
      this.egoGraph.setAttribute('depth', depth);
      this.egoGraph.setAttribute('linkDepth', linkDepth);
      this.egoGraph.setAttribute('nodeCountByDepth', nodeCountByDepth);
      this.egoGraph.setAttribute('edgeCountByDepth', edgeCountByDepth);
   }
}
