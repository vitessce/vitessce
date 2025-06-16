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
  onNodeSelect: (nodeIds: string[]) => void;
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
    onNodeSelect(selectedNodeIds);
  }, [isHopSelectionMode, selectedHopDistance, onNodeSelect]);

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

  const searchMotif = () => {
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
    const cy = cyRef.current;
    cy.nodes().forEach((node: any) => {
      if (foundMatches.some(match => match.has(node.id()))) {
        node.select();
      } else {
        node.unselect();
      }
    });
    const allMatchedNodes = new Set<string>();
    foundMatches.forEach(match => {
      match.forEach(nodeId => allMatchedNodes.add(nodeId));
    });
    onNodeSelect(Array.from(allMatchedNodes));
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
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <button
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
                </button>
                {isHopSelectionMode && (
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
                )}
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
                  onClick={searchMotif}
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