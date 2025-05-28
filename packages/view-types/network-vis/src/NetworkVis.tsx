import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import cytoscapeLasso from 'cytoscape-lasso';
import lasso from 'cytoscape-lasso';

// cytoscape.use(lasso);


const createElements = (nodes: any[], links: any[], nodeColor: (n: any) => string, nodeSize: number) => [
  ...nodes.map(node => ({
    data: {
      id: node.id,
      color: nodeColor(node),
      size: nodeSize
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
      'width': '10',
      'height': '10',
      'border-width': '0px'
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': '2px',
      'border-color': '#ffffff',
      'border-style': 'solid'
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
}> = ({ nodes, links, onNodeSelect }) => {
  const [selectedNodes, setSelectedNodes] = React.useState<string[]>([]);

  const handleNodeSelect = (event: any) => {
    // Get all selected nodes from the cy instance
    const selectedNodeIds = event.cy.nodes(':selected').map((node: any) => node.id());
    setSelectedNodes(selectedNodeIds);
    console.log('Selected nodes:', selectedNodeIds);
    onNodeSelect(selectedNodeIds);
  };

  return (
    <CytoscapeComponent
      elements={createElements(nodes, links, nodeColor, 10)}
      style={{ width: '100%', height: '100%' }}
      layout={{ name: 'cose', fit: true, padding: 30 }}
      stylesheet={stylesheet}
      cy={(cy) => {
        // Wait for the graph to be ready
        cy.ready(() => {
          // Initialize lasso selection
          // cy.lasso({
          //   lassoInvert: false,
          //   lassoSelectionMode: 'additive',
          //   lassoStartEvent: 'mousedown',
          //   lassoEndEvent: 'mouseup',
          //   lassoKey: 'shift', // Hold shift to use lasso
          // });
          // cy.on('layoutstop', () => {
          //   cy.lasso({
          //     lassoInvert: false,
          //     lassoSelectionMode: 'additive',
          //     lassoStartEvent: 'mousedown',
          //     lassoEndEvent: 'mouseup',
          //     lassoKey: 'shift',
          //   });
          // });

          // Handle both regular and lasso selection
          cy.on('select', 'node', handleNodeSelect);
          cy.on('unselect', 'node', handleNodeSelect);
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
      try {// send json files
        const response = await fetch('https://network-hidive.s3.eu-central-1.amazonaws.com/network_kidney_20_1v2.json');
        // const response = await fetch('https://network-hidive.s3.eu-central-1.amazonaws.com/network.json');
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
      <CytoscapeWrapper nodes={state.data.nodes} links={state.data.links} onNodeSelect={onNodeSelect} />
    </div>
  );
};

export default NetworkVis;