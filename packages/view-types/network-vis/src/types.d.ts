// declare module 'cytoscape-canvas' {
//   import { Core } from 'cytoscape';

//   interface CanvasLayer {
//     getCanvas(): HTMLCanvasElement;
//     resetTransform(ctx: CanvasRenderingContext2D): void;
//     clear(ctx: CanvasRenderingContext2D): void;
//   }

//   interface CanvasExtension {
//     cyCanvas(options: { zIndex: number }): CanvasLayer;
//   }

//   const canvas: (cy: Core) => CanvasExtension;
//   export default canvas;
// }

// declare module 'cytoscape' {
//   interface Core {
//     cyCanvas(options: { zIndex: number }): CanvasLayer;
//   }
// } 