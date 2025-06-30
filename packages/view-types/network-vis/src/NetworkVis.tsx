import React, { useEffect, useRef, useState, useCallback } from 'react';
import CytoscapeWrapper from './components/CytoscapeWrapper';
import MotifSketch from './components/MotifSketch';
import Graph from 'graphology';

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

interface MotifEdge {
  source: string;
  target: string;
  type: string;
}

interface MotifPattern {
  nodes: {
    id: string;
    type: string;
  }[];
  edges: MotifEdge[];
}

interface SketchNode {
  id: string;
  type: string;
  position: any;
  circle: any;
}

interface SketchEdge {
  id: string;
  source: string;
  target: string;
  path: any;
}

interface NetworkVisProps {
  onNodeSelect: (nodeIds: string[], hopDistance?: number, currentAdditionalCellSets?: any, currentCellSetColor?: any, currentCellSetSelection?: any, appendToSelection?: boolean) => any;
  obsSetSelection: string[][];
  obsSetColor: Array<{ path: string[]; color: [number, number, number] }>;
  obsHighlight: string | null;
  additionalCellSets: any;
  setAdditionalCellSets: (sets: any) => void;
  cellColors: Map<string, [number, number, number]>;
}

const findSameTypeNeighborsWithPaths = (startNode: any, maxHops: number) => {
  const visited = new Set<string>();
  const result = new Set<string>();
  const sameTypeNodes = new Set<string>();
  const startNodeType = startNode.data('ftuName');
  const sameTypePaths = new Map<string, string[]>();
  sameTypePaths.set(startNode.id(), [startNode.id()]);
  const queue: { node: any; sameTypeHops: number; path: string[] }[] = [{
    node: startNode,
    sameTypeHops: 0,
    path: [startNode.id()]
  }];
  while (queue.length > 0) {
    const { node, sameTypeHops, path } = queue.shift()!;
    const nodeId = node.id();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    result.add(nodeId);
    if (node.data('ftuName') === startNodeType) {
      sameTypeNodes.add(nodeId);
      sameTypePaths.set(nodeId, path);
    }
    if (sameTypeHops < maxHops) {
      const connectedNodes = node.neighborhood('node');
      connectedNodes.forEach((neighbor: any) => {
        const neighborId = neighbor.id();
        if (!visited.has(neighborId)) {
          const newSameTypeHops = neighbor.data('ftuName') === startNodeType ?
            sameTypeHops + 1 :
            sameTypeHops;
          queue.push({
            node: neighbor,
            sameTypeHops: newSameTypeHops,
            path: [...path, neighborId]
          });
        }
      });
    }
  }
  const allPathNodes = new Set<string>();
  sameTypePaths.forEach(path => {
    path.forEach(nodeId => allPathNodes.add(nodeId));
  });
  return {
    allNodes: Array.from(allPathNodes),
    sameTypeNodes: Array.from(sameTypeNodes)
  };
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
  const [state, setState] = useState({
    data: undefined as undefined | GraphData,
    infoText: '',
  });
  const [isMotifSearchOpen, setIsMotifSearchOpen] = useState(false);
  const [motifPattern, setMotifPattern] = useState<MotifPattern>({ nodes: [], edges: [] });
  const [motifNodes, setMotifNodes] = useState<SketchNode[]>([]);
  const [motifEdges, setMotifEdges] = useState<SketchEdge[]>([]);
  const [selectedHopDistance, setSelectedHopDistance] = useState<number>(1);
  const [isHopSelectionMode, setIsHopSelectionMode] = useState<boolean>(false);
  const [isToolsVisible, setIsToolsVisible] = useState<boolean>(false);
  const cyRef = useRef<any>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'sif' | 'graphml'>('json');

  const handleHopDistanceSelection = useCallback((event: any) => {
    if (!isHopSelectionMode || !cyRef.current) return;
    const node = event.target;
    if (node === cyRef.current) {
      setIsHopSelectionMode(false);
      return;
    }
    const { allNodes } = findSameTypeNeighborsWithPaths(node, selectedHopDistance);
    cyRef.current.nodes().forEach((n: any) => {
      if (allNodes.includes(n.id())) {
        n.style('opacity', '1');
      } else {
        n.style('opacity', '0.3');
      }
    });
    const selectedNodeIds = allNodes.map(id => {
      const node = cyRef.current.getElementById(id);
      const nodeData = node.data();
      if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
        return nodeData.subComponents;
      }
      return [id];
    }).flat();
    onNodeSelect(selectedNodeIds, undefined, additionalCellSets, obsSetColor.find(c => c.path.includes(selectedNodeIds[0]))?.color, undefined, false);
  }, [isHopSelectionMode, selectedHopDistance, onNodeSelect, additionalCellSets, obsSetColor]);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    if (isHopSelectionMode) {
      cy.on('tap', handleHopDistanceSelection);
      cy.container().style.cursor = 'crosshair';
    }
    return () => {
      cy.removeListener('tap', handleHopDistanceSelection);
      if (cy.container()) cy.container().style.cursor = 'default';
    };
  }, [isHopSelectionMode, handleHopDistanceSelection]);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    const handleBackgroundClick = (evt: any) => {
      if (evt.target === cy && isHopSelectionMode) {
        cy.nodes().forEach((node: any) => {
          node.style('opacity', '1');
        });
        setIsHopSelectionMode(false);
      }
    };
    cy.on('tap', handleBackgroundClick);
    return () => {
      cy.removeListener('tap', handleBackgroundClick);
    };
  }, [isHopSelectionMode]);

  const searchMotif = async () => {
    if (!state.data || !cyRef.current) return;
    const { nodes, links } = state.data;
    const graph = new Graph({ type: 'directed' });
    nodes.forEach(node => {
      graph.addNode(node.id, { type: node.ftuName });
    });
    links.forEach(link => {
      graph.addEdge(link.source, link.target, { type: 'glomeruli_to_nerve' });
      graph.addEdge(link.target, link.source, { type: 'nerve_to_glomeruli' });
    });
    const isSubgraphMatch = (nodeMapping: Map<string, string>): boolean => {
      if (nodeMapping.size !== motifPattern.nodes.length) return false;
      for (const patternEdge of motifPattern.edges) {
        const sourceNode = nodeMapping.get(patternEdge.source);
        const targetNode = nodeMapping.get(patternEdge.target);
        if (!sourceNode || !targetNode) return false;
        const edge = graph.edge(sourceNode, targetNode);
        if (!edge || graph.getEdgeAttributes(edge).type !== patternEdge.type) {
          return false;
        }
      }
      return true;
    };
    const findSubgraphIsomorphisms = () => {
      const results: Set<string>[] = [];
      const glomeruliNodes = nodes.filter(n => n.ftuName === 'glomeruli');
      for (const startNode of glomeruliNodes) {
        const visited = new Set<string>();
        const nodeMapping = new Map<string, string>();
        const firstPatternNode = motifPattern.nodes.find(n => n.type === 'glomeruli');
        if (!firstPatternNode) continue;
        nodeMapping.set(firstPatternNode.id, startNode.id);
        visited.add(startNode.id);
        const tryMapRemainingNodes = (patternNodeIndex: number): void => {
          if (patternNodeIndex >= motifPattern.nodes.length) {
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
          const possibleNodes = nodes.filter(n =>
            n.ftuName === currentPatternNode.type &&
            !visited.has(n.id)
          );
          for (const node of possibleNodes) {
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
    const foundMatches = findSubgraphIsomorphisms();
    
    // Filter out duplicate motifs that contain the same node IDs in different orders
    const uniqueMatches: Set<string>[] = [];
    const seenNodeSets = new Set<string>();
    
    foundMatches.forEach(match => {
      // Convert the Set to a sorted array and then to a string for comparison
      const sortedNodeIds = Array.from(match).sort();
      const nodeSetKey = sortedNodeIds.join(',');
      
      if (!seenNodeSets.has(nodeSetKey)) {
        seenNodeSets.add(nodeSetKey);
        uniqueMatches.push(match);
      }
    });
    
    const cy = cyRef.current;
    
    // Clear all node selections first
    cy.nodes().unselect();
    
    // Select all nodes that are part of any motif match for visual feedback
    const allMatchedNodes = new Set<string>();
    uniqueMatches.forEach(match => {
      match.forEach(nodeId => allMatchedNodes.add(nodeId));
    });
    
    cy.nodes().forEach((node: any) => {
      if (allMatchedNodes.has(node.id())) {
        node.select();
      }
    });

    // Create separate selections for each motif instance
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
      setTimeout(resolve, 500);
    });

    // Step 2: Create a separate selection for each motif instance
    for (let i = 0; i < uniqueMatches.length; i++) {
      const match = uniqueMatches[i];
      const matchNodeIds: string[] = [];
      
      match.forEach(nodeId => {
        const node = cyRef.current.getElementById(nodeId);
        if (node.length > 0) {
          const nodeData = node.data();
          if (nodeData.ftuName === 'nerves' && nodeData.id.startsWith('merged_')) {
            nodeData.subComponents.forEach((subId: string) => {
              matchNodeIds.push(subId);
            });
          } else {
            matchNodeIds.push(nodeId);
          }
        }
      });

      if (matchNodeIds.length > 0) {
        await new Promise<void>((resolve) => {
          const result = onNodeSelect(matchNodeIds, undefined, latestAdditionalCellSets, latestCellSetColor, latestCellSetSelection, true);
          if (result) {
            latestAdditionalCellSets = result.nextAdditionalCellSets;
            latestCellSetColor = result.nextCellSetColor;
            latestCellSetSelection = result.nextCellSetSelection;
          }
          setTimeout(resolve, 1000);
        });
      }
    }
  };

  const handlePatternChange = (pattern: MotifPattern) => {
    setMotifPattern(pattern);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://network-hidive.s3.eu-central-1.amazonaws.com/modified_network_kidney_20_10.json');
        if (!response.ok) throw new Error('Failed to fetch network data');
        const data = await response.json();
        setState({ data, infoText: '' });
      } catch (e) {
        setState({ data: undefined, infoText: 'Could not fetch network data!' });
      }
    };
    fetchData();
  }, []);

  const handleExportGraph = () => {
    if (!cyRef.current || !state.data) return;
    
    if (exportFormat === 'json') {
      // Export in Cytoscape.js format (for web applications)
      const json = cyRef.current.json();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "network-export.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else if (exportFormat === 'csv') {
      // Export nodes as CSV
      const nodesCsv = [
        ['id', 'ftuName', 'subComponents'].join(','),
        ...state.data.nodes.map(node => [
          node.id,
          node.ftuName,
          node.subComponents ? node.subComponents.join(';') : ''
        ].join(','))
      ].join('\n');
      
      const nodesDataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(nodesCsv);
      const nodesDownloadNode = document.createElement('a');
      nodesDownloadNode.setAttribute("href", nodesDataStr);
      nodesDownloadNode.setAttribute("download", "network-nodes.csv");
      document.body.appendChild(nodesDownloadNode);
      nodesDownloadNode.click();
      nodesDownloadNode.remove();
      
      // Export edges as CSV
      const edgesCsv = [
        ['source', 'target'].join(','),
        ...state.data.links.map(link => [
          link.source,
          link.target
        ].join(','))
      ].join('\n');
      
      const edgesDataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(edgesCsv);
      const edgesDownloadNode = document.createElement('a');
      edgesDownloadNode.setAttribute("href", edgesDataStr);
      edgesDownloadNode.setAttribute("download", "network-edges.csv");
      document.body.appendChild(edgesDownloadNode);
      edgesDownloadNode.click();
      edgesDownloadNode.remove();
    } else if (exportFormat === 'sif') {
      // SIF (Simple Interaction Format) - directly compatible with Cytoscape desktop
      const sifContent = state.data.links.map(link => 
        `${link.source} pp ${link.target}`
      ).join('\n');
      
      const sifDataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(sifContent);
      const sifDownloadNode = document.createElement('a');
      sifDownloadNode.setAttribute("href", sifDataStr);
      sifDownloadNode.setAttribute("download", "network.sif");
      document.body.appendChild(sifDownloadNode);
      sifDownloadNode.click();
      sifDownloadNode.remove();
      
      // Export node attributes with color and style information
      const nodeAttributes = [
        ['Node', 'ftuName', 'color', 'borderColor', 'size', 'opacity', 'subComponents'].join('\t'),
        ...state.data.nodes.map(node => {
          const nodeColor = node.ftuName === 'glomeruli' ? 'red' : 'yellow';
          let borderColor = '#999';
          let opacity = '0.3';
          
          if (node.ftuName === 'nerves' && node.id.startsWith('merged_') && node.subComponents) {
            const coloredSubComponent = node.subComponents.find(subId => cellColors.has(subId));
            if (coloredSubComponent) {
              borderColor = `rgb(${cellColors.get(coloredSubComponent)?.join(',')})`;
              opacity = '1';
            }
          } else if (cellColors.has(node.id)) {
            borderColor = `rgb(${cellColors.get(node.id)?.join(',')})`;
            opacity = '1';
          }
          
          return [
            node.id,
            node.ftuName,
            nodeColor,
            borderColor,
            '15',
            opacity,
            node.subComponents ? node.subComponents.join(';') : ''
          ].join('\t');
        })
      ].join('\n');
      
      const nodeAttrDataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(nodeAttributes);
      const nodeAttrDownloadNode = document.createElement('a');
      nodeAttrDownloadNode.setAttribute("href", nodeAttrDataStr);
      nodeAttrDownloadNode.setAttribute("download", "network-node-attributes.txt");
      document.body.appendChild(nodeAttrDownloadNode);
      nodeAttrDownloadNode.click();
      nodeAttrDownloadNode.remove();
      
      // Export edge attributes
      const edgeAttributes = [
        ['Edge', 'source', 'target', 'width', 'color', 'style'].join('\t'),
        ...state.data.links.map(link => [
          `${link.source} (pp) ${link.target}`,
          link.source,
          link.target,
          '1',
          '#999',
          'solid'
        ].join('\t'))
      ].join('\n');
      
      const edgeAttrDataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(edgeAttributes);
      const edgeAttrDownloadNode = document.createElement('a');
      edgeAttrDownloadNode.setAttribute("href", edgeAttrDataStr);
      edgeAttrDownloadNode.setAttribute("download", "network-edge-attributes.txt");
      document.body.appendChild(edgeAttrDownloadNode);
      edgeAttrDownloadNode.click();
      edgeAttrDownloadNode.remove();
    } else if (exportFormat === 'graphml') {
      // GraphML format - directly compatible with Cytoscape desktop
      const graphmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <key id="ftuName" for="node" attr.name="ftuName" attr.type="string"/>
  <key id="subComponents" for="node" attr.name="subComponents" attr.type="string"/>
  <graph id="G" edgedefault="undirected">
${state.data.nodes.map(node => `    <node id="${node.id}">
      <data key="ftuName">${node.ftuName}</data>
      <data key="subComponents">${node.subComponents ? node.subComponents.join(';') : ''}</data>
    </node>`).join('\n')}
${state.data.links.map((link, index) => `    <edge id="e${index}" source="${link.source}" target="${link.target}"/>`).join('\n')}
  </graph>
</graphml>`;
      
      const graphmlDataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(graphmlContent);
      const graphmlDownloadNode = document.createElement('a');
      graphmlDownloadNode.setAttribute("href", graphmlDataStr);
      graphmlDownloadNode.setAttribute("download", "network.graphml");
      document.body.appendChild(graphmlDownloadNode);
      graphmlDownloadNode.click();
      graphmlDownloadNode.remove();
    }
  };

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
        background: '#1e1e1e',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        width: isToolsVisible ? '280px' : '40px',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        border: '1px solid #333'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isToolsVisible ? '8px' : '0',
          paddingBottom: isToolsVisible ? '6px' : '0',
          borderBottom: isToolsVisible ? '1px solid #333' : 'none'
        }}>
          {isToolsVisible && (
            <h4 style={{
              margin: 0,
              fontSize: '12px',
              color: '#e0e0e0',
              fontWeight: 500
            }}>Network Tools</h4>
          )}
          <button
            onClick={() => setIsToolsVisible(!isToolsVisible)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
              fontSize: '14px',
              color: '#e0e0e0',
              transition: 'color 0.2s ease',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              marginLeft: isToolsVisible ? '0' : 'auto'
            }}
          >
            {isToolsVisible ? '−' : '+'}
          </button>
        </div>
        {isToolsVisible && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'sif' | 'graphml')}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  fontSize: '10px',
                  backgroundColor: '#2d2d2d',
                  color: '#e0e0e0',
                  marginBottom: '6px'
                }}
              >
                <option value="sif">SIF (Cytoscape Desktop)</option>
                <option value="graphml">GraphML (Cytoscape Desktop)</option>
                <option value="csv">CSV (Nodes & Edges)</option>
                <option value="json">JSON (Web Apps)</option>
              </select>
              <button
                onClick={handleExportGraph}
                style={{
                  backgroundColor: '#4477AA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 2px 4px rgba(68,119,170,0.2)'
                }}
              >
                Export Graph
              </button>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                {/* <button
                  onClick={() => setIsHopSelectionMode(!isHopSelectionMode)}
                  style={{
                    backgroundColor: isHopSelectionMode ? '#4477AA' : '#2d2d2d',
                    color: isHopSelectionMode ? 'white' : '#e0e0e0',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isHopSelectionMode ? 'Cancel' : 'Select by Hop Distance'}
                </button> */}
                {/* {isHopSelectionMode && (
                  <select
                    value={selectedHopDistance}
                    onChange={(e) => setSelectedHopDistance(Number(e.target.value))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #333',
                      fontSize: '10px',
                      backgroundColor: '#2d2d2d',
                      color: '#e0e0e0'
                    }}
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'hop' : 'hops'}
                      </option>
                    ))}
                  </select>
                )} */}
              </div>
              {isHopSelectionMode && (
                <div style={{
                  fontSize: '10px',
                  color: '#999',
                  marginTop: '4px'
                }}>
                  Click a node to select all nodes of the same type within {selectedHopDistance} {selectedHopDistance === 1 ? 'hop' : 'hops'}
                </div>
              )}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '1px solid #333'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '12px',
                color: '#e0e0e0',
                fontWeight: 500
              }}>Motif Search</h4>
              <button
                onClick={() => setIsMotifSearchOpen(!isMotifSearchOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  fontSize: '14px',
                  color: '#e0e0e0',
                  transition: 'color 0.2s ease'
                }}
              >
                {isMotifSearchOpen ? '−' : '+'}
              </button>
            </div>
            {isMotifSearchOpen && (
              <div style={{ marginBottom: '6px' }}>
                <MotifSketch
                  onPatternChange={handlePatternChange}
                  initialNodes={motifNodes}
                  initialEdges={motifEdges}
                  onNodesChange={setMotifNodes}
                  onEdgesChange={setMotifEdges}
                  nodeTypes={Array.from(new Set(state.data.nodes.map((node: Node) => node.ftuName)))}
                />
                <div style={{
                  fontSize: '10px',
                  marginBottom: '6px',
                  color: '#999',
                  padding: '4px 8px',
                  backgroundColor: '#2d2d2d',
                  borderRadius: '4px'
                }}>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await searchMotif();
                    } catch (error) {
                      console.error('Error searching for motif:', error);
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#4477AA',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    width: '100%',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(68,119,170,0.2)'
                  }}
                >
                  Search Motif
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div style={{
        width: '100%',
        height: '100%',
        paddingLeft: isToolsVisible ? '300px' : '50px',
        transition: 'padding-left 0.3s ease'
      }}>
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
    </div>
  );
};

export default NetworkVis;