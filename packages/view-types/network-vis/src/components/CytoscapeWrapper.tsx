import React, { useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import cytoscapeLasso from 'cytoscape-lasso';
import cytoscapeContextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import Graph from 'graphology';

// Register the plugins
(cytoscape as any).use(cytoscapeLasso);
(cytoscape as any).use(cytoscapeContextMenus);

interface Node {
  id: string;
  ftuName: string;
  subComponents?: string[];
}

interface Link {
  source: string;
  target: string;
}

interface CytoscapeWrapperProps {
  nodes: Node[];
  links: Link[];
  onNodeSelect: (nodeIds: string[], hopDistance?: number, currentAdditionalCellSets?: any, currentCellSetColor?: any, currentCellSetSelection?: any, appendToSelection?: boolean) => any;
  obsSetSelection: string[][];
  obsHighlight: string | null;
  cyRef: React.MutableRefObject<any>;
  cellColors: Map<string, [number, number, number]>;
}

const createElements = (
  nodes: Node[],
  links: Link[],
  nodeColor: (n: Node) => string,
  nodeSize: number,
  cellColors: Map<string, [number, number, number]>
) => [
  ...nodes.map(node => {
    let borderColor = '#999';
    let hasCellColor = false;
    if (node.ftuName === 'nerves' && node.id.startsWith('merged_') && node.subComponents) {
      const coloredSubComponent = node.subComponents.find(subId => cellColors.has(subId));
      if (coloredSubComponent) {
        borderColor = `rgb(${cellColors.get(coloredSubComponent)?.join(',')})`;
        hasCellColor = true;
      }
    } else if (cellColors.has(node.id)) {
      borderColor = `rgb(${cellColors.get(node.id)?.join(',')})`;
      hasCellColor = true;
    }

    return {
      data: {
        id: node.id,
        color: nodeColor(node),
        borderColor,
        size: nodeSize,
        ftuName: node.ftuName,
        subComponents: node.subComponents,
        opacity: cellColors.has(node.id) ? 1 : 0.3,
        cellColors: hasCellColor
      }
    };
  }),
  ...links.map(link => ({
    data: {
      source: link.source,
      target: link.target
    }
  }))
];

const stylesheet = [
  {
    selector: 'node',
    style: {
      'background-color': 'data(color)',
      'border-color': 'data(borderColor)',
      'border-width': '4px',
      'width': '15',
      'height': '15',
      'opacity': 'data(opacity)'
    }
  },
  {
    selector: 'node:selected',
    style: {
      'width': '25',
      'height': '25',
      'border-width': '6px',
      'opacity': '1'
    }
  },
  {
    selector: 'node.hovered',
    style: {
      'border-width': '8px',
      'border-color': '#ffffff',
      'border-style': 'solid',
      'width': '25',
      'height': '25',
      'opacity': '1'
    }
  },
  {
    selector: 'node[?cellColors]',
    style: {
      'border-width': '6px',
      'opacity': '1'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': '1',
      'line-color': '#999',
      'curve-style': 'straight'
    }
  }
];

const nodeColor = (n: Node) => n.ftuName === 'glomeruli' ? 'red' : 'yellow';

const CytoscapeWrapper: React.FC<CytoscapeWrapperProps> = ({
  nodes,
  links,
  onNodeSelect,
  obsSetSelection,
  obsHighlight,
  cyRef,
  cellColors
}) => {
  const selectionTimeoutRef = React.useRef<number | null>(null);

  // Function to find neighbors at a specific hop distance
  const findNeighborsAtHopDistance = (startNode: any, maxHops: number = 10, sameTypeOnly: boolean = false) => {
    const visited = new Set<string>();
    const result = new Map<number, Set<string>>();
    const queue: { node: any; distance: number }[] = [{ node: startNode, distance: 0 }];
    const startNodeType = startNode.data('ftuName');

    for (let i = 1; i <= maxHops; i++) {
      result.set(i, new Set());
    }

    while (queue.length > 0) {
      const { node, distance } = queue.shift()!;
      const nodeId = node.id();

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const connectedNodes = node.neighborhood('node');

      connectedNodes.forEach((neighbor: any) => {
        const neighborId = neighbor.id();
        if (!visited.has(neighborId)) {
          if (!sameTypeOnly || neighbor.data('ftuName') === startNodeType) {
            if (distance + 1 <= maxHops) {
              result.get(distance + 1)!.add(neighborId);
            }
          }
          queue.push({ node: neighbor, distance: distance + 1 });
        }
      });
    }

    for (const [distance, nodes] of result.entries()) {
      if (nodes.size === 0) {
        result.delete(distance);
      }
    }

    return result;
  };

  // Initialize context menu
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    const contextMenuItems = [
      {
        id: 'show-same-type-neighbors',
        content: 'Show neighbors of same type',
        selector: 'node',
        onClickFunction: async (event: any) => {
          const node = event.target;
          const neighbors = findNeighborsAtHopDistance(node, 10, true);

          const hopDistances = Array.from(neighbors.keys()).sort((a, b) => a - b);

          const nodeData = node.data();
          const selectedNodeIds: string[] = [];
          if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
            nodeData.subComponents.forEach((subId: string) => {
              selectedNodeIds.push(subId);
            });
          } else {
            selectedNodeIds.push(node.id());
          }

          const selections: { nodeIds: string[], hopDistance?: number }[] = [];

          if (selectedNodeIds.length > 0) {
            selections.push({ nodeIds: selectedNodeIds, hopDistance: 0 });
          }

          for (const hopDistance of hopDistances) {
            const nodeIds = neighbors.get(hopDistance);
            if (nodeIds && nodeIds.size > 0) {
              const hopNodeIds: string[] = [];
              nodeIds.forEach(id => {
                const node = cyRef.current.getElementById(id);
                if (node.length > 0) {
                  const nodeData = node.data();
                  if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
                    nodeData.subComponents.forEach((subId: string) => {
                      hopNodeIds.push(subId);
                    });
                  } else {
                    hopNodeIds.push(id);
                  }
                }
              });
              if (hopNodeIds.length > 0) {
                selections.push({ nodeIds: hopNodeIds, hopDistance });
              }
            }
          }

          let latestAdditionalCellSets: any = null;
          let latestCellSetColor: any = null;
          let latestCellSetSelection: any = null;

          // Step 1: Clear all existing selections before starting
          await new Promise<void>((resolve) => {
            const result = onNodeSelect([], 0, latestAdditionalCellSets, latestCellSetColor, latestCellSetSelection, false);
            if (result) {
              latestAdditionalCellSets = result.nextAdditionalCellSets;
              latestCellSetColor = result.nextCellSetColor;
              latestCellSetSelection = result.nextCellSetSelection;
            }
            setTimeout(resolve, 0);
          });

          // Step 2: Accumulate hop distance selections
          for (const selection of selections) {
            await new Promise<void>((resolve) => {
              const result = onNodeSelect(selection.nodeIds, selection.hopDistance, latestAdditionalCellSets, latestCellSetColor, latestCellSetSelection, true);
              if (result) {
                latestAdditionalCellSets = result.nextAdditionalCellSets;
                latestCellSetColor = result.nextCellSetColor;
                latestCellSetSelection = result.nextCellSetSelection;
              }
              setTimeout(resolve, 0);
            });
          }
        },
        hasTrailingDivider: true
      },
      {
        id: 'show-all-neighbors',
        content: 'Show all neighbors',
        selector: 'node',
        onClickFunction: async (event: any) => {
          const node = event.target;
          const neighbors = findNeighborsAtHopDistance(node, 10, false);

          const hopDistances = Array.from(neighbors.keys()).sort((a, b) => a - b);

          const nodeData = node.data();
          const selectedNodeIds: string[] = [];
          if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
            nodeData.subComponents.forEach((subId: string) => {
              selectedNodeIds.push(subId);
            });
          } else {
            selectedNodeIds.push(node.id());
          }

          const selections: { nodeIds: string[], hopDistance?: number }[] = [];

          if (selectedNodeIds.length > 0) {
            selections.push({ nodeIds: selectedNodeIds, hopDistance: 0 });
          }

          for (const hopDistance of hopDistances) {
            const nodeIds = neighbors.get(hopDistance);
            if (nodeIds && nodeIds.size > 0) {
              const hopNodeIds: string[] = [];
              nodeIds.forEach(id => {
                const node = cyRef.current.getElementById(id);
                if (node.length > 0) {
                  const nodeData = node.data();
                  if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
                    nodeData.subComponents.forEach((subId: string) => {
                      hopNodeIds.push(subId);
                    });
                  } else {
                    hopNodeIds.push(id);
                  }
                }
              });
              if (hopNodeIds.length > 0) {
                selections.push({ nodeIds: hopNodeIds, hopDistance });
              }
            }
          }

          let latestAdditionalCellSets: any = null;
          let latestCellSetColor: any = null;
          let latestCellSetSelection: any = null;

          // Step 1: Clear all existing selections before starting
          await new Promise<void>((resolve) => {
            const result = onNodeSelect([], 0, latestAdditionalCellSets, latestCellSetColor, latestCellSetSelection, false);
            if (result) {
              latestAdditionalCellSets = result.nextAdditionalCellSets;
              latestCellSetColor = result.nextCellSetColor;
              latestCellSetSelection = result.nextCellSetSelection;
            }
            setTimeout(resolve, 0);
          });

          // Step 2: Accumulate hop distance selections
          for (const selection of selections) {
            await new Promise<void>((resolve) => {
              const result = onNodeSelect(selection.nodeIds, selection.hopDistance, latestAdditionalCellSets, latestCellSetColor, latestCellSetSelection, true);
              if (result) {
                latestAdditionalCellSets = result.nextAdditionalCellSets;
                latestCellSetColor = result.nextCellSetColor;
                latestCellSetSelection = result.nextCellSetSelection;
              }
              setTimeout(resolve, 0);
            });
          }
        }
      }
    ];

    cy.contextMenus({
      menuItems: contextMenuItems,
      menuItemClasses: ['context-menu-item'],
      contextMenuClasses: ['context-menu']
    });

    return () => {
      cy.contextMenus('destroy');
    };
  }, [obsSetSelection]);

  // Update node opacity when cellColors changes
  useEffect(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().forEach((node: any) => {
      const nodeId = node.id();
      const nodeData = node.data();

      if (nodeData.ftuName === 'nerves' && nodeId.startsWith('merged_')) {
        const hasHighlightedSubComponent = nodeData.subComponents?.some(
          (subId: string) => cellColors.has(subId)
        );
        node.style('opacity', hasHighlightedSubComponent ? 1 : 0.3);
      } else {
        const opacity = cellColors.has(nodeId) ? 1 : 0.3;
        node.style('opacity', opacity);
      }
    });
  }, [cellColors]);

  // Handle highlighting from Neuroglancer hover
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().removeClass('hovered');

    if (!obsHighlight) return;

    cy.nodes().forEach((node: any) => {
      const { id, ftuName, subComponents } = node.data();

      if (ftuName === 'nerves' && id.startsWith('merged_')) {
        if (subComponents?.includes(obsHighlight)) {
          node.addClass('hovered');
        }
      } else if (id === obsHighlight) {
        node.addClass('hovered');
      }
    });
  }, [obsHighlight]);

  // Handle node selection
  const handleNodeSelect = (event: any) => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    selectionTimeoutRef.current = window.setTimeout(() => {
      const selectedNodes = event.cy.nodes(':selected');
      const selectedNodeIds: string[] = [];

      if (selectedNodes.length > 0) {
        event.cy.nodes().forEach((node: any) => {
          if (!node.selected()) {
            node.style('opacity', '0.3');
          } else {
            node.style('opacity', '1');
          }
        });
      } else {
        event.cy.nodes().forEach((node: any) => {
          node.style('opacity', '1');
        });
      }

      selectedNodes.forEach((node: any) => {
        const nodeData = node.data();
        if (nodeData.ftuName === 'nerves') {
          if (nodeData.id.startsWith('merged_')) {
            nodeData.subComponents.forEach((subId: string) => {
              selectedNodeIds.push(subId);
            });
          } else {
            selectedNodeIds.push(nodeData.id);
          }
        } else {
          selectedNodeIds.push(nodeData.id);
        }
      });

      onNodeSelect(selectedNodeIds);
    }, 100);
  };

  // Reset opacity when clicking on the background
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    cy.on('tap', (evt: any) => {
      if (evt.target === cy) {
        cy.nodes().forEach((node: any) => {
          node.style('opacity', '1');
        });
      }
    });
  }, []);

  // Update highlighting based on obsSetSelection and obsHighlight
  useEffect(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().removeClass('highlighted');

    if (obsHighlight !== null) {
      const highlightedSet = obsSetSelection.find(set => set.includes(obsHighlight));
      if (highlightedSet) {
        highlightedSet.forEach(nodeId => {
          const node = cyRef.current.getElementById(nodeId);
          if (node.length > 0) {
            node.addClass('highlighted');
          }
        });
      }
    }
  }, [obsSetSelection, obsHighlight]);

  return (
    <CytoscapeComponent
      elements={createElements(nodes, links, nodeColor, 10, cellColors)}
      style={{ width: '100%', height: '100%' }}
      layout={{ name: 'cose', fit: true, padding: 30 }}
      stylesheet={stylesheet}
      cy={(cy: any) => {
        cyRef.current = cy;
        cy.ready(() => {
          cy.lassoSelectionEnabled(true);

          cy.on('select', 'node', handleNodeSelect);
          cy.on('unselect', 'node', handleNodeSelect);

          cy.on('mouseover', 'node', (evt: any) => {
            const node = evt.target;
            const nodeData = node.data();
            let nodeId = nodeData.id;

            if (nodeData.ftuName === 'nerves') {
              if (nodeData.id.startsWith('merged_')) {
                nodeId = `${nodeData.subComponents[0]}000`;
              } else {
                nodeId = `${nodeData.id}000`;
              }
            }

            node.addClass('hovered');
          });

          cy.on('mouseout', 'node', (evt: any) => {
            const node = evt.target;
            node.removeClass('hovered');
          });
        });
      }}
    />
  );
};

export default CytoscapeWrapper;
