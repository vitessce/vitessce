import React, { useEffect, useRef, useState, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core } from 'cytoscape';
import cytoscapeLasso from 'cytoscape-lasso';
import cytoscapeContextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import Graph from 'graphology';
import ReactFlow, {
  Node as FlowNode,
  Edge as FlowEdge,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';
import { Background } from 'reactflow';
import 'reactflow/dist/style.css';
import paper from 'paper';

// Register the plugins
(cytoscape as any).use(cytoscapeLasso);
(cytoscape as any).use(cytoscapeContextMenus);

const createElements = (nodes: any[], links: any[], nodeColor: (n: any) => string, nodeSize: number, cellColors: Map<string, [number, number, number]>) => [
  ...nodes.map(node => {
    let borderColor = '#999';
    let hasCellColor = false;
    if (node.ftuName === 'nerves' && node.id.startsWith('merged_') && node.subComponents) {
      // For merged nodes, find the first subcomponent that has a color
      const coloredSubComponent = node.subComponents.find((subId: string) => cellColors.has(subId));
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
      'border-width': '8px',
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
      'border-width': '10px',
      'opacity': '1'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': '1',
      'line-color': '#999',
      'curve-style': 'straight',
      // 'opacity': '1'
    }
  },
  // {
  //   selector: 'node:hover',
  //   style: {
  //     content: 'data(id)',
  //     'text-valign': 'center' as const,
  //     'text-halign': 'right' as const,
  //     color: '#fff',
  //     'font-size': '10px',
  //     'text-outline-width': 2,
  //     'text-outline-color': '#888'
  //   }
  // }
];

const nodeColor = (n: any) => n.ftuName === 'glomeruli' ? 'red' : 'yellow';

const CytoscapeWrapper: React.FC<{
  nodes: any[];
  links: any[];
  onNodeSelect: (nodeIds: string[], hopDistance?: number) => void;
  obsSetSelection: string[][];
  obsHighlight: string | null;
  cyRef: React.MutableRefObject<any>;
  cellColors: Map<string, [number, number, number]>;
}> = ({ nodes, links, onNodeSelect, obsSetSelection, obsHighlight, cyRef, cellColors }) => {
  const selectionTimeoutRef = React.useRef<number | null>(null);

  // Function to find neighbors at a specific hop distance
  const findNeighborsAtHopDistance = (startNode: any, maxHops: number = 10, sameTypeOnly: boolean = false) => {
    const visited = new Set<string>();
    const result = new Map<number, Set<string>>(); // Map hop distance to set of node IDs
    const queue: { node: any; distance: number }[] = [{ node: startNode, distance: 0 }];
    const startNodeType = startNode.data('ftuName');
    
    // Initialize the result map with empty sets for each hop distance
    for (let i = 1; i <= maxHops; i++) {
      result.set(i, new Set());
    }
    
    while (queue.length > 0) {
      const { node, distance } = queue.shift()!;
      const nodeId = node.id();
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      // Get all connected nodes
      const connectedNodes = node.neighborhood('node');
      
      // Process each neighbor
      connectedNodes.forEach((neighbor: any) => {
        const neighborId = neighbor.id();
        if (!visited.has(neighborId)) {
          // Check if neighbor matches type filter
          if (!sameTypeOnly || neighbor.data('ftuName') === startNodeType) {
            // Add to result if it's not the start node and within max hops
            if (distance + 1 <= maxHops) {
              result.get(distance + 1)!.add(neighborId);
            }
          }
          // Add to queue for further traversal
          queue.push({ node: neighbor, distance: distance + 1 });
        }
      });
    }
    
    // Remove empty hop distances
    for (const [distance, nodes] of result.entries()) {
      if (nodes.size === 0) {
        result.delete(distance);
      }
    }
    
    return result;
  };

  // Function to create a selection from node IDs
  const createSelectionFromNodes = (nodeIds: string[], hopDistance: number) => {
    const timestamp = new Date().getTime();
    onNodeSelect(nodeIds, hopDistance);
  };

  // Initialize context menu
  useEffect(() => {
    if (!cyRef.current) return;
    
    const cy = cyRef.current;
    
    // Create context menu items
    const contextMenuItems = [
      {
        id: 'show-same-type-neighbors',
        content: 'Show neighbors of same type',
        selector: 'node',
        onClickFunction: async (event: any) => {
          const node = event.target;
          const neighbors = findNeighborsAtHopDistance(node, 10, true); // Max 10 hops, same type only
          
          // Create separate selections for each hop distance
          const hopDistances = Array.from(neighbors.keys()).sort((a, b) => a - b);
          console.log('NetworkVis - Hop distances found:', hopDistances);
          
          // First create selection for the selected node
          const nodeData = node.data();
          const selectedNodeIds: string[] = [];
          if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
            // For merged nodes, add each subcomponent
            nodeData.subComponents.forEach((subId: string) => {
              selectedNodeIds.push(subId);
            });
          } else {
            selectedNodeIds.push(node.id());
          }

          // Create an array of all selections to make
          const selections: { nodeIds: string[], hopDistance?: number }[] = [];
          
          // Add initial node selection
          if (selectedNodeIds.length > 0) {
            selections.push({ nodeIds: selectedNodeIds, hopDistance: 0 });
          }
          
          // Add hop distance selections
          for (const hopDistance of hopDistances) {
            console.log(`NetworkVis - Processing hop distance ${hopDistance}`);
            const nodeIds = neighbors.get(hopDistance);
            if (nodeIds && nodeIds.size > 0) {
              const hopNodeIds: string[] = [];
              nodeIds.forEach(id => {
                // Handle merged nerve nodes
                const node = cyRef.current.getElementById(id);
                if (node.length > 0) {
                  const nodeData = node.data();
                  if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
                    // For merged nodes, add each subcomponent
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
          
          // Process all selections sequentially
          for (const selection of selections) {
            await new Promise<void>((resolve) => {
              onNodeSelect(selection.nodeIds, selection.hopDistance);
              setTimeout(resolve, 100); // Wait for selection to be processed
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
          const neighbors = findNeighborsAtHopDistance(node, 10, false); // Max 10 hops, any type
          
          // Create separate selections for each hop distance
          const hopDistances = Array.from(neighbors.keys()).sort((a, b) => a - b);
          console.log('NetworkVis - Hop distances found:', hopDistances);
          
          // First create selection for the selected node
          const nodeData = node.data();
          const selectedNodeIds: string[] = [];
          if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
            // For merged nodes, add each subcomponent
            nodeData.subComponents.forEach((subId: string) => {
              selectedNodeIds.push(subId);
            });
          } else {
            selectedNodeIds.push(node.id());
          }

          // Create an array of all selections to make
          const selections: { nodeIds: string[], hopDistance?: number }[] = [];
          
          // Add initial node selection
          if (selectedNodeIds.length > 0) {
            selections.push({ nodeIds: selectedNodeIds, hopDistance: 0 });
          }
          
          // Add hop distance selections
          for (const hopDistance of hopDistances) {
            console.log(`NetworkVis - Processing hop distance ${hopDistance}`);
            const nodeIds = neighbors.get(hopDistance);
            if (nodeIds && nodeIds.size > 0) {
              const hopNodeIds: string[] = [];
              nodeIds.forEach(id => {
                // Handle merged nerve nodes
                const node = cyRef.current.getElementById(id);
                if (node.length > 0) {
                  const nodeData = node.data();
                  if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
                    // For merged nodes, add each subcomponent
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
          
          // Process all selections sequentially
          for (const selection of selections) {
            await new Promise<void>((resolve) => {
              onNodeSelect(selection.nodeIds, selection.hopDistance);
              setTimeout(resolve, 1000); // Wait for selection to be processed
            });
          }
        }
      }
    ];

    // Initialize context menu
    cy.contextMenus({
      menuItems: contextMenuItems,
      menuItemClasses: ['context-menu-item'],
      contextMenuClasses: ['context-menu']
    });

    return () => {
      // Cleanup context menu when component unmounts
      cy.contextMenus('destroy');
    };
  }, [cyRef.current]);

  // Update node opacity when cellColors changes
  useEffect(() => {
    if (!cyRef.current) return;
    
    cyRef.current.nodes().forEach((node: any) => {
      const nodeId = node.id();
      const nodeData = node.data();
      
      // Check if this is a merged nerve node
      if (nodeData.ftuName === 'nerves' && nodeId.startsWith('merged_')) {
        // Check if any of its subcomponents are in cellColors
        const hasHighlightedSubComponent = nodeData.subComponents?.some(
          (subId: string) => cellColors.has(subId)
        );
        node.style('opacity', hasHighlightedSubComponent ? 1 : 0.3);
      } else {
        // For non-merged nodes, check if the node ID is in cellColors
        const opacity = cellColors.has(nodeId) ? 1 : 0.3;
        node.style('opacity', opacity);
      }
    });
  }, [cellColors]);

 // Handle highlighting from Neuroglancer hover
useEffect(() => {
  const cy = cyRef.current;
  if (!cy) return;

  // Always clear previous highlights
  cy.nodes().removeClass('hovered');

  // If nothing is highlighted, exit early
  if (!obsHighlight) return;

  // Apply hover class based on obsHighlight
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
    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // Set a new timeout to debounce the selection
    selectionTimeoutRef.current = window.setTimeout(() => {
      // Get all selected nodes from the cy instance
      const selectedNodes = event.cy.nodes(':selected');
      const selectedNodeIds: string[] = [];

      // If there are selected nodes, dim the unselected ones
      if (selectedNodes.length > 0) {
        event.cy.nodes().forEach((node: any) => {
          if (!node.selected()) {
            node.style('opacity', '0.3');
          } else {
            node.style('opacity', '1');
          }
        });
      } else {
        // If no nodes are selected, reset all nodes to full opacity
        event.cy.nodes().forEach((node: any) => {
          node.style('opacity', '1');
        });
      }

      selectedNodes.forEach((node: any) => {
        const nodeData = node.data();
        if (nodeData.ftuName === 'nerves') {
          if (nodeData.id.startsWith('merged_')) {
            // For merged nodes, use subComponents with 000 suffix
            nodeData.subComponents.forEach((subId: string) => {
              // selectedNodeIds.push(`${subId}000`);
              selectedNodeIds.push(subId);
            });
          } else {
            // For regular nerve nodes, add 000 suffix
            // selectedNodeIds.push(`${nodeData.id}000`);
            selectedNodeIds.push(nodeData.id);
          }
        } else {
          // For non-nerve nodes, use the ID as is
          selectedNodeIds.push(nodeData.id);
        }
      });

      console.log('Selected nodes:', selectedNodeIds);
      onNodeSelect(selectedNodeIds);
    }, 100); // 100ms debounce
  };

  // Reset opacity when clicking on the background
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    cy.on('tap', (evt: any) => {
      if (evt.target === cy) {
        // Clicked on background, reset all nodes to full opacity
        cy.nodes().forEach((node: any) => {
          node.style('opacity', '1');
        });
      }
    });
  }, []);

  // Update highlighting based on obsSetSelection and obsHighlight
  useEffect(() => {
    if (!cyRef.current) return;

    // Remove all highlighting first
    cyRef.current.nodes().removeClass('highlighted');

    // If there's a highlighted obs set, highlight those nodes
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
        // Wait for the graph to be ready
        cy.ready(() => {
          // Enable lasso selection
          cy.lassoSelectionEnabled(true);
          
          // Handle both regular and lasso selection
          cy.on('select', 'node', handleNodeSelect);
          cy.on('unselect', 'node', handleNodeSelect);

          // Add hover event handlers
          cy.on('mouseover', 'node', (evt: any) => {
            const node = evt.target;
            const nodeData = node.data();
            let nodeId = nodeData.id;
            
            // Handle nerve nodes with 000 suffix
            if (nodeData.ftuName === 'nerves') {
              if (nodeData.id.startsWith('merged_')) {
                // For merged nodes, use the first subComponent with 000 suffix
                nodeId = `${nodeData.subComponents[0]}000`;
              } else {
                nodeId = `${nodeData.id}000`;
              }
            }
            
            // Add hover class to the node
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

// Function to filter nodes and links based on the motif criteria
const filterMotif = (nodes: any[], links: any[]) => {//still show the entire network, but only show the nodes and links that match the motif
  const filteredNodes = new Set<string>();
  const filteredLinks: { source: string; target: string }[] = [];

  nodes.forEach(node => {
    if (node.ftuName === 'glomeruli') {
      const connectedNerves = links.filter(link =>
        (link.source === node.id && nodes.find(n => n.id === link.target && n.ftuName === 'nerves')) ||
        (link.target === node.id && nodes.find(n => n.id === link.source && n.ftuName === 'nerves'))
      );

      if (connectedNerves.length === 2) {
        filteredNodes.add(node.id);
        connectedNerves.forEach(link => {
          filteredNodes.add(link.source);
          filteredNodes.add(link.target);
          filteredLinks.push(link);
        });
      }
    }
  });

  return {
    nodes: nodes.filter(node => filteredNodes.has(node.id)),
    links: filteredLinks
  };
};

interface Node {
  id: string;
  ftuName: string;
  subComponents?: string[];
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface MotifNode {
  id: string;
  type: 'glomeruli' | 'nerves' | 'none';
  connectionCount: number;
}

interface MotifEdge {
  source: string;
  target: string;
  type: 'glomeruli_to_nerve' | 'nerve_to_glomeruli';
}

interface MotifPattern {
  nodes: {
    id: string;
    type: 'glomeruli' | 'nerves';
  }[];
  edges: MotifEdge[];
}

interface NetworkVisProps {
  onNodeSelect: (nodeIds: string[]) => void;
  obsSetSelection: string[][];
  obsSetColor: Array<{ path: string[]; color: [number, number, number] }>;
  obsHighlight: string | null;
  additionalCellSets: any;
  setAdditionalCellSets: (sets: any) => void;
  cellColors: Map<string, [number, number, number]>;
}

interface SketchNode {
  id: string;
  type: 'glomeruli' | 'nerves';
  position: paper.Point;
  circle: paper.Path.Circle;
}

interface SketchEdge {
  id: string;
  source: string;
  target: string;
  path: paper.Path;
}

interface FlowNodeData {
  type: 'glomeruli' | 'nerves';
}

interface MotifConnection {
  glomeruli: string;
  nerves: string[];
}

const MotifSketch: React.FC<{
  onPatternChange: (pattern: MotifPattern) => void;
}> = ({ onPatternChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentNodeType, setCurrentNodeType] = useState<'glomeruli' | 'nerves'>('glomeruli');
  const [nodes, setNodes] = useState<SketchNode[]>([]);
  const [edges, setEdges] = useState<SketchEdge[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startNode, setStartNode] = useState<SketchNode | null>(null);
  const [tempPath, setTempPath] = useState<paper.Path | null>(null);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectStartNode, setConnectStartNode] = useState<SketchNode | null>(null);

  // Initialize Paper.js
  useEffect(() => {
    if (!canvasRef.current) return;

    paper.setup(canvasRef.current);
    paper.view.onResize = () => {
      paper.view.viewSize = new paper.Size(canvasRef.current!.clientWidth, canvasRef.current!.clientHeight);
    };

    return () => {
      paper.project.clear();
    };
  }, []);

  // Update pattern when nodes or edges change
  useEffect(() => {
    // Create pattern nodes
    const patternNodes = nodes.map(node => ({
      id: node.id,
      type: node.type
    }));

    // Create pattern edges with explicit types
    const patternEdges = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)!;
      const targetNode = nodes.find(n => n.id === edge.target)!;
      
      return {
        source: edge.source,
        target: edge.target,
        type: sourceNode.type === 'glomeruli' ? 'glomeruli_to_nerve' as const : 'nerve_to_glomeruli' as const
      };
    });

    onPatternChange({
      nodes: patternNodes,
      edges: patternEdges
    });
  }, [nodes, edges, onPatternChange]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: paper.ToolEvent) => {
    const point = event.point;
    
    // Check if clicked on an existing node
    const clickedNode = nodes.find(node => 
      node.circle.contains(point)
    );

    if (clickedNode) {
      if (isConnectMode) {
        if (!connectStartNode) {
          // Start connection
          setConnectStartNode(clickedNode);
          // Highlight the node
          clickedNode.circle.strokeColor = new paper.Color('#4477AA');
          clickedNode.circle.strokeWidth = 3;
        } else if (connectStartNode.id !== clickedNode.id) {
          // Check if edge already exists
          const edgeExists = edges.some(edge => 
            (edge.source === connectStartNode.id && edge.target === clickedNode.id) ||
            (edge.source === clickedNode.id && edge.target === connectStartNode.id)
          );

          if (!edgeExists) {
            // Create edge
            const path = new paper.Path.Line(connectStartNode.position, clickedNode.position);
            path.strokeColor = new paper.Color('#999');
            path.strokeWidth = 2;

            const newEdge: SketchEdge = {
              id: `edge-${edges.length + 1}`,
              source: connectStartNode.id,
              target: clickedNode.id,
              path
            };

            setEdges(prev => [...prev, newEdge]);
          }

          // Reset connection mode
          connectStartNode.circle.strokeColor = new paper.Color('black');
          connectStartNode.circle.strokeWidth = 2;
          setConnectStartNode(null);
        }
      } else if (isDrawing && startNode && startNode.id !== clickedNode.id) {
        // Check if edge already exists
        const edgeExists = edges.some(edge => 
          (edge.source === startNode.id && edge.target === clickedNode.id) ||
          (edge.source === clickedNode.id && edge.target === startNode.id)
        );

        if (!edgeExists) {
          // Create edge
          const path = new paper.Path.Line(startNode.position, clickedNode.position);
          path.strokeColor = new paper.Color('#999');
          path.strokeWidth = 2;

          const newEdge: SketchEdge = {
            id: `edge-${edges.length + 1}`,
            source: startNode.id,
            target: clickedNode.id,
            path
          };

          setEdges(prev => [...prev, newEdge]);
        }
      }
      // Always stop drawing when clicking a node
      setIsDrawing(false);
      setStartNode(null);
      if (tempPath) {
        tempPath.remove();
        setTempPath(null);
      }
    } else {
      // Create new node with smaller size
      const circle = new paper.Path.Circle(point, 8); // Reduced from 15 to 8
      circle.fillColor = currentNodeType === 'glomeruli' ? new paper.Color('red') : new paper.Color('yellow');
      circle.strokeColor = new paper.Color('black');
      circle.strokeWidth = 1; // Reduced from 2 to 1

      const newNode: SketchNode = {
        id: `node-${nodes.length + 1}`,
        type: currentNodeType,
        position: point,
        circle
      };

      setNodes(prev => [...prev, newNode]);
    }
  }, [nodes, edges, currentNodeType, isDrawing, startNode, tempPath, isConnectMode, connectStartNode]);

  // Handle mouse move for edge drawing
  const handleMouseMove = useCallback((event: paper.ToolEvent) => {
    if (isDrawing && startNode && tempPath) {
      const point = event.point;
      
      // Check if hovering over a node
      const hoverNode = nodes.find(node => 
        node.id !== startNode.id && 
        node.circle.contains(point)
      );

      if (hoverNode) {
        // Snap to the node
        tempPath.segments[1].point = hoverNode.position;
      } else {
        // Follow mouse
        tempPath.segments[1].point = point;
      }
    }
  }, [isDrawing, startNode, tempPath, nodes]);

  // Handle node drag start
  const handleNodeDragStart = useCallback((event: paper.ToolEvent) => {
    const point = event.point;
    const draggedNode = nodes.find(node => node.circle.contains(point));
    
    if (draggedNode) {
      // Check if we're already drawing from this node
      if (isDrawing && startNode && startNode.id === draggedNode.id) {
        // Cancel drawing
        setIsDrawing(false);
        setStartNode(null);
        if (tempPath) {
          tempPath.remove();
          setTempPath(null);
        }
      } else {
        // Start drawing
        setIsDrawing(true);
        setStartNode(draggedNode);
        
        // Create temporary path
        const path = new paper.Path.Line(draggedNode.position, point);
        path.strokeColor = new paper.Color('#999');
        path.strokeWidth = 2;
        setTempPath(path);
      }
    }
  }, [nodes, isDrawing, startNode, tempPath]);

  // Handle mouse up anywhere on canvas
  const handleMouseUp = useCallback((event: paper.ToolEvent) => {
    if (isDrawing && startNode && tempPath) {
      // Cancel drawing if not over a node
      setIsDrawing(false);
      setStartNode(null);
      tempPath.remove();
      setTempPath(null);
    }
  }, [isDrawing, startNode, tempPath]);

  // Initialize Paper.js tools
  useEffect(() => {
    if (!paper.project) return;

    const tool = new paper.Tool();
    tool.onMouseDown = handleNodeDragStart;
    tool.onMouseMove = handleMouseMove;
    tool.onMouseUp = handleMouseUp;
    tool.onMouseDown = handleCanvasClick;

    return () => {
      tool.remove();
    };
  }, [handleNodeDragStart, handleMouseMove, handleMouseUp, handleCanvasClick]);

  return (
    <div>
      <div style={{ marginBottom: '5px' }}>
        <button
          onClick={() => setCurrentNodeType('glomeruli')}
          style={{
            backgroundColor: currentNodeType === 'glomeruli' ? '#ff0000' : '#ffcccc',
            marginRight: '5px',
            padding: '2px 4px',
            fontSize: '10px'
          }}
        >
          Glomeruli
        </button>
        <button
          onClick={() => setCurrentNodeType('nerves')}
          style={{
            backgroundColor: currentNodeType === 'nerves' ? '#ffff00' : '#ffffcc',
            marginRight: '5px',
            padding: '2px 4px',
            fontSize: '10px'
          }}
        >
          Nerves
        </button>
        <button
          onClick={() => {
            setIsConnectMode(!isConnectMode);
            if (connectStartNode) {
              connectStartNode.circle.strokeColor = new paper.Color('black');
              connectStartNode.circle.strokeWidth = 1;
              setConnectStartNode(null);
            }
          }}
          style={{
            backgroundColor: isConnectMode ? '#4477AA' : '#cccccc',
            color: isConnectMode ? 'white' : 'black',
            padding: '2px 4px',
            fontSize: '10px'
          }}
        >
          Connect
        </button>
      </div>
      <div style={{ height: 180, border: '1px solid #ccc', borderRadius: '3px' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div style={{ fontSize: '9px', marginTop: '3px' }}>
        {isConnectMode 
          ? 'Click first node, then click second node to create an edge'
          : 'Click to add nodes. Drag from node to node to create edges.'}
      </div>
    </div>
  );
};

const NetworkVis: React.FC<NetworkVisProps> = ({
  onNodeSelect,
  obsSetSelection,
  obsSetColor,
  obsHighlight,
  additionalCellSets,
  setAdditionalCellSets,
  cellColors,
}) => {
  const [state, setState] = React.useState({
    data: undefined,
    infoText: '',
  });

  const [isMotifSearchOpen, setIsMotifSearchOpen] = React.useState(false);

  const [motifPattern, setMotifPattern] = useState<MotifPattern>({
    nodes: [],
    edges: []
  });

  const cyRef = React.useRef<any>(null);

  // Function to search for motifs in the graph
  const searchMotif = () => {
    console.log('Starting motif search...');
    if (!state.data || !cyRef.current) {
      console.log('No data or cy instance available');
      return;
    }

    const { nodes, links } = state.data as GraphData;
    const matches: Set<string> = new Set();

    // Log the pattern structure
    console.log('Searching for motif pattern:');
    console.log('Nodes:', motifPattern.nodes);
    console.log('Edges:', motifPattern.edges);

    // Create a graphology graph from the network data
    const graph = new Graph({ type: 'directed' });
    nodes.forEach(node => {
      graph.addNode(node.id, { type: node.ftuName });
    });
    links.forEach(link => {
      // Add edges in both directions since the network is undirected
      graph.addEdge(link.source, link.target, { type: 'glomeruli_to_nerve' });
      graph.addEdge(link.target, link.source, { type: 'nerve_to_glomeruli' });
    });

    // Function to check if a subgraph matches the pattern
    const isSubgraphMatch = (nodeMapping: Map<string, string>): boolean => {
      // Check if all nodes in the pattern are mapped
      if (nodeMapping.size !== motifPattern.nodes.length) {
        return false;
      }

      // Check if all edges in the pattern exist in the subgraph
      for (const patternEdge of motifPattern.edges) {
        const sourceNode = nodeMapping.get(patternEdge.source);
        const targetNode = nodeMapping.get(patternEdge.target);
        
        if (!sourceNode || !targetNode) {
          return false;
        }

        // Check if the edge exists with the correct type
        const edge = graph.edge(sourceNode, targetNode);
        if (!edge || graph.getEdgeAttributes(edge).type !== patternEdge.type) {
          return false;
        }
      }

      return true;
    };

    // Function to find all subgraph isomorphisms
    const findSubgraphIsomorphisms = () => {
      const results: Set<string>[] = [];

      // Start from each glomeruli node
      const glomeruliNodes = nodes.filter(n => n.ftuName === 'glomeruli');
      
      for (const startNode of glomeruliNodes) {
        const visited = new Set<string>();
        const nodeMapping = new Map<string, string>();
        
        // Try to map the first node
        const firstPatternNode = motifPattern.nodes.find(n => n.type === 'glomeruli');
        if (!firstPatternNode) continue;

        nodeMapping.set(firstPatternNode.id, startNode.id);
        visited.add(startNode.id);

        // Recursive function to try mapping the remaining nodes
        const tryMapRemainingNodes = (patternNodeIndex: number): void => {
          if (patternNodeIndex >= motifPattern.nodes.length) {
            // Found a complete mapping
            if (isSubgraphMatch(nodeMapping)) {
              results.push(new Set(nodeMapping.values()));
            }
            return;
          }

          const currentPatternNode = motifPattern.nodes[patternNodeIndex];
          if (nodeMapping.has(currentPatternNode.id)) {
            tryMapRemainingNodes(patternNodeIndex + 1);
            return;
          }

          // Get all possible nodes that could match the current pattern node
          const possibleNodes = nodes.filter(n => 
            n.ftuName === currentPatternNode.type && 
            !visited.has(n.id)
          );

          for (const node of possibleNodes) {
            // Check if this node can be mapped
            let canMap = true;
            for (const [patternId, graphId] of nodeMapping.entries()) {
              const patternEdge = motifPattern.edges.find(e => 
                (e.source === patternId && e.target === currentPatternNode.id) ||
                (e.source === currentPatternNode.id && e.target === patternId)
              );

              if (patternEdge) {
                const sourceId = patternEdge.source === patternId ? graphId : node.id;
                const targetId = patternEdge.target === patternId ? graphId : node.id;
                const edge = graph.edge(sourceId, targetId);
                
                if (!edge || graph.getEdgeAttributes(edge).type !== patternEdge.type) {
                  canMap = false;
                  break;
                }
              }
            }

            if (canMap) {
              nodeMapping.set(currentPatternNode.id, node.id);
              visited.add(node.id);
              tryMapRemainingNodes(patternNodeIndex + 1);
              nodeMapping.delete(currentPatternNode.id);
              visited.delete(node.id);
            }
          }
        };

        tryMapRemainingNodes(0);
      }

      return results;
    };

    // Find all matches
    const foundMatches = findSubgraphIsomorphisms();
    console.log('Found matches:', foundMatches);

    // Select the matching nodes in the graph
    const cy = cyRef.current;
    cy.nodes().forEach((node: any) => {
      if (foundMatches.some(match => match.has(node.id()))) {
        node.select();
      } else {
        node.unselect();
      }
    });

    // Trigger the selection callback with all matched nodes
    const allMatchedNodes = new Set<string>();
    foundMatches.forEach(match => {
      match.forEach(nodeId => allMatchedNodes.add(nodeId));
    });
    onNodeSelect(Array.from(allMatchedNodes));
  };

  const handlePatternChange = (pattern: MotifPattern) => {
    setMotifPattern(pattern);
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://network-hidive.s3.eu-central-1.amazonaws.com/modified_network_kidney_20_10.json');
        if (!response.ok) throw new Error('Failed to fetch network data');
        const data = await response.json();

        setState({
          data,
          infoText: '',
        });
      } catch (e) {
        console.error(e);
        setState({ data: undefined, infoText: 'Could not fetch network data!' });
      }
    };

    fetchData();
  }, []);

  if (!state.data) {
    return <p>{state.infoText || 'Loading network...'}</p>;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 1000, 
        background: 'white', 
        padding: '6px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '280px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '3px'
        }}>
          <h4 style={{ margin: 0, fontSize: '11px' }}>Motif Search</h4>
          <button
            onClick={() => setIsMotifSearchOpen(!isMotifSearchOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '1px 4px',
              fontSize: '14px',
              color: '#666'
            }}
          >
            {isMotifSearchOpen ? '−' : '+'}
          </button>
        </div>
        {isMotifSearchOpen && (
          <div style={{ marginBottom: '3px' }}>
            <MotifSketch onPatternChange={handlePatternChange} />
            <div style={{ fontSize: '9px', marginBottom: '3px' }}>
              Pattern: {motifPattern.nodes.map((node, i) => (
                <span key={node.id}>
                  {i > 0 && ' → '}
                  {node.type}
                </span>
              ))}
            </div>
            <button 
              onClick={searchMotif}
              style={{
                padding: '2px 6px',
                backgroundColor: '#4477AA',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '9px',
                width: '100%'
              }}
            >
              Search Motif
            </button>
          </div>
        )}
      </div>
      <CytoscapeWrapper 
        nodes={state.data.nodes} 
        links={state.data.links} 
        onNodeSelect={onNodeSelect}
        obsSetSelection={obsSetSelection}
        obsHighlight={obsHighlight}
        cyRef={cyRef}
        cellColors={cellColors}
      />
    </div>
  );
};

export default NetworkVis;