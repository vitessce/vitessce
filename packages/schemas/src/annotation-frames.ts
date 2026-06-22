import { z } from 'zod';

const shapeBaseObj = z.object({
  uid: z.string(),
  // ViewType name for the view that renders this shape; omitted defaults to 'spatial'.
  // Mirrors OME's TheZ/TheT/TheC plane-association: shapes declare which view they belong to.
  targetView: z.string().optional(),
  // Coordination values the target view must have, e.g. { embeddingType: 'UMAP' }.
  // Required when multiple views share the same ViewType (e.g. UMAP + PCA scatterplots).
  targetCoordinationValues: z.record(z.string(), z.any()).optional(),
  text: z.string().optional(),
  strokeColor: z.array(z.number()).length(3).optional(),
  strokeWidth: z.number().optional(),
  visible: z.boolean().optional(),
});

const rectangleShapeObj = shapeBaseObj.extend({
  type: z.literal('rectangle'),
  // OME-XML field names verbatim (upper-left origin)
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fillColor: z.array(z.number()).length(3).optional(),
  fillOpacity: z.number().optional(),
});

const lineShapeObj = shapeBaseObj.extend({
  type: z.literal('line'),
  // OME-XML field names verbatim
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  markerStart: z.enum(['Arrow']).nullable().optional(),
  markerEnd: z.enum(['Arrow']).nullable().optional(),
  textPosition: z.enum(['start', 'middle', 'end']).optional(),
  textBufferPx: z.number().optional(),
});

const annotationShapeObj = z.discriminatedUnion('type', [
  rectangleShapeObj,
  lineShapeObj,
]);

// Per-view viewState entry — same targetView + targetCoordinationValues pattern as shapes.
// A scatterplot entry with embeddingType: 'UMAP' applies only to the UMAP panel;
// one with embeddingType: 'PCA' applies only to the PCA panel; etc.
const viewStateEntryObj = z.object({
  targetView: z.string(),
  targetCoordinationValues: z.record(z.string(), z.any()).optional(),
  // Spatial-specific
  spatialZoom: z.number().optional(),
  spatialTargetX: z.number().optional(),
  spatialTargetY: z.number().optional(),
  spatialTargetZ: z.number().optional(),
  spatialImageLayer: z.any().optional(),
  spatialSegmentationLayer: z.any().optional(),
  spatialPointLayer: z.any().optional(),
  spatialNeighborhoodLayer: z.any().optional(),
  // Scatterplot-specific
  embeddingZoom: z.number().optional(),
  embeddingTargetX: z.number().optional(),
  embeddingTargetY: z.number().optional(),
});

// Flat viewState — cross-view coordination only (feature selection, color encoding, etc.)
// Kept for backward compatibility; per-view zoom/pan should use viewStates[] instead.
const viewStateObj = z.object({
  spatialZoom: z.number().optional(),
  spatialTargetX: z.number().optional(),
  spatialTargetY: z.number().optional(),
  spatialTargetZ: z.number().optional(),
  spatialImageLayer: z.any().optional(),
  spatialSegmentationLayer: z.any().optional(),
  spatialPointLayer: z.any().optional(),
  spatialNeighborhoodLayer: z.any().optional(),
  embeddingZoom: z.number().optional(),
  embeddingTargetX: z.number().optional(),
  embeddingTargetY: z.number().optional(),
  featureSelection: z.array(z.string()).nullable().optional(),
  obsColorEncoding: z.string().optional(),
  obsSetSelection: z.array(z.array(z.string())).nullable().optional(),
}).optional();

export const annotationFrameObj = z.array(
  z.object({
    uid: z.string(),
    title: z.string().optional(),
    text: z.string().optional(),
    shapes: z.array(annotationShapeObj).default([]),
    viewStates: z.array(viewStateEntryObj).optional(),
    viewState: viewStateObj,
  }),
).nullable();
