import React from 'react';
// import * as styles from './eog-graph-view.module.scss';
import * as d3 from 'd3';
import { NetworkData, NetworkNode } from '../data/network-data';
import { UndirectedGraph } from 'graphology';
import { SynchronizationService } from '../synchronization/synchronization-service';
import { create } from 'd3';
import { ColorHelper } from '../util/color-helper';
import { Subject, takeUntil } from 'rxjs';
import { Vector2 } from 'three';
import { CSSProperties } from 'react';

export const containerStyle: CSSProperties = {
  position: 'relative',
  flex: 1,
  width: '100%',
  height: '100%',
  display: 'flex',
};

export const tooltipStyle: CSSProperties = {
  position: 'absolute',
  display: 'none',
  margin: 0,
  color: 'black',
  backgroundColor: 'white',
  border: '2px solid black',
  borderRadius: 5,
  padding: 5,
};

export const graphContainerStyle: CSSProperties = {
  flex: 1,
  width: '100%',
  height: '100%',
};

export const alterSelectStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  color: 'white',
  position: 'absolute',
  top: 5,
  right: 5,
};

 
interface EgoGraphViewProps {
   data: NetworkData;
   graph: UndirectedGraph;
   synchronizationService: SynchronizationService;
   strokeWidth: number;
   highlightColor: string;
   maxLayer: number;
}

interface EgoGraphNode {
   [name: string]: any;
   depth: number;
   nrInDepth: number;
   x: number;
   y: number;
   angle: number;
}

interface EgoGraphLink {
   depth: number;
   uniqueLinks: NetworkNode[];
   source: string;
   sourceAngle: number;
   sourcePos: number[];
   edgeNrInDepth: number;
   targets: EgoGraphLinkTarget[];
   targetAngle: number;
   circleStartPos: number[];
}

interface EgoGraphLinkTarget {
   depth: number;
   target: string;
   targetPos: number[];
   targetAngle: number;
   circleEndPos: number[];
   links: NetworkNode[];
}

export default class EgoGraphView extends React.Component<EgoGraphViewProps, any> {
   public static defaultProps = {
      strokeWidth: 0.5,
      highlightColor: '#FFFFFF',
      maxLayer: 4
   };

   private unumounted$ = new Subject<void>();
   private container: React.RefObject<HTMLDivElement>;

   private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;
   private tooltip = create('div')
   .style('position', 'absolute')
   .style('display', 'none')
   .style('margin', '0')
   .style('color', 'black')
   .style('background-color', 'white')
   .style('border', '2px solid black')
   .style('border-radius', '5px')
   .style('padding', '5px');
   private nodes: d3.Selection<SVGCircleElement, EgoGraphNode, SVGGElement, undefined>;
   private curveStartLinks: d3.Selection<d3.BaseType | SVGPathElement, any, SVGGElement, undefined>;
   private curveArcLinks: d3.Selection<d3.BaseType | SVGPathElement, any, SVGGElement, undefined>;
   private curveEndlinks: d3.Selection<d3.BaseType | SVGPathElement, any, SVGGElement, undefined>;
   private curveEndDots: d3.Selection<SVGCircleElement, EgoGraphLinkTarget, SVGGElement, undefined>;
   private selectedId: string | undefined;
   private selectedGroupId: string;
   private linkWidth = 2;
   private maxLayer: number;

   constructor(props: EgoGraphViewProps) {
      super(props);
      this.container = React.createRef();
      this.maxLayer = this.props.maxLayer;
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
      const maxLayersOptions = [...Array(15).keys()]
         .filter((n) => n > 0)
         .map((n) => (
            <option value={n} key={n}>
               {n}
            </option>
         ));
      return (
         <div style={containerStyle}>
            <label style={alterSelectStyle}>
               Layers:
               <select defaultValue={this.maxLayer} onChange={this.onMaxLayerChange.bind(this)}>
                  {maxLayersOptions}
               </select>
            </label>
            <div style={graphContainerStyle} ref={this.container}></div>
         </div>
      );
   }

   componentDidMount(): void {
      this.selectId(undefined);
   }

   componentWillUnmount(): void {
      this.unumounted$.next();
      this.unumounted$.complete();
   }

   private onMaxLayerChange(event: React.ChangeEvent<HTMLSelectElement>) {
      this.maxLayer = parseInt(event.target.value);
      if (!this.selectedId) return;
      this.createGraph();
      this.highlightSelectedIds();
   }

   private updateNodeSelection(selectedId: string | undefined) {
      this.selectId(selectedId);
      if (selectedId != undefined) this.highlightSelectedIds();
   }

   private selectId(id: string | undefined) {
      if (id && id == this.selectedId) return;
      this.selectedId = id;
      if (this.selectedId) {
         this.selectedGroupId = this.props.graph.getNodeAttribute(id, 'groupId');
      }
      this.createGraph();
   }

   private onNodeDropped(id: string) {
      this.createGraph();
   }

   private highlightSelectedIds() {
      const selectedId = this.props.synchronizationService.selectedId;
      this.nodes
         .attr('r', (d: any) => (selectedId == d.id ? 10 : 7))
         .attr('stroke', (d: any) => (selectedId == d.id ? this.props.highlightColor : '#000'))
         .attr('stroke-width', (d: any) => (selectedId == d.id ? 2 : 1))
         .attr('fill', (d: any) => this.props.synchronizationService.layerColorsNodes[d.depth]);
   }

   private onHighlightIdEnter(id: string) {
      if (
         !this.props.synchronizationService.selectedFtuName ||
         !this.props.synchronizationService.egoGraph.hasNode(id)
      )
         return;
      const node = this.props.synchronizationService.egoGraph.getNodeAttributes(id);
      let color = this.props.synchronizationService.layerColorsNodes[node.depth];
      color = ColorHelper.lightenDarkenColorString(color, 50);
      this.nodes
         .filter((d) => d.id == id)
         .attr('fill', color)
         .attr('r', 10)
         .attr('stroke', this.props.highlightColor)
         .attr('stroke-width', 2);
   }

   private onHighlightIdLeave(id: string) {
      if (
         !this.props.synchronizationService.egoGraph ||
         !this.props.synchronizationService.egoGraph.hasNode(id) ||
         this.props.synchronizationService.selectedId == id
      )
         return;
      const node = this.props.synchronizationService.egoGraph.getNodeAttributes(id);
      const color = this.props.synchronizationService.layerColorsNodes[node.depth];
      this.nodes
         .filter((d) => d.id == id)
         .attr('fill', color)
         .attr('r', 7)
         .attr('stroke', '#000')
         .attr('stroke-width', 1);
   }

   private onMouseMoveTooltip(event: MouseEvent) {
      const [x, y] = d3.pointer(event, this.container.current);
      this.tooltip.style('left', x + 30 + 'px').style('top', y + 30 + 'px');
   }

   private onMouseOverNode(event: MouseEvent, d: EgoGraphNode) {
      this.props.synchronizationService.onHighlightEnter(d.id);
      let info = d.id;
      if (d.subComponents && d.subComponents.length > 1)
         info = [d.id + ':', ...d.subComponents].join('</br>');
      this.tooltip.style('display', 'block').html(info);
   }

   private onMouseLeaveNode(event: MouseEvent, d: EgoGraphNode) {
      this.props.synchronizationService.onHighlightLeave(d.id);
      this.tooltip.style('display', 'none');
   }

   private onMouseOverLink(event: MouseEvent, d: EgoGraphLink) {
      if (!this.props.synchronizationService.hasIntermediateConnections) return;
      const info = d.uniqueLinks.map((link: NetworkNode) => link.id).join('</br>');
      this.tooltip.style('display', 'block').html(info);
   }

   private onMouseLeaveLink(event: MouseEvent, d: EgoGraphLink) {
      if (!this.props.synchronizationService.hasIntermediateConnections) return;
      this.tooltip.style('display', 'none');
   }

   private onMouseOverLinkTarget(event: MouseEvent, d: EgoGraphLinkTarget) {
      if (!this.props.synchronizationService.hasIntermediateConnections) return;
      const info = d.links.map((link: NetworkNode) => link.id).join('</br>');
      this.tooltip.style('display', 'block').html(info);
   }

   private onMouseLeaveLinkTarget(event: MouseEvent, d: EgoGraphLinkTarget) {
      if (!this.props.synchronizationService.hasIntermediateConnections) return;
      this.tooltip.style('display', 'none');
   }

   private onClickNode(event: MouseEvent, d: EgoGraphNode) {
      this.props.synchronizationService.onNodeClicked(
         d.id,
         event.ctrlKey,
         event.altKey,
         event.shiftKey
      );
      event.stopPropagation();
   }

   private onClickLink(event: MouseEvent, d: EgoGraphLink) {
      this.props.synchronizationService.onNodeClicked(
         d.uniqueLinks[0].id,
         event.ctrlKey,
         event.altKey
      );
      event.stopPropagation();
   }

   private onClickLinkTarget(event: MouseEvent, d: EgoGraphLinkTarget) {
      this.props.synchronizationService.onNodeClicked(
         d.links[0].id,
         event.ctrlKey,
         event.altKey
      );
      event.stopPropagation();
   }

   private createGraph() {
      this.container.current.innerHTML = '';
      this.tooltip.style('display', 'none');
      const width = this.container.current.offsetWidth;
      const height = this.container.current.offsetHeight;

      this.svg = create('svg')
         .attr('style', 'max-width: 100%; height: auto;')
         .attr('width', width)
         .attr('height', height)
         .attr('viewBox', [-width / 2, -height / 2, width, height]);

      this.createLegend(width, height);

      let totalDepth = this.selectedId
         ? this.props.synchronizationService.egoGraph.getAttribute('depth')
         : 4;
      totalDepth = Math.min(totalDepth, this.maxLayer + 1);
      const circleRadius = (Math.min(width, height) - 60) / (2 * totalDepth);

      for (let i = totalDepth; i > 0; i--) {
         this.svg
            .append('circle')
            .attr('r', circleRadius * i)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', this.props.synchronizationService.layerColorsGray[i - 1]);
      }

      this.container.current.append(this.tooltip.node());
      this.container.current.append(this.svg.node());
      if (!this.selectedId) return;

      const nodes = this.createNodesFromEgoGraph(circleRadius, this.maxLayer);
      const links = this.createLinksFromNodes(nodes, circleRadius, this.maxLayer);
      const linkTargets = links.map((l) => l.targets).flat();

      const curveStartLink = d3
         .link(d3.curveBasis)
         .source((d: any) => d.sourcePos)
         .target((d: any) => d.circleStartPos);
      this.curveStartLinks = this.svg
         .append('g')
         .attr('stroke-width', this.linkWidth + this.props.strokeWidth * 2)
         .attr('stroke', 'black')
         .selectAll('curveStartLine')
         .data(links as any[])
         .join('path')
         .attr('d', curveStartLink);
      this.svg
         .append('g')
         .attr('stroke-width', this.linkWidth)
         .selectAll('curveStartLine')
         .data(links as any[])
         .join('path')
         .attr(
            'stroke',
            (d: any) => this.props.synchronizationService.layerColorsLinks[d.depth + 1]
         )
         .attr('d', curveStartLink)
         .on('mouseover', (event: MouseEvent, d: EgoGraphLink) => this.onMouseOverLink(event, d))
         .on('mouseleave', (event: MouseEvent, d: EgoGraphLink) => this.onMouseLeaveLink(event, d))
         .on('mousemove', (event: MouseEvent) => this.onMouseMoveTooltip(event))
         .on('click', (event: MouseEvent, d: EgoGraphLink) => this.onClickLink(event, d));

      const curveEndLink = d3
         .link(d3.curveBasis)
         .source((d: any) => d.targetPos)
         .target((d: any) => d.circleEndPos);
      this.curveEndlinks = this.svg
         .append('g')
         .attr('stroke-width', this.linkWidth + this.props.strokeWidth * 2)
         .attr('stroke', 'black')
         .selectAll('curveEndLine')
         .data(linkTargets as any[])
         .join('path')
         .attr('d', curveEndLink);
      this.svg
         .append('g')
         .attr('stroke-width', this.linkWidth)
         .selectAll('curveEndLine')
         .data(linkTargets as any[])
         .join('path')
         .attr(
            'stroke',
            (d: any) => this.props.synchronizationService.layerColorsLinks[d.depth + 1]
         )
         .attr('d', curveEndLink)
         .on('mouseover', (event: MouseEvent, d: EgoGraphLinkTarget) => this.onMouseOverLinkTarget(event, d))
         .on('mouseleave', (event: MouseEvent, d: EgoGraphLinkTarget) => this.onMouseLeaveLinkTarget(event, d))
         .on('mousemove', (event: MouseEvent) => this.onMouseMoveTooltip(event))
         .on('click', (event: MouseEvent, d: EgoGraphLinkTarget) => this.onClickLinkTarget(event, d));

      const curveArc = d3
         .arc()
         .outerRadius((d: any) => d.radius + this.linkWidth / 2 + this.props.strokeWidth)
         .innerRadius((d: any) => d.radius - (this.linkWidth / 2 + this.props.strokeWidth))
         .startAngle((d: any) => d.sourceAngle + Math.PI / 2)
         .endAngle((d: any) => d.targetAngle + Math.PI / 2);
      this.curveArcLinks = this.svg
         .append('g')
         .attr('stroke-width', 0.5)
         .attr('stroke', 'black')
         .selectAll('linkCurve')
         .data(links as any[])
         .join('path')
         .attr(
            'fill',
            (d: any) => this.props.synchronizationService.layerColorsLinks[d.depth + 1]
         )
         .attr('d', curveArc)
         .on('mouseover', (event: MouseEvent, d: EgoGraphLink) => this.onMouseOverLink(event, d))
         .on('mouseleave', (event: MouseEvent, d: EgoGraphLink) => this.onMouseLeaveLink(event, d))
         .on('mousemove', (event: MouseEvent) => this.onMouseMoveTooltip(event))
         .on('click', (event: MouseEvent, d: EgoGraphLink) => this.onClickLink(event, d));

      this.curveEndDots = this.svg
         .append('g')
         .attr('stroke-width', this.props.strokeWidth)
         .attr('stroke', 'black')
         .selectAll('curveEndDots')
         .data(linkTargets)
         .enter()
         .append('circle')
         .attr('r', 4)
         .attr('cx', (d: any) => d.circleEndPos[0])
         .attr('cy', (d: any) => d.circleEndPos[1])
         .attr(
            'fill',
            (d: any) => this.props.synchronizationService.layerColorsLinks[d.depth + 1]
         )
         .on('mouseover', (event: MouseEvent, d: EgoGraphLinkTarget) => this.onMouseOverLinkTarget(event, d))
         .on('mouseleave', (event: MouseEvent, d: EgoGraphLinkTarget) => this.onMouseLeaveLinkTarget(event, d))
         .on('mousemove', (event: MouseEvent) => this.onMouseMoveTooltip(event))
         .on('click', (event: MouseEvent, d: EgoGraphLinkTarget) => this.onClickLinkTarget(event, d));

      this.nodes = this.svg
         .append('g')
         .attr('stroke', '#000')
         .attr('stroke-width', 1)
         .selectAll('circle')
         .data(nodes)
         .enter()
         .append('circle')
         .attr('r', 7)
         .attr('cx', (d: any) => d.x)
         .attr('cy', (d: any) => d.y)
         .attr('fill', (d: any) => this.props.synchronizationService.layerColorsNodes[d.depth])
         .on('mouseover', (event: MouseEvent, d: EgoGraphNode) => this.onMouseOverNode(event, d))
         .on('mousemove', (event: MouseEvent) => this.onMouseMoveTooltip(event))
         .on('mouseleave', (event: MouseEvent, d: EgoGraphNode) => this.onMouseLeaveNode(event, d))
         .on('click', (event: MouseEvent, d: EgoGraphNode) => this.onClickNode(event, d));
   }

   private createLegend(width: number, height: number) {
      if (!this.selectedId) return;
      const colors = this.props.synchronizationService.layerColorsNodes;
      const size = 30;
      const storkeWidth = 1;
      this.svg
         .selectAll('colorrects')
         .data(colors)
         .enter()
         .append('rect')
         .attr('width', size)
         .attr('height', size)
         .attr('x', -width / 2 + 50 - size / 2)
         .attr('y', function (d, i) {
            return -height / 2 + i * size;
         })
         .attr('stroke', '#fff')
         .attr('stroke-width', storkeWidth)
         .style('fill', (d: any) => d);

      this.svg
         .selectAll('mylabels')
         .data(colors)
         .enter()
         .append('text')
         .attr('fill', (d) => '#fff')
         .attr('x', -width / 2 + 50 - size / 2 + 2)
         .attr('y', function (d, i) {
            return -height / 2 + i * size + 2;
         })
         .text(function (d, i) {
            return i.toString();
         })
         .attr('text-anchor', 'center')
         .style('alignment-baseline', 'before-edge');
   }

   private createNodesFromEgoGraph(circleRadius: number, maxDepth: number): EgoGraphNode[] {
      const nodeCountByDepth =
         this.props.synchronizationService.egoGraph.getAttribute('nodeCountByDepth');
      const nodes: any = this.props.synchronizationService.egoGraph
         .mapNodes((n, attributes) => {
            if (attributes.depth > maxDepth) return false;
            const angleStepsize = (2 * Math.PI) / nodeCountByDepth[attributes.depth];
            const distanceToNode =
               attributes.depth == 0 ? 0 : circleRadius * (attributes.depth + 1) - circleRadius / 2;
            const angle = angleStepsize * attributes.nrInDepth;
            const x = Math.cos(angle) * distanceToNode;
            const y = Math.sin(angle) * distanceToNode;
            return {
               ...attributes,
               x: x,
               y: y,
               angle: angle
            };
         })
         .filter((n): n is EgoGraphNode => Boolean(n))
      return nodes;
   }

   private createLinksFromNodes(
      nodes: EgoGraphNode[],
      circleRadius: number,
      maxDepth: number
   ): EgoGraphLink[] {
      const linksBySource: { [id: string]: EgoGraphLink } = {};
      this.props.synchronizationService.egoGraph.mapEdges((e, attributes) => {
         const sourceNode = nodes.filter((n: EgoGraphNode) => n.id == attributes.source)[0];
         const targetNode = nodes.filter((n: EgoGraphNode) => n.id == attributes.target)[0];
         if ((sourceNode && sourceNode.depth > maxDepth) || !targetNode) return;
         const link =
            linksBySource[attributes.source] ??
            ({
               depth: sourceNode.depth,
               source: attributes.source,
               sourceAngle: sourceNode.angle,
               sourcePos: [sourceNode.x, sourceNode.y],
               edgeNrInDepth: Number.MAX_VALUE,
               targets: [] as EgoGraphLinkTarget[]
            } as EgoGraphLink);
         link.targets = [
            ...link.targets,
            {
               depth: sourceNode.depth,
               target: attributes.target,
               targetPos: [targetNode.x, targetNode.y],
               targetAngle: targetNode.angle,
               links: attributes.links
            } as EgoGraphLinkTarget
         ];
         linksBySource[attributes.source] = link;
         return attributes;
      });

      const edgeCountByDepth: { [depth: number]: number } = {};
      Object.values(linksBySource).forEach((link) => {
         const edgeCount = edgeCountByDepth[link.depth] ?? 0;
         link.edgeNrInDepth = edgeCount;
         edgeCountByDepth[link.depth] = edgeCount + 1;
         link.uniqueLinks = link.targets
            .map((target: EgoGraphLinkTarget) => target.links)
            .flat()
            .filter(
               (value: NetworkNode, index: number, array: NetworkNode[]) =>
                  array.indexOf(value) === index
            );
      });

      return Object.values(linksBySource).map((link) => {
         const distanceToNextNodes = link.depth == 0 ? (3 * circleRadius) / 2 : circleRadius;
         const sourcePosition = new Vector2(link.sourcePos[0], link.sourcePos[1]);
         const radialStartDirection =
            link.depth == 0 ? new Vector2(1, 0) : new Vector2().copy(sourcePosition).normalize();
         const radialStepSize = (distanceToNextNodes - 14) / (edgeCountByDepth[link.depth] + 1);
         const radialHeight = radialStepSize * (link.edgeNrInDepth + 1) + 7;
         const circleStartPos = new Vector2()
            .copy(radialStartDirection)
            .multiplyScalar(radialHeight)
            .add(sourcePosition);

         const anglesToCover = [
            link.sourceAngle,
            ...Array.from(link.targets).map((t: EgoGraphLinkTarget) => t.targetAngle)
         ];
         const sortedAngles = anglesToCover.sort((a: number, b: number) => a - b);
         let startAngle = link.sourceAngle;
         let endAngle = sortedAngles[1];
         let maxTargetAngleDiff = 0;
         for (let i = 0; i < sortedAngles.length; i++) {
            const angle = sortedAngles[i];
            let previousAngle = sortedAngles[i - 1];
            let angleDifference: number;
            let crossesZero = false;
            if (previousAngle == undefined) {
               previousAngle = sortedAngles[sortedAngles.length - 1];
               angleDifference = angle + (2 * Math.PI - previousAngle);
               crossesZero = true;
            } else angleDifference = angle - previousAngle;
            if (angleDifference > maxTargetAngleDiff) {
               maxTargetAngleDiff = angleDifference;
               startAngle = previousAngle;
               endAngle = !crossesZero ? angle - 2 * Math.PI : angle;
            }
         }
         Array.from(link.targets).forEach((target: EgoGraphLinkTarget) => {
            const targetPosition = new Vector2(target.targetPos[0], target.targetPos[1]);
            const radialEndDirection = new Vector2().sub(targetPosition).normalize();
            const circleEndPos = new Vector2()
               .copy(radialEndDirection)
               .multiplyScalar(distanceToNextNodes - radialHeight)
               .add(targetPosition);
            target.circleEndPos = [circleEndPos.x, circleEndPos.y];
         });
         link.sourceAngle = startAngle;
         return {
            ...link,
            targetAngle: endAngle,
            radius: circleStartPos.length(),
            circleStartPos: [circleStartPos.x, circleStartPos.y]
         } as EgoGraphLink;
      });
   }
}
