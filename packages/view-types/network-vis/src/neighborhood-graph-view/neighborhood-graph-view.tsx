import { UndirectedGraph } from 'graphology';
import { NetworkData } from '../data/network-data';
import { SynchronizationService } from '../synchronization/synchronization-service';
import React, { CSSProperties } from 'react';
import { Subject, takeUntil } from 'rxjs';
import * as styles from './neighborhood-graph-view.module.scss';
import * as d3 from 'd3';
import * as fb from 'd3-force-boundary';

import {
   ClusterGraph,
   ClusterGraphLinkType,
   ClusterGraphNode,
   ClusterGraphNodeType,
   D3NodeClusterNode
} from '../graphs/cluster-graph';

const containerStyle: CSSProperties = {
   position: 'relative',
   flex: 1,
   width: '100%',
   height: '100%'
};

const tooltipStyle: CSSProperties = {
   position: 'absolute',
   display: 'none',
   margin: 0,
   color: 'black',
   backgroundColor: 'white',
   border: '2px solid black',
   borderRadius: '5px',
   padding: '5px'
};

interface NeighborhoodGraphViewProps {
   data: NetworkData;
   graph: UndirectedGraph;
   synchronizationService: SynchronizationService;
   highlightColor: string;
   nodeSizeByType: Map<ClusterGraphNodeType, number>;
}

export default class NeighborhoodGraphView extends React.Component<
   NeighborhoodGraphViewProps,
   any
> {
   public static defaultProps = {
      highlightColor: '#FFFFFF',
      nodeSizeByType: new Map([
         [ClusterGraphNodeType.node, 7],
         [ClusterGraphNodeType.nodeCluster, 20],
         [ClusterGraphNodeType.link, 4]
      ])
   };

   private unumounted$ = new Subject<void>();
   private container: React.RefObject<HTMLDivElement>;

   private simulation?: d3.Simulation<any, undefined>;
   private svg = d3.create('svg').attr('style', 'max-width: 100%; height: auto;');
   private tooltip = d3.create('div').attr('style', Object.entries(tooltipStyle).map(([key, value]) => `${key}: ${value}`).join(';'));
   private nodesGroup?: d3.Selection<SVGGElement, any, SVGSVGElement, undefined>;
   private linksGroup?: d3.Selection<SVGGElement, any, SVGSVGElement, undefined>;
   private nodesData?: d3.Selection<SVGGElement, any, SVGGElement, undefined>;
   private linksData?: d3.Selection<SVGPathElement, any, SVGGElement, undefined>;
   private legendDots?: d3.Selection<SVGCircleElement, string, SVGSVGElement, undefined>;
   private clusterDot?: d3.Selection<SVGRectElement, undefined, null, undefined>;
   private legendLabels?: d3.Selection<SVGTextElement, string, SVGSVGElement, undefined>;

   private connectingGroupId = 'nerves';

   private get clusterGraph(): ClusterGraph {
      return this.props.synchronizationService.clusterGraph;
   }

   constructor(props: NeighborhoodGraphViewProps) {
      super(props);
      this.container = React.createRef();
      this.props.synchronizationService.onSelectedIdsChange$
      .pipe(takeUntil(this.unumounted$))
      .subscribe(this.updateNodeSelection.bind(this));
      this.props.synchronizationService.onHighlightEnter$
      .pipe(takeUntil(this.unumounted$))
      .subscribe(this.onHighlightIdEnter.bind(this));
      this.props.synchronizationService.onHighlightLeave$
      .pipe(takeUntil(this.unumounted$))
      .subscribe(this.onHighlightIdLeave.bind(this));
   }

   render() {
      return <div style={containerStyle} ref={this.container}></div>;
   }

   componentDidMount(): void {
      this.createGraph();
   }

   componentWillUnmount(): void {
      this.unumounted$.next();
      this.unumounted$.complete();
   }

   private updateNodeSelection(selectedId: string | undefined) {
      if (selectedId == undefined) {
         this.legendDots.attr('fill', (d) => '#' + this.props.data.colorByFtuName[d].toString(16));
         this.clusterDot.attr(
            'fill',
            '#' + this.props.data.colorByFtuName[this.props.data.clustering.ftuName].toString(16)
         );
      } else {
         this.legendDots.attr('fill', '#fff');
         this.clusterDot.attr('fill', '#fff');
      }
      this.nodesData
         .filter((n) => n.id != selectedId)
         .attr('stroke', '#000')
         .attr('stroke-width', 1);
      this.nodesData.attr('fill', (d: any) => this.getNodeColor(d));
      this.linksData.attr('stroke', (d: any) => this.getLinkColor(d));
   }

   private onHighlightIdEnter(id: string) {
      if (!this.clusterGraph.hasNode(id)) {
         const clusterToHighlight = this.clusterGraph.findNode(
            (node, attributes) =>
               attributes.type == ClusterGraphNodeType.nodeCluster &&
               (attributes.nodesList.includes(id) || attributes.linkList.includes(id))
         );
         if (clusterToHighlight == undefined) return;
         id = clusterToHighlight;
      }
      const node = this.clusterGraph.getNodeAttributes(id) as ClusterGraphNode;
      const color = this.getNodeColor(node);
      const svgNode = this.nodesData.filter((d) => d.id == id);
      svgNode.attr('fill', color).attr('stroke', this.props.highlightColor).attr('stroke-width', 2);
      if (node.type == ClusterGraphNodeType.nodeCluster) {
         const size = Math.max(25, this.props.nodeSizeByType.get(node.type));
         svgNode.attr('width', size).attr('height', size);
      } else {
         svgNode.attr('r', Math.max(7, this.props.nodeSizeByType.get(node.type)));
      }
   }

   private onHighlightIdLeave(id: string) {
      if (this.props.synchronizationService.selectedId == id) return;
      if (!this.clusterGraph.hasNode(id)) {
         const clusterToHighlight = this.clusterGraph.findNode(
            (node, attributes) =>
               attributes.type == ClusterGraphNodeType.nodeCluster &&
               (attributes.nodesList.includes(id) || attributes.linkList.includes(id))
         );
         if (clusterToHighlight == undefined) return;
         id = clusterToHighlight;
      }
      const node = this.clusterGraph.getNodeAttributes(id) as ClusterGraphNode;
      const svgNode = this.nodesData.filter((d) => d.id == id);
      svgNode.attr('fill', this.getNodeColor(node)).attr('stroke', '#000').attr('stroke-width', 1);
      const size = this.props.nodeSizeByType.get(svgNode.data()[0].type);
      if (node.type == ClusterGraphNodeType.nodeCluster) {
         svgNode.attr('width', size).attr('height', size);
      } else {
         svgNode.attr('r', this.props.nodeSizeByType.get(node.type));
      }
   }

   private onNodeDragStarted(element: any, event: any) {
      if (!event.active) this.simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
   }
   private onNodeDragged(element: any, event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
   }
   private onNodeDragEnded(element: any, event: any) {
      if (!event.active) this.simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
   }

   private onMouseOverNode(element: any, event: any, data: any) {
      this.props.synchronizationService.onHighlightEnter(data.id);
      let info = data.id;
      if (data.type == ClusterGraphNodeType.nodeCluster)
         info = [
            data.id,
            'Nr of Nodes: ' + data.nodesList.length,
            'Highest Interconnectivity: ' + data.highestInterconnectivity
         ].join('</br>');
      this.tooltip.style('display', 'block').html(info);
   }

   private onMouseMoveNode(element: any, event: any, data: any) {
      const [x, y] = d3.pointer(event, this.container.current);
      this.tooltip.style('left', x + 30 + 'px').style('top', y + 30 + 'px');
   }

   private onMouseLeaveNode(element: any, event: any, data: any) {
      this.props.synchronizationService.onHighlightLeave(data.id);
      this.tooltip.style('display', 'none');
   }

   private onClickNode(element: any, event: PointerEvent, data: any) {
      if (data.type == ClusterGraphNodeType.nodeCluster) {
         this.expandNodeCluster(data);
      } else {
         this.props.synchronizationService.onNodeClicked(
            data.id,
            event.ctrlKey,
            event.altKey,
            event.shiftKey
         );
      }
      event.stopPropagation();
   }

   private expandNodeCluster(nodeClusterNode: D3NodeClusterNode) {
      this.props.synchronizationService.onHighlightLeave(nodeClusterNode.id);
      this.clusterGraph.expandNodeCluster(nodeClusterNode);
      this.updateGraph();
      this.tooltip.style('display', 'none');
      this.simulation.alphaTarget(0.4).restart();
      setTimeout(() => {
         this.simulation.alphaTarget(0);
      }, 1500);
   }

   private onSvgClicked(element: any, event: any) {
      this.props.synchronizationService.onNodeClicked(undefined);
   }

   private createGraph() {
      const width = this.container.current.offsetWidth;
      const height = this.container.current.offsetHeight;

      this.svg
         .attr('width', width)
         .attr('height', height)
         .attr('viewBox', [-width / 2, -height / 2, width, height])
         .on('click', this.onSvgClicked.bind(this));

      this.linksGroup = this.svg
         .append('g')
         .attr('stroke-width', 1.5)
         .attr('stroke-opacity', 1)
         .attr('fill', 'none');

      this.nodesGroup = this.svg.append('g');

      this.simulation = d3
         .forceSimulation()
         .force(
            'link',
            d3.forceLink().id((d: any) => d.id)
         )
         .force('charge', d3.forceManyBody().strength(-300))
         .force('y', d3.forceY(0).strength((width / height) * 0.1))
         .force(
            'boundary',
            fb.default(-width / 2 + 20, -height / 2 + 20, width / 2 - 20, height / 2 - 20)
         );

      this.createLegend(width, height);

      this.container.current.append(this.svg.node());
      this.container.current.append(this.tooltip.node());
      this.updateGraph();
   }

   private updateGraph() {
      const links = this.clusterGraph
         .edges()
         .map((e) => this.clusterGraph.getEdgeAttributes(e) as any)
         .filter((e) => e.type == ClusterGraphLinkType.connection);
      const nodes = this.clusterGraph
         .nodes()
         .map((e) => this.clusterGraph.getNodeAttributes(e) as any);

      const simulation = this.simulation.nodes(nodes);
      this.simulation.force<d3.ForceLink<any, any>>('link').links(links);

      const linksData = this.linksGroup.selectAll<SVGPathElement, any>('.links').data(links);
      const linksEnter = linksData.enter().append('path').attr('class', 'links');
      this.linksData = linksData.merge(linksEnter);
      this.linksData.attr('stroke', (l) => this.getLinkColor(l));

      this.nodesGroup.selectAll('.node').remove();
      const nodesData = this.nodesGroup.selectAll<SVGGElement, any>('.node').data(nodes);
      const nodesEnter = nodesData
         .enter()
         .append('g')
         .attr('class', 'node')
         .on('mouseover', this.onMouseOverNode.rebind(this))
         .on('mousemove', this.onMouseMoveNode.rebind(this))
         .on('mouseleave', this.onMouseLeaveNode.rebind(this))
         .on('click', this.onClickNode.rebind(this));

      nodesEnter.call(
         d3
            .drag<SVGGElement, any>()
            .on('start', this.onNodeDragStarted.rebind(this))
            .on('drag', this.onNodeDragged.rebind(this))
            .on('end', this.onNodeDragEnded.rebind(this))
      );

      this.nodesData = nodesData.merge(nodesEnter);

      this.nodesData
         .attr('stroke', (n) => this.getNodeStroke(n))
         .attr('stroke-width', (n) => this.getNodeStrokeWidth(n));

      this.nodesData
         .filter((n) => n.type == ClusterGraphNodeType.node)
         .attr('fill', (n) => this.getNodeColor(n))
         .append('circle')
         .attr('r', (n) => this.props.nodeSizeByType.get(n.type));

      this.nodesData
         .filter((n) => n.type == ClusterGraphNodeType.nodeCluster)
         .attr('fill', (n) => this.getNodeColor(n))
         .append('rect')
         .attr('width', (n) => this.props.nodeSizeByType.get(n.type))
         .attr('height', (n) => this.props.nodeSizeByType.get(n.type));

      this.nodesData
         .filter((n) => n.type == ClusterGraphNodeType.link)
         .attr('fill', (n) => this.getNodeColor(n))
         .append('circle')
         .attr('r', (n) => this.props.nodeSizeByType.get(n.type));

      simulation.on('tick', () => {
         this.linksData.attr('d', (d) => {
            return `
                    M
                      ${d.source.x} ${d.source.y}
                    C
                      ${(d.source.x + d.target.x) / 2} ${d.source.y}
                      ${(d.source.x + d.target.x) / 2} ${d.target.y}
                      ${d.target.x} ${d.target.y}
                  `;
         });
         this.nodesGroup
            .selectAll('circle')
            .attr('cx', (d: any) => d.x)
            .attr('cy', (d: any) => d.y);
         const clusterSize = this.props.nodeSizeByType.get(ClusterGraphNodeType.nodeCluster);
         this.nodesGroup
            .selectAll('rect')
            .attr('x', (d: any) => d.x - clusterSize / 2)
            .attr('y', (d: any) => d.y - clusterSize / 2);
      });
   }

   private getNodeColor(node: ClusterGraphNode) {
      let color = '#' + this.props.data.colorByFtuName[node.ftuName].toString(16);
      if (!this.props.synchronizationService.selectedFtuName) return color;
      let isNodeInEgoGraph = false;
      if (
         node.type != ClusterGraphNodeType.nodeCluster &&
         this.props.synchronizationService.egoGraph.hasNode(node.id)
      ) {
         const nodeAttributes = this.props.synchronizationService.egoGraph.getNodeAttributes(
            node.id
         );
         color = this.props.synchronizationService.layerColorsNodes[nodeAttributes.depth];
         isNodeInEgoGraph = true;
      } else if (node.type == ClusterGraphNodeType.nodeCluster) {
         const cluster = node as D3NodeClusterNode;
         let lowestDepth = Number.MAX_VALUE;
         const connectingGroupSelected =
            this.props.synchronizationService.selectedFtuName == this.connectingGroupId;

         cluster.nodesList.forEach((clusterNode) => {
            let depth = Number.MAX_VALUE;
            if (!connectingGroupSelected) {
               if (!this.props.synchronizationService.egoGraph.hasNode(clusterNode)) return;
               depth =
                  this.props.synchronizationService.egoGraph.getNodeAttributes(clusterNode).depth;
            } else {
               const linkDepth =
                  this.props.synchronizationService.egoGraphDepthByLinks[clusterNode];
               if (linkDepth == undefined) return;
               depth = linkDepth;
            }
            lowestDepth = Math.min(lowestDepth, depth);
         });
         if (lowestDepth < Number.MAX_VALUE) {
            color = connectingGroupSelected
               ? this.props.synchronizationService.layerColorsLinks[lowestDepth]
               : this.props.synchronizationService.layerColorsNodes[lowestDepth];
            isNodeInEgoGraph = true;
         }
      }
      if (!isNodeInEgoGraph) {
         const linkDepth = this.props.synchronizationService.egoGraphDepthByLinks[node.id];
         if (linkDepth == undefined) color = '#999';
         else {
            color = this.props.synchronizationService.layerColorsLinks[linkDepth];
         }
      }
      return color;
   }

   private createLegend(width: number, height: number) {
      const groups = Object.keys(this.props.data.colorByFtuName).filter(
         (g) => this.props.data.clustering.ftuName != g
      );
      this.connectingGroupId = groups[0];
      groups.unshift(this.props.data.clustering.ftuName);
      this.legendDots = this.svg
         .selectAll('mydots')
         .data(groups)
         .enter()
         .append('circle')
         .attr('stroke', '#000')
         .attr('stroke-width', (d) => (d == this.connectingGroupId ? 2 : 1))
         .attr('cx', -width / 2 + 50)
         .attr('cy', function (d, i) {
            return height / 2 - groups.length * 25 + i * 25;
         })
         .attr('r', (d) =>
            this.props.data.clustering.ftuName == d
               ? this.props.nodeSizeByType.get(ClusterGraphNodeType.node)
               : this.props.nodeSizeByType.get(ClusterGraphNodeType.link)
         )
         .attr('fill', (d: any) => '#' + this.props.data.colorByFtuName[d].toString(16));

      const clusterSize = this.props.nodeSizeByType.get(ClusterGraphNodeType.nodeCluster);
      this.clusterDot = this.svg
         .append('rect')
         .attr('x', -width / 2 + 50 - clusterSize / 2)
         .attr('y', height / 2 - groups.length * 25 - clusterSize - 17)
         .attr('width', clusterSize)
         .attr('height', clusterSize)
         .attr(
            'fill',
            '#' + this.props.data.colorByFtuName[this.props.data.clustering.ftuName].toString(16)
         );

      this.legendLabels = this.svg
         .selectAll('mylabels')
         .data(groups)
         .enter()
         .append('text')
         .attr('fill', '#fff')
         .attr('x', -width / 2 + 70)
         .attr('y', function (d, i) {
            return height / 2 - groups.length * 25 + i * 25;
         })
         .text(function (d) {
            return d.toUpperCase();
         })
         .attr('text-anchor', 'left')
         .style('alignment-baseline', 'middle');
      this.svg
         .append('text')
         .attr('fill', '#fff')
         .attr('x', -width / 2 + 70)
         .attr('y', height / 2 - groups.length * 25 - clusterSize / 2 - 17)
         .text((this.props.data.clustering.ftuName + ' cluster').toUpperCase())
         .attr('text-anchor', 'left')
         .style('alignment-baseline', 'middle');
   }

   private getNodeStroke(d: ClusterGraphNode) {
      return this.props.synchronizationService.selectedId == d.id
         ? this.props.highlightColor
         : '#000';
   }

   private getNodeStrokeWidth(d: ClusterGraphNode) {
      return this.props.synchronizationService.selectedId == d.id ? 2 : 1;
   }

   private getLinkColor(d: any) {
      let color = '#' + this.props.data.colorByFtuName[this.connectingGroupId].toString(16);
      if (!this.props.synchronizationService.selectedFtuName) return color;
      const depthByLink = this.props.synchronizationService.egoGraphDepthByLinks;

      const connectingGroupSelected =
         this.props.synchronizationService.selectedFtuName == this.connectingGroupId;
      let depth = undefined;

      let determinedFromCluster = false;
      if (connectingGroupSelected) {
         const sourceAttr = this.clusterGraph.getNodeAttributes(d.source.id) as D3NodeClusterNode;
         const targetAttr = this.clusterGraph.getNodeAttributes(d.target.id) as D3NodeClusterNode;
         let cluster: D3NodeClusterNode | undefined = undefined;
         if (sourceAttr.type == ClusterGraphNodeType.nodeCluster) cluster = sourceAttr;
         if (targetAttr.type == ClusterGraphNodeType.nodeCluster) cluster = targetAttr;
         if (cluster != undefined) {
            let lowestDepth = Number.MAX_VALUE;
            cluster.nodesList.forEach((node) => {
               const linkDepth = depthByLink[node];
               if (linkDepth == undefined) return;
               lowestDepth = Math.min(lowestDepth, linkDepth);
            });
            if (lowestDepth < Number.MAX_VALUE) {
               depth = lowestDepth;
               determinedFromCluster = true;
            }
         }
      }
      if (!determinedFromCluster) {
         depth = depthByLink[d.source.id] ?? depthByLink[d.target.id];
      }
      if (depth != undefined) {
         color = this.props.synchronizationService.layerColorsLinks[depth];
      } else {
         color = '#999';
      }
      return color;
   }
}
