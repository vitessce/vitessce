import { Core } from 'cytoscape';

declare module 'react-cytoscapejs' {
  interface CytoscapeComponentProps {
    elements: any[];
    style?: React.CSSProperties;
    layout?: any;
    stylesheet?: any[];
    cy?: (cy: Core) => void;
  }

  const CytoscapeComponent: React.FC<CytoscapeComponentProps>;
  export default CytoscapeComponent;
} 