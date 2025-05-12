import React from 'react';
// import * as styles from './force-directed-graph-view.module.scss';
import * as d3 from 'd3';
import { create } from 'd3';
import { NetworkData, NetworkNode } from '../data/network-data';
import { ColorHelper } from '../util/color-helper';
import { UndirectedGraph } from 'graphology';
import { SynchronizationService } from '../synchronization/synchronization-service';
import { Subject, takeUntil } from 'rxjs';
import * as fb from 'd3-force-boundary';

// Extend NetworkNode with D3.js simulation properties
interface SimulationNode extends NetworkNode {
   x?: number;
   y?: number;
   fx?: number | null;
   fy?: number | null;
   vx?: number;
   vy?: number;
}

// Add this at the top of your file
Function.prototype.rebind = function(context) {
   return (...args) => this.apply(context, args);
};

export const containerStyle: React.CSSProperties = {
   position: 'relative',
   flex: 1,
   width: '100%',
   height: '100%',
 };
 
 export const tooltipStyle: React.CSSProperties = {
   position: 'absolute',
   display: 'none',
   margin: 0,
   color: 'black',
   backgroundColor: 'white',
   border: '2px solid black',
   borderRadius: '5px',
   padding: '5px',
 };
 
 export const mousePointerStyle: React.CSSProperties = {
   cursor: 'pointer',
 };

interface ForceDirectedGraphProps {
   data: NetworkData;
   graph: UndirectedGraph;
   synchronizationService: SynchronizationService;
   highlightColor: string;
}

export default class ForceDirectedGraphView extends React.Component<ForceDirectedGraphProps, any> {
   public static defaultProps = {
      highlightColor: '#FFFFFF'
   };
   private unumounted$ = new Subject<void>();
   private container: React.RefObject<HTMLDivElement>;

   private svg = d3.create('svg').attr('style', 'max-width: 100%; height: auto;');
   private tooltip = create('div')
   .style('position', 'absolute')
   .style('display', 'none')
   .style('margin', '0')
   .style('color', 'black')
   .style('background-color', 'white')
   .style('border', '2px solid black')
   .style('border-radius', '5px')
   .style('padding', '5px');
   private nodes: d3.Selection<SVGCircleElement, SimulationNode, SVGGElement, undefined>;
   private links: d3.Selection<d3.BaseType | SVGLineElement, any, SVGGElement, undefined>;
   private legendDots: d3.Selection<SVGCircleElement, string, SVGSVGElement, undefined>;
   private legendLabels: d3.Selection<SVGTextElement, string, SVGSVGElement, undefined>;
   private simulation: d3.Simulation<SimulationNode, undefined>;
   private connectingGroupId: string;

   constructor(props: ForceDirectedGraphProps) {
      super(props);
      this.container = React.createRef();
      this.props.synchronizationService.onSelectedIdsChange$
         .pipe(takeUntil(this.unumounted$))
         .subscribe(this.updateNodeSelection.bind(this));
      this.props.synchronizationService.onNodeDropped$
         .pipe(takeUntil(this.unumounted$))
         .subscribe(this.onNodeDropped.bind(this));
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

   private onHighlightIdEnter(id: string) {
      let highlightedIds = [id];
      if (!this.props.graph.hasNode(id)) {
         if (this.props.synchronizationService.clusterGraph) {
            const cluster = this.props.synchronizationService.clusterGraph.getNodeAttributes(id);
            highlightedIds = [...cluster.nodesList];
         } else if (this.props.synchronizationService.egoGraph && this.props.synchronizationService.egoGraph.hasNode(id)) {
            // If the node is in the ego graph, highlight it in the main graph
            highlightedIds = [id];
         }
      }
      highlightedIds.forEach((id) => {
         const node = this.props.graph.getNodeAttributes(id);
         let color = this.getNodeColor(node as NetworkNode);
         color = ColorHelper.lightenDarkenColorString(color, 50);
         this.nodes
            .filter((d) => d.id == id)
            .attr('fill', color)
            .attr('r', (d: any) => Math.max(7, this.getNodeRadius(d)))
            .attr('stroke', this.props.highlightColor)
            .attr('stroke-width', 2);
      });
   }

   private onHighlightIdLeave(id: string) {
      if (this.props.synchronizationService.selectedId == id) return;
      let highlightedIds = [id];
      if (!this.props.graph.hasNode(id)) {
         if (this.props.synchronizationService.clusterGraph) {
            const cluster = this.props.synchronizationService.clusterGraph.getNodeAttributes(id);
            highlightedIds = [...cluster.nodesList];
         } else if (this.props.synchronizationService.egoGraph && this.props.synchronizationService.egoGraph.hasNode(id)) {
            // If the node is in the ego graph, unhighlight it in the main graph
            highlightedIds = [id];
         }
      }
      highlightedIds.forEach((id) => {
         this.nodes
            .filter((d) => d.id == id)
            .attr('fill', (d) => this.getNodeColor(d))
            .attr('r', (d: NetworkNode) => this.getNodeRadius(d))
            .attr('stroke', '#000')
            .attr('stroke-width', 1);
      });
   }

   private onMouseOverNode(event: MouseEvent, d: NetworkNode) {
      this.props.synchronizationService.onHighlightEnter(d.id);
      let info = d.id;
      if (d.subComponents && d.subComponents.length > 1)
         info = [d.id + ':', ...d.subComponents].join('</br>');
      this.tooltip.style('display', 'block').html(info);
   }

   private onMouseMoveNode(event: MouseEvent, d: NetworkNode) {
      const [x, y] = d3.pointer(event, this.container.current);
      this.tooltip.style('left', x + 30 + 'px').style('top', y + 30 + 'px');
   }

   private onMouseLeaveNode(event: MouseEvent, d: NetworkNode) {
      this.props.synchronizationService.onHighlightLeave(d.id);
      this.tooltip.style('display', 'none');
   }

   private onNodeDragStarted(event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>, d: SimulationNode) {
      if (!event.active) this.simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
   }

   private onNodeDragged(event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>, d: SimulationNode) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
   }

   private onNodeDragEnded(event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>, d: SimulationNode) {
      if (!event.active) this.simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
   }

   private onClickNode(event: MouseEvent, d: NetworkNode) {
      this.props.synchronizationService.onNodeClicked(
         d.id,
         event.ctrlKey,
         event.altKey,
         event.shiftKey
      );
      event.stopPropagation();
   }

   private onSvgClicked(event: MouseEvent) {
      this.props.synchronizationService.onNodeClicked(undefined);
      this.nodes
         .attr('stroke', '#000')
         .attr('stroke-width', 1)
         .attr('r', (d: NetworkNode) => this.getNodeRadius(d))
         .attr('fill', (d: any) => '#' + this.props.data.colorByFtuName[d.ftuName].toString(16));
      this.links
         .attr('stroke', (d: any) => {
            if (!this.props.synchronizationService.hasIntermediateConnections) {
               return '#666';
            }
            const sourceFtuName = d.source.ftuName;
            const targetFtuName = d.target.ftuName;
            if (sourceFtuName === this.connectingGroupId || targetFtuName === this.connectingGroupId) {
               return '#' + this.props.data.colorByFtuName[this.connectingGroupId].toString(16);
            }
            return '#666';
         });
   }

   private onNodeDropped(id: string) {
      this.nodes.filter((d) => d.id == id).remove();
      this.links.filter((d) => d.source.id == id || d.target.id == id).remove();
      this.tooltip.style('display', 'none');
   }

   private updateNodeSelection(selectedId: string | undefined) {
      if (selectedId == undefined) {
         this.legendDots
            .attr('r', 7)
            .attr('fill', (d) => '#' + this.props.data.colorByFtuName[d].toString(16));
      } else {
         this.legendDots
            .attr('r', (d) => (this.connectingGroupId == d ? 3 : 7))
            .attr('fill', '#fff');
      }
      this.nodes
         .attr('r', (d: any) => (selectedId == d.id ? 7 : this.getNodeRadius(d)))
         .attr('stroke', (d: any) => (selectedId == d.id ? this.props.highlightColor : '#000'))
         .attr('stroke-width', (d: any) => (selectedId == d.id ? 2 : 1))
         .attr('fill', (d: any) => this.getNodeColor(d));
      this.links.attr('stroke', (d: any) => this.getLinkColor(d));
   }

   private createGraph() {
      const width = this.container.current.offsetWidth;
      const height = this.container.current.offsetHeight;

      const links = this.props.data.links.map((d: any) => ({ ...d }));
      const nodes = this.props.data.nodes.map((d: any) => ({ ...d }));

      this.simulation = d3
         .forceSimulation(nodes)
         .force(
            'link',
            d3.forceLink(links).id((d: any) => d.id)
         )
         .force('charge', d3.forceManyBody().strength(-250))
         .force('y', d3.forceY(0).strength((width / height) * 0.1))
         .force(
            'boundary',
            fb.default(-width / 2 + 20, -height / 2 + 20, width / 2 - 20, height / 2 - 20)
         );

      this.svg
         .attr('width', width)
         .attr('height', height)
         .attr('viewBox', [-width / 2, -height / 2, width, height])
         .on('click', (event: MouseEvent) => this.onSvgClicked(event));

      this.createLegend(width, height);
      this.links = this.svg
         .append('g')
         .attr('stroke-width', 1.5)
         .attr('stroke-opacity', 1)
         .attr('fill', 'none')
         .selectAll('line')
         .data(links)
         .join('path')
         .attr('stroke', (d: any) => this.getLinkColor(d));

      this.nodes = this.svg
         .append('g')
         .attr('stroke', '#000')
         .attr('stroke-width', 1)
         .selectAll('circle')
         .data(nodes)
         .enter()
         .append('circle')
         .attr('r', (d: NetworkNode) => this.getNodeRadius(d))
         .attr(
            'fill',
            (node: NetworkNode) => '#' + this.props.data.colorByFtuName[node.ftuName].toString(16)
         )
         .on('mouseover', (event: MouseEvent, d: NetworkNode) => this.onMouseOverNode(event, d))
         .on('mousemove', (event: MouseEvent, d: NetworkNode) => this.onMouseMoveNode(event, d))
         .on('mouseleave', (event: MouseEvent, d: NetworkNode) => this.onMouseLeaveNode(event, d))
         .on('click', (event: MouseEvent, d: NetworkNode) => this.onClickNode(event, d));

      this.nodes.call(
         d3.drag<SVGCircleElement, SimulationNode>()
            .on('start', (event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>, d: SimulationNode) => this.onNodeDragStarted(event, d))
            .on('drag', (event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>, d: SimulationNode) => this.onNodeDragged(event, d))
            .on('end', (event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>, d: SimulationNode) => this.onNodeDragEnded(event, d))
      );
          

      this.simulation.on('tick', () => {
         this.links.attr('d', (d) => {
            return `
              M 
                ${d.source.x} ${d.source.y} 
              C 
                ${(d.source.x + d.target.x) / 2} ${d.source.y} 
                ${(d.source.x + d.target.x) / 2} ${d.target.y} 
                ${d.target.x} ${d.target.y}
            `;
         });
         // .attr('x1', (d: any) => d.source.x)
         // .attr('y1', (d: any) => d.source.y)
         // .attr('x2', (d: any) => d.target.x)
         // .attr('y2', (d: any) => d.target.y);
         this.nodes.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      });

      this.container.current.append(this.tooltip.node());
      this.container.current.append(this.svg.node());
   }

   private createLegend(width: number, height: number) {
      const groups = Object.keys(this.props.data.colorByFtuName);
      this.connectingGroupId = this.props.synchronizationService.hasIntermediateConnections
         ? groups[1]
         : '';
      this.legendDots = this.svg
         .selectAll('mydots')
         .data(groups)
         .enter()
         .append('circle')
         .attr('class', 'mouse-pointer')
         .attr('stroke', (d) => (d == this.connectingGroupId ? this.props.highlightColor : '#000'))
         .attr('stroke-width', (d) => (d == this.connectingGroupId ? 2 : 1))
         .attr('cx', -width / 2 + 50)
         .attr('cy', function (d, i) {
            return height / 2 - groups.length * 25 + i * 25;
         })
         .attr('r', 7)
         .attr('fill', (d: any) => '#' + this.props.data.colorByFtuName[d].toString(16))
         .on('click', this.onLegendClick.rebind(this));

      this.legendLabels = this.svg
         .selectAll('mylabels')
         .data(groups)
         .enter()
         .append('text')
         .attr('class', 'mouse-pointer')
         .attr('fill', (d) => (d == this.connectingGroupId ? '#fff' : '#aaa'))
         .attr('x', -width / 2 + 70)
         .attr('y', function (d, i) {
            return height / 2 - groups.length * 25 + i * 25;
         })
         .text(function (d) {
            return d.toUpperCase();
         })
         .attr('text-anchor', 'left')
         .style('alignment-baseline', 'middle')
         .on('click', this.onLegendClick.rebind(this));
   }

   private onLegendClick(element: any, event: PointerEvent, data: any) {
      if (!this.props.synchronizationService.hasIntermediateConnections) return;
      this.connectingGroupId = data;
      this.legendDots
         .attr('stroke', (d) => (d == this.connectingGroupId ? this.props.highlightColor : '#000'))
         .attr('stroke-width', (d) => (d == this.connectingGroupId ? 2 : 1));
      this.legendLabels.attr('fill', (d) => (d == this.connectingGroupId ? '#fff' : '#aaa'));
   }

   private getNodeRadius(d: NetworkNode) {
      if (d.ftuName != this.connectingGroupId) return 7;
      return 4; // + Math.log2(this.props.graph.neighbors(d.id).length);
   }

   private getNodeColor(d: NetworkNode) {
      let color = '#' + this.props.data.colorByFtuName[d.ftuName].toString(16);
      if (!this.props.synchronizationService.selectedFtuName) return color;
      const egoGraph = this.props.synchronizationService.egoGraph;
      if (!egoGraph) return color;
      if (egoGraph.hasNode(d.id)) {
         const node = egoGraph.getNodeAttributes(d.id);
         color = this.props.synchronizationService.layerColorsNodes[node.depth];
      } else {
         const linkDepth = this.props.synchronizationService.egoGraphDepthByLinks[d.id];
         if (linkDepth == undefined) color = '#999';
         else color = this.props.synchronizationService.layerColorsLinks[linkDepth];
      }
      return color;
   }
   private getLinkColor(d: any) {
      if (!this.props.synchronizationService.selectedFtuName) {
         if (!this.props.synchronizationService.hasIntermediateConnections) return '#666';
         return '#' + this.props.data.colorByFtuName[this.connectingGroupId].toString(16);
      }
      const depthByLink = this.props.synchronizationService.egoGraphDepthByLinks;
      if (!depthByLink) return '#999';
      const depth = depthByLink[d.source.id] ?? depthByLink[d.target.id];
      let color = '#999';
      if (depth != undefined && this.props.synchronizationService.layerColorsLinks) {
         color = this.props.synchronizationService.layerColorsLinks[depth];
      }
      return color;
   }
}
