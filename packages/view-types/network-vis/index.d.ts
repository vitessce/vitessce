declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.svg';
declare module '*.ico';
declare module '*.webp';
declare module '*.gif';
declare module '*.ttf';

declare module '*.scss';
declare module '*.sass';

declare module '*.json';

declare const PRODUCTION: string;

declare interface Function {
   bindArgs(...boundArgs: any): (...args: any) => any;
   rebind(thisArg: any): (...args: any) => any;
}
declare module 'd3-force-boundary';
declare module 'cytoscape-lasso';
declare module 'cytoscape' {
   import type { Collection, EventObject } from 'cytoscape';
 
   interface Core {
     // Already defined
     lasso: (options?: {
       enabled?: boolean;
       lassoStartEvent?: string;
       lassoEndEvent?: string;
       lassoSelectNodes?: boolean;
       lassoSelectEdges?: boolean;
       lassoSelectionMode?: 'additive' | 'normal';
       lassoKey?: string;
       lassoThreshold?: number;
       lassoLineColor?: string;
       lassoLineWidth?: number;
       lassoLineDash?: number[];
       lassoStyle?: object;
       lassoHighlightEnabled?: boolean;
       lassoHighlightNodesColor?: string;
       lassoHighlightEdgesColor?: string;
       lassoInvert?: boolean;
       lassoSelectionEnabled?: boolean;
     }) => void;
 
     // ✅ Add these:
     ready(callback: () => void): void;
 
     on(events: string, callback: (event: EventObject) => void): void;
     on(events: string, selector: string, callback: (event: EventObject) => void): void;
 
     nodes(selector?: string): Collection;
   }
 
   export function use(extension: (cytoscape: typeof import('cytoscape')) => void): void;
 }
 