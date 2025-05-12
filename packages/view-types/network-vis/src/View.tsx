import React, { useEffect, useState, CSSProperties } from 'react';
// import * as styles from './app.module.scss';
// import MeshView from './mesh-view/mesh-view';
// import '/src/util/function-extensions';
import { UndirectedGraph } from 'graphology';
import { NetworkData, NetworkNode, NetworkLink, NodeClustering } from './data/network-data';
import { SynchronizationService } from './synchronization/synchronization-service';
import EgoGraphView from './ego-graph-view/ego-graph-view';
// import NeighborhoodGraphView from './neighborhood-graph-view/neighborhood-graph-view';
import { ClusterGraph } from './graphs/cluster-graph';
import ForceDirectedGraphView from './force-directed-graph-view/force-directed-graph-view';
import { Cosmograph } from '@cosmograph/react';
// import { networkVisConfig } from './network-vis-config';

const CosmographWrapper: React.FC<{
  nodes: any[];
  links: any[];
  nodeColor: (n: any) => string;
  nodeSize: number;
  spaceSize: number;
  disableSimulation: boolean;
  linkWidth: number;
  linkArrows: boolean;
  showDynamicLabels: boolean;
}> = (props) => {
  const CosmographComponent = Cosmograph as any;
  return <CosmographComponent {...props} />;
};

const graphColumnStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column', // This is the correct value for flexDirection
};
const bodyStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'black',
  fontFamily: "'Lucida Console'",
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const bodyDivStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

const containerStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  position: 'relative',
  flex: 1,
};

const dataSourceInputContainerStyle: CSSProperties = {
  height: '100%',
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 10,
};

const labelStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  color: 'white',
};

const pStyle: CSSProperties = {
  color: 'red',
  textAlign: 'center',
};

const sourceInfoStyle: CSSProperties = {
  position: 'absolute',
  left: 20,
  top: 20,
  color: 'white',
  fontSize: 15,
  zIndex: 10,
  cursor: 'pointer',
};


export default function View() {
  const [state, setState] = useState({
    data: undefined as NetworkData | undefined,
    infoText: '',
    dataSourceUrl: undefined,
    graph: undefined,
    clusterGraph: undefined,
    synchronizationService: undefined,
    showOnlyCosmograph: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response 
        let data: NetworkData;
        // if (json) {
        if (true) {
          // network_kidney_20_1, network_kidney_20_2, network_11k_cells, network_43k_cells, network.graphml
          response = await fetch('https://network-hidive.s3.eu-central-1.amazonaws.com/network_43k_cells.json');
          if (!response.ok) throw new Error('Failed to fetch network data');
          data = await response.json();
        } else {
          response = await fetch('https://network-hidive.s3.eu-central-1.amazonaws.com/network.graphml');
          if (!response.ok) throw new Error('Failed to fetch network data');
          const graphmlText = await response.text();
           const parser = new DOMParser();
           const xmlDoc = parser.parseFromString(graphmlText, 'text/xml');

           // Parse nodes
           const nodeElements = xmlDoc.getElementsByTagName('node');
           const nodes: NetworkNode[] = Array.from(nodeElements).map((node) => {
              const id = node.getAttribute('id') || '';
              const attrs: { [key: string]: string } = {};
              Array.from(node.getElementsByTagName('data')).forEach((data) => {
                 const key = data.getAttribute('key')?.replace('d', '') || '';
                 attrs[key] = data.textContent || '';
              });
              return {
                 id,
                 ftuName: attrs['2'], // ftuName
                 fileFormat: attrs['3'], // fileFormat
                 color: attrs['4'], // color
                 size: 1, // Default size
                 cell_type: attrs['2'], // Use ftuName as cell_type
                 subComponents: attrs['5']?.split(',') // subComponents
              };
           });

           // Parse edges
           const edgeElements = xmlDoc.getElementsByTagName('edge');
           const links: NetworkLink[] = Array.from(edgeElements).map((edge) => {
              const source = edge.getAttribute('source') || '';
              const target = edge.getAttribute('target') || '';
              const attrs: { [key: string]: string } = {};
              Array.from(edge.getElementsByTagName('data')).forEach((data) => {
                 const key = data.getAttribute('key')?.replace('d', '') || '';
                 attrs[key] = data.textContent || '';
              });
              return {
                 id: attrs['6'], // id
                 source,
                 target
              };
           });

           // Get colorByFtuName from graph attributes
           const graphElements = xmlDoc.getElementsByTagName('data');
           let colorByFtuName: { [key: string]: number } = {};
           Array.from(graphElements).forEach((data) => {
              const key = data.getAttribute('key')?.replace('d', '') || '';
              if (key === '1') {
                 // colorByFtuName
                 const colorMap = JSON.parse(data.textContent || '{}');
                 // Convert hex colors to numbers
                 Object.keys(colorMap).forEach((key) => {
                    const colorStr = colorMap[key];
                    if (typeof colorStr === 'string') {
                       colorByFtuName[key] = parseInt(colorStr.replace('#', ''), 16);
                    } else {
                       colorByFtuName[key] = colorStr;
                    }
                 });
              }
           });

           // Get clustering from graph attributes
           let clustering: NodeClustering | undefined = undefined;
           Array.from(graphElements).forEach((data) => {
              const key = data.getAttribute('key')?.replace('d', '') || '';
              if (key === '0') {
                 // clustering
                 clustering = JSON.parse(data.textContent || 'null');
              }
           });

           data = {
              nodes,
              links,
              colorByFtuName,
              clustering
           };
        }
        console.log('DATA:', data);

        if (data.nodes.length > 1000) {
          setState((prev:any) => ({
            ...prev,
            data,
            showOnlyCosmograph: true,
            infoText: '',
            dataSourceUrl: new URL(window.location.href),
          }));
          return;
        }

        const graph = new UndirectedGraph();
        data.nodes.forEach((node) => graph.addNode(node.id, { ...node }));
        data.links.forEach((link) => graph.addEdge(link.source, link.target, { ...link }));

        const clusterGraph = data.clustering ? new ClusterGraph(graph, data.clustering) : undefined;

        const synchronizationService = new SynchronizationService(
          clusterGraph,
          graph,
          Object.keys(data.colorByFtuName).length <= 2
        );

        setState((prev:any) => ({
          ...prev,
          data,
          graph,
          clusterGraph,
          synchronizationService,
          infoText: '',
          dataSourceUrl: new URL(window.location.href),
        }));
      } catch (e) {
        console.error(e);
        setState((prev) => ({ ...prev, infoText: 'Could not fetch network data!' }));
      }
    };

    fetchData();
  }, []);

  if (!state.data) {
    if (state.infoText==='Could not fetch network data!') return <p>Could not fetch network data!</p>;
    return <p>Loading network...</p>;
  }

  const networkViews: React.JSX.Element[] = [];
  if (state.showOnlyCosmograph) {
    networkViews.push(
      <CosmographWrapper
        nodes={state.data.nodes.map((n: any) => {
          const x = n.x;
          n.x = n.y;
          n.y = x;
          return n;
        })}
        links={state.data.links}
        nodeColor={(n: any) => n.color}
        nodeSize={4}
        spaceSize={8192}
        disableSimulation={true}
        linkWidth={0.5}
        linkArrows={false}
        showDynamicLabels={false}
      />
    );
  } else {
    let connectivityOverview: React.JSX.Element;
    if(false){}else{
      connectivityOverview=(
        <ForceDirectedGraphView
              synchronizationService={state.synchronizationService}
              data={state.data}
              graph={state.graph}
            />

      );

    }
    networkViews.push(
      <div style={graphColumnStyle}>
        {connectivityOverview}
        <EgoGraphView
        synchronizationService={state.synchronizationService}
        data={state.data}
        graph={state.graph}
        />
      </div>
    )
  }

  return (
    <>
      <div style={bodyStyle}>
        <div style={bodyDivStyle}>
          <div style={containerStyle}>
            <span style={sourceInfoStyle}>
              {/* SOURCE: {state.dataSourceUrl?.toString()} */}
            </span>
            {...networkViews}
          </div>
        </div>
      </div>
    </>
  );
}