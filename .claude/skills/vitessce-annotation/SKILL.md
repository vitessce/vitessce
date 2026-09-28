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
   views read the coordination space and setters write to it as usual, so the user can pan/zoom/etc. while a frame is active.
3. **Merging is cumulative.** A frame only overwrites what it specifies. Values it does not mention
   (including user changes) keep their current values. Setting `annotationFrameIndex` to `null`
   leaves the state untouched, with one exception: `annotationShapes`. Shapes never carry over
   between frames: when a frame is applied, a view's `annotationShapes` are set to the frame's
   shapes for that view, or cleared (set to `null`) if the frame does not define any. They are also
   cleared when the frame index becomes `null` (at the conclusion of a story). For this reason, when authoring annotations, ensure that shapes and other settings such as zoom or channel properties are specified explicitly per-frame if they are relevant to that frame, as the prior frame being viewed may have been out-of-order (in other words, frames may be viewed in an arbitrary order when the user selects frames from the frame list in the annotation controller). In addition, the user may have manually adjusted the controls by zooming/panning or changing image channel properties between frames in an unexpected way.
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
`annotationSemanticZoom`, `annotationEditable`,
`annotationTransitionDuration`. Which views support them is defined in
`COMPONENT_COORDINATION_TYPES` in `packages/constants-internal/src/coordination.ts`.


### Provide a story in a config

Either embed it as a coordination value (`coordinationSpace.annotationStory.A = story`) or load it
as a file (`{ fileType: 'annotationStory.json', url }`, with `annotationStory: { A: null }`). In
example configs, inline the story and use `makeJsonDataUrl(story)` from `examples/configs/src/utils.js`
rather than depending on a hosted URL. Give every targeted view a `uid` (config version `1.0.10`+).


## Story and frame schema

Defined in `packages/schemas/src/annotation-frames.ts`.

- `frame.layout[]` lists only the views whose state changes in the frame. A view listed with a `uid`
  from the global layout and no `x`/`y`/`w`/`h` means the layout and set of views stay the same as
  the global layout.
- `frame.layout[].coordinationValues` holds per-view values (single-level, or multi-level via
  `$CL`). Use these when the view's state at this frame does not need to be coordinated with other
  views through new scopes. The merge still writes into the view's existing scopes (principle 4).

**Planned for future implementation:**
- Support per-view `coordinationScopes`/`coordinationScopesBy` specified in each frame, for when views should be
  coordinated with each other at that frame.
- Support for frame-level `coordinationSpace`, merged with the global coordination space.
- Support for frame-level `datasets`.
- Support for per-frame layout changes via specifying view `x`/`y`/`w`/`h`. A frame that lists a view `uid` missing from the global layout would add that view at that frame, and would then need to define `x`/`y`/`w`/`h`
  for all views, since the layout would otherwise be ambiguous. Coordination values that such a
  view doesn't specify would be initialized to their defaults.

When implementing a planned feature, keep the principles above: the story stays read-only, and
frame state is merged into the coordination space instead of being read live.
