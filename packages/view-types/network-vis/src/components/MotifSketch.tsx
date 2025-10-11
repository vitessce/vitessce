import React, { useEffect, useRef, useState, useCallback } from 'react';
import paper from 'paper';
import { getNodeColor, EDGE_TYPES, NODE_TYPE_CONFIG } from '../constants';

interface SketchNode {
  id: string;
  type: string;
  position: paper.Point;
  circle: paper.Path.Circle;
}

interface SketchEdge {
  id: string;
  source: string;
  target: string;
  path: paper.Path;
}

interface MotifPattern {
  nodes: {
    id: string;
    type: string;
  }[];
  edges: {
    source: string;
    target: string;
    type: string;
  }[];
}

interface MotifSketchProps {
  onPatternChange: (pattern: MotifPattern) => void;
  initialNodes: SketchNode[];
  initialEdges: SketchEdge[];
  onNodesChange: (nodes: SketchNode[]) => void;
  onEdgesChange: (edges: SketchEdge[]) => void;
  nodeTypes: string[];
}

const MotifSketch: React.FC<MotifSketchProps> = ({
  onPatternChange,
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentNodeType, setCurrentNodeType] = useState<string>(nodeTypes[0] || '');
  const [nodes, setNodes] = useState<SketchNode[]>(initialNodes);
  const [edges, setEdges] = useState<SketchEdge[]>(initialEdges);
  const [connectionStartNode, setConnectionStartNode] = useState<SketchNode | null>(null);

  // Update parent component when nodes or edges change
  useEffect(() => {
    onNodesChange(nodes);
    onEdgesChange(edges);
  }, [nodes, edges, onNodesChange, onEdgesChange]);

  // Update pattern when nodes or edges change
  useEffect(() => {
    const patternNodes = nodes.map(node => ({
      id: node.id,
      type: node.type
    }));

    const patternEdges = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)!;
      const targetNode = nodes.find(n => n.id === edge.target)!;
      
      // Use the first node type in NODE_TYPE_CONFIG as the primary type
      const primaryNodeType = Object.keys(NODE_TYPE_CONFIG)[0];
      return {
        source: edge.source,
        target: edge.target,
        type: sourceNode.type === primaryNodeType ? EDGE_TYPES.forwardEdge : EDGE_TYPES.reverseEdge
      };
    });

    onPatternChange({
      nodes: patternNodes,
      edges: patternEdges
    });
  }, [nodes, edges, onPatternChange]);

  // Initialize Paper.js and restore state
  useEffect(() => {
    if (!canvasRef.current) return;

    paper.setup(canvasRef.current);
    paper.view.onResize = () => {
      paper.view.viewSize = new paper.Size(canvasRef.current!.clientWidth, canvasRef.current!.clientHeight);
    };

    // Restore nodes and edges if they exist
    if (nodes.length > 0) {
      nodes.forEach(node => {
        const circle = new paper.Path.Circle(node.position, 8);
        circle.fillColor = new paper.Color(getNodeColor(node.type));
        circle.strokeColor = new paper.Color('#333');
        circle.strokeWidth = 1;
        circle.shadowColor = new paper.Color('#000');
        circle.shadowBlur = 2;
        circle.shadowOffset = new paper.Point(1, 1);
        node.circle = circle;
      });
    }

    if (edges.length > 0) {
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          const path = new paper.Path.Line(sourceNode.position, targetNode.position);
          path.strokeColor = new paper.Color('#999');
          path.strokeWidth = 2;
          edge.path = path;
        }
      });
    }

    return () => {
      paper.project.clear();
    };
  }, []);

  const clearDrawing = () => {
    paper.project.clear();
    setNodes([]);
    setEdges([]);
    onPatternChange({ nodes: [], edges: [] });
  };

  // Handle canvas click
  const handleCanvasClick = useCallback((event: paper.ToolEvent) => {
    const point = event.point;
    
    // Check if clicked on an existing node
    const clickedNode = nodes.find(node => 
      node.circle.contains(point)
    );

    if (clickedNode) {
      if (connectionStartNode) {
        // If we have a start node and clicked a different node, create connection
        if (connectionStartNode.id !== clickedNode.id) {
          // Check if edge already exists
          const edgeExists = edges.some(edge => 
            (edge.source === connectionStartNode.id && edge.target === clickedNode.id) ||
            (edge.source === clickedNode.id && edge.target === connectionStartNode.id)
          );

          if (!edgeExists) {
            // Create edge with modern styling
            const path = new paper.Path.Line(connectionStartNode.position, clickedNode.position);
            path.strokeColor = new paper.Color('#666');
            path.strokeWidth = 1.5;
            path.strokeCap = 'round';
            path.strokeJoin = 'round';

            const newEdge: SketchEdge = {
              id: `edge-${edges.length + 1}`,
              source: connectionStartNode.id,
              target: clickedNode.id,
              path
            };

            setEdges(prev => [...prev, newEdge]);
          }

          // Reset connection state
          connectionStartNode.circle.strokeColor = new paper.Color('#333');
          connectionStartNode.circle.strokeWidth = 1;
          connectionStartNode.circle.shadowColor = new paper.Color('transparent');
          connectionStartNode.circle.shadowBlur = 0;
          setConnectionStartNode(null);
        } else {
          // Clicked the same node, cancel connection
          clickedNode.circle.strokeColor = new paper.Color('#333');
          clickedNode.circle.strokeWidth = 1;
          clickedNode.circle.shadowColor = new paper.Color('transparent');
          clickedNode.circle.shadowBlur = 0;
          setConnectionStartNode(null);
        }
      } else {
        // Start new connection
        setConnectionStartNode(clickedNode);
        // Highlight the node
        clickedNode.circle.strokeColor = new paper.Color('#4477AA');
        clickedNode.circle.strokeWidth = 2;
        clickedNode.circle.shadowColor = new paper.Color('#4477AA');
        clickedNode.circle.shadowBlur = 5;
      }
    } else {
      // Create new node
      const circle = new paper.Path.Circle(point, 8);
      circle.fillColor = new paper.Color(getNodeColor(currentNodeType));
      circle.strokeColor = new paper.Color('#333');
      circle.strokeWidth = 1;
      circle.shadowColor = new paper.Color('#000');
      circle.shadowBlur = 2;
      circle.shadowOffset = new paper.Point(1, 1);

      const newNode: SketchNode = {
        id: `node-${nodes.length + 1}`,
        type: currentNodeType,
        position: point,
        circle
      };

      setNodes(prev => [...prev, newNode]);
    }
  }, [nodes, edges, currentNodeType, connectionStartNode]);

  // Handle mouse move for visual feedback
  const handleMouseMove = useCallback((event: paper.ToolEvent) => {
    if (connectionStartNode) {
      const point = event.point;
      
      // Check if hovering over a node
      const hoverNode = nodes.find(node => 
        node.id !== connectionStartNode.id && 
        node.circle.contains(point)
      );

      // Update cursor style
      if (hoverNode) {
        paper.view.element.style.cursor = 'pointer';
      } else {
        paper.view.element.style.cursor = 'default';
      }
    }
  }, [nodes, connectionStartNode]);

  // Initialize Paper.js tools
  useEffect(() => {
    if (!paper.project) return;

    const tool = new paper.Tool();
    tool.onMouseDown = handleCanvasClick;
    tool.onMouseMove = handleMouseMove;

    return () => {
      tool.remove();
    };
  }, [handleCanvasClick, handleMouseMove]);

  return (
    <div>
      <div style={{ 
        marginBottom: '8px',
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#2d2d2d',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getNodeColor(currentNodeType),
            display: 'inline-block'
          }} />
          <select
            value={currentNodeType}
            onChange={(e) => setCurrentNodeType(e.target.value)}
            style={{
              backgroundColor: '#2d2d2d',
              color: '#e0e0e0',
              border: 'none',
              fontSize: '10px',
              cursor: 'pointer',
              outline: 'none',
              padding: '2px 4px'
            }}
          >
            {nodeTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={clearDrawing}
          style={{
            backgroundColor: '#2d2d2d',
            color: '#e0e0e0',
            border: '1px solid #333',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          Clear
        </button>
      </div>
      <div style={{ 
        height: 150, 
        border: '1px solid #333', 
        borderRadius: '6px',
        backgroundColor: '#1e1e1e',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div style={{ 
        fontSize: '9px', 
        marginTop: '4px',
        color: '#999',
        textAlign: 'center'
      }}>
        Click to add nodes. Click on two nodes to connect them.
      </div>
    </div>
  );
};

export default MotifSketch; 