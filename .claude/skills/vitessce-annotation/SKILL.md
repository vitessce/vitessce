---
name: vitessce-annotation
description: Use when modifying the annotation state or annotation controller logic, including when rendering annotations or editing annotations.
---

# Annotations (Stories, Frames, and Shapes)

An **annotation story** is a guided sequence of **frames**. Each frame has text (title/description)
and, per view, a set of coordination values to apply (zoom, layers, selections, shapes, ...).
**Annotation shapes** (rectangles, lines, ellipses, polygons, polylines) are drawn on top of a view.

## Principles

1. **The story is read-only.** Never write to `annotationStory` (or to a frame within it) in
   response to user interaction or frame navigation. Treat the loaded/configured story like a
   file on disk. Only the AnnotationController and AnnotationControllerSubscriber components can modify an annotation story and this is the only view which may contain annotation authoring/editing functionality.
2. **Frames are merged into the coordination space, not read live.** When the current frame changes,
   the values the frame defines for a view are merged into the coordination space once. After that,
   views read the coordination space and setters write to it as usual, so the user can pan/zoom/etc.
   while a frame is active.
3. **Merging is cumulative.** A frame only overwrites what it specifies. Values it does not mention
   (including user changes) keep their current values. Setting `annotationFrameIndex` to `null`
   leaves the state untouched, with one exception: `annotationShapes`. Shapes never carry over
   between frames: when a frame is applied, a view's `annotationShapes` are set to the frame's
   shapes for that view, or cleared (set to `null`) if the frame does not define any. They are also
   cleared when the frame index becomes `null` (after a frame was active). See
   `getAnnotationFrameUpdate` in `packages/vit-s/src/state/hooks.js`.
4. **Frame values go where the view's setter would write them.** Single-level values are written
   in-place if the view defines the value directly (`view.coordinationValues`), otherwise into the
   scope(s) the view is mapped to (after meta-coordination), so linked views follow along.
   Multi-level values (`{ "$CL": [...] }`) are expanded into
   new scopes, and the view's existing (meta-)scope mapping is re-pointed to them.
5. **Each view applies its own frame entry.** Frames target views by `frame.layout[].uid`, which must
   match a view `uid` in the config layout. A view that should respond to frames must have a `uid`
   and must call `useAnnotationFrameCoordination`.


Relevant coordination types (`packages/constants-internal/src/constants.ts`): `annotationStory`,
`annotationFrameIndex` (`null` = no active frame), `annotationShapes`, `annotationOverlayVisible`,
`annotationSemanticZoom`, `annotationShapeSelection`, `annotationActiveTool`,
`annotationTransitionDuration`. Which views support them is defined in
`COMPONENT_COORDINATION_TYPES` in `packages/constants-internal/src/coordination.ts`.


### Provide a story in a config

Either embed it as a coordination value (`coordinationSpace.annotationStory.A = story`) or load it
as a file (`{ fileType: 'annotationStory.json', url }`, with `annotationStory: { A: null }`). In
example configs, inline the story and use `makeJsonDataUrl(story)` from `examples/configs/src/utils.js`
rather than depending on a hosted URL. Give every targeted view a `uid` (config version `1.0.10`+).

### Editing shapes

Edits (e.g., drawing with `annotationActiveTool`, selecting via `annotationShapeSelection`) change
the coordination space through the normal setters (e.g., `setAnnotationShapes`), never the story.
`AnnotationLayer` supports previewing an in-progress shape via its `inProgressShape`/`hoverCoord`
props.
