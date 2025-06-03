import React, { useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core } from 'cytoscape';
import cytoscapeLasso from 'cytoscape-lasso';

// Register the lasso plugin
(cytoscape as any).use(cytoscapeLasso);

const createElements = (nodes: any[], links: any[], nodeColor: (n: any) => string, nodeSize: number) => [
  ...nodes.map(node => ({
    data: {
      id: node.id,
      color: nodeColor(node),
      size: nodeSize,
      ftuName: node.ftuName,
      subComponents: node.subComponents
    }
  })),
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
      'width': '15',
      'height': '15',
      'border-width': '0px'
    }
  },
  {
    selector: 'node:selected',
    style: {
      // 'border-width': '2px',
      // 'border-color': '#ffffff',
      // 'border-style': 'solid',
      'width': '20',
      'height': '20',

    }
  },
  {
    selector: 'node.highlighted',
    style: {
      'border-width': '2px',
      'border-color': '#00ff00',
      'border-style': 'solid'
    }
  },
  {
    selector: 'node.hovered',
    style: {
      'border-width': '2px',
      'border-color': '#ffffff',
      'border-style': 'solid',
      'width': '15',
      'height': '15'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': '1',
      'line-color': '#999',
      'curve-style': 'straight'
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
  onNodeSelect: (nodeIds: string[]) => void;
  obsSetSelection: string[][];
  obsHighlight: string | null;
}> = ({ nodes, links, onNodeSelect, obsSetSelection, obsHighlight }) => {
  const cyRef = React.useRef<any>(null);
  const selectionTimeoutRef = React.useRef<number | null>(null);

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
              selectedNodeIds.push(`${subId}000`);
            });
          } else {
            // For regular nerve nodes, add 000 suffix
            selectedNodeIds.push(`${nodeData.id}000`);
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
      elements={createElements(nodes, links, nodeColor, 10)}
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

interface NetworkVisProps {
  onNodeSelect: (nodeIds: string[]) => void;
  obsSetSelection: string[][];
  obsSetColor: Array<{ path: string[]; color: [number, number, number] }>;
  obsHighlight: string | null;
  additionalCellSets: any;
  setAdditionalCellSets: (sets: any) => void;
}

const NetworkVis: React.FC<NetworkVisProps> = ({
  onNodeSelect,
  obsSetSelection,
  obsSetColor,
  obsHighlight,
  additionalCellSets,
  setAdditionalCellSets,
}) => {
  const [state, setState] = React.useState({
    data: undefined,
    infoText: '',
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://network-hidive.s3.eu-central-1.amazonaws.com/network_kidney_20_10v2.json');
        if (!response.ok) throw new Error('Failed to fetch network data');
        const data = await response.json();

        const filteredData = filterMotif(data.nodes, data.links);

        setState({
          // data: filteredData,
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
      <CytoscapeWrapper 
        nodes={state.data.nodes} 
        links={state.data.links} 
        onNodeSelect={onNodeSelect}
        obsSetSelection={obsSetSelection}
        obsHighlight={obsHighlight}
      />
    </div>
  );
};

export default NetworkVis;