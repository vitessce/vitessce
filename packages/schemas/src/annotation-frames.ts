/**
 * Attribution: Originally written by @RPSeaman
 * Reference: https://github.com/vitessce/vitessce/pull/2528
 */
import { z } from 'zod';

const shapeBaseObj = z.object({
  uid: z.string(),
  text: z.string().optional(),
  strokeColor: z.array(z.number()).length(3).optional(),
  strokeWidth: z.number().optional(),
  // SVG-style dash pattern, e.g. "10 5" or "10 20 30 10". "none" or omitted = solid.
  strokeDashArray: z.string().optional(),
  visible: z.boolean().optional(),
  // TODO: define unit modes for x and y axes ("pixels" vs "normalized" vs "physical" etc.)
  // TODO: a coordinate system identifier (e.g., "DeckGL" for now, but a coordinate system from OME-NGFF/SpatialData eventually?)
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

const ellipseShapeObj = shapeBaseObj.extend({
  type: z.literal('ellipse'),
  // OME-XML field names verbatim (centre point + radii)
  x1: z.number(),
  y1: z.number(),
  radiusX: z.number(),
  radiusY: z.number(),
  fillColor: z.array(z.number()).length(3).optional(),
  fillOpacity: z.number().optional(),
});

const polygonShapeObj = shapeBaseObj.extend({
  type: z.literal('polygon'),
  // OME-XML: array of [x, y] coordinate pairs, closed automatically
  points: z.array(z.tuple([z.number(), z.number()])),
  fillColor: z.array(z.number()).length(3).optional(),
  fillOpacity: z.number().optional(),
});

const polylineShapeObj = shapeBaseObj.extend({
  type: z.literal('polyline'),
  // OME-XML: array of [x, y] coordinate pairs, open (not closed)
  points: z.array(z.tuple([z.number(), z.number()])),
  markerStart: z.enum(['Arrow']).nullable().optional(),
  markerEnd: z.enum(['Arrow']).nullable().optional(),
});

export const annotationShapeObj = z.discriminatedUnion('type', [
  rectangleShapeObj,
  lineShapeObj,
  ellipseShapeObj,
  polygonShapeObj,
  polylineShapeObj,
]);

export const annotationShapesArray = z.array(annotationShapeObj);

export const annotationFrameObj = z.object({
    uid: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    descriptionType: z.enum(['text', 'markdown']).optional(),

    // A frame can define per-view: coordinationValues (if the view's state should not be coordinated with other views)
    // or per-view coordinationScopes/coordinationScopesBy (if at this frame, the view should be coordinated with other views).

    // We can also define a frame-level coordination space, which will be merged with the global coordination space.
    // TODO: datasets
    // TODO: coordinationSpace
    layout: z.array(
        // Note: for now, we will infer view objects which have a uid that is present in the global layout, and do NOT have x/y/w/h defined, to mean that in this frame, the layout and set of views is unchanged from the global layout. This will allow each frame to omit the full list of views from the layout, and only specify the views whose coordination state is changing in this frame.
        // If a frame includes a view with a uid that is not present in the global layout, then that view will be added to the layout at this frame. This frame should also define x/y/w/h for all views, since it will otherwise be ambiguous how to layout the updated set of views for this frame.
        z.object({
            // When targetViews is an array, these views will be coordinated with each other.
            uid: z.string(), // The view UID. If this view uid is not present in the global layout, it will be added to the layout at this frame, and will need to have its coordination values initialized to their defaults for any that were not fully specified.
            coordinationValues: z.record(
                z.string(), // The coordination type name, e.g. "embeddingType"
                z.any() // The coordination value, e.g. "UMAP"
                // This should also support multi-level coordination via the schema defined in https://github.com/keller-mark/use-coordination/pull/115
            ).optional(),
            // TODO: support coordinationScopes/coordinationScopesBy for per-view coordination at this frame.
            // TODO: view x/y/w/h once we support view layout changes per-frame.
        })
    ).optional(),
});

export const annotationStoryObj = z.object({
    // TODO: schema version for the story schema? Same as current Vitessce schema version?
    uid: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    descriptionType: z.enum(['text', 'markdown']).optional(),
    frames: z.array(annotationFrameObj),
});
