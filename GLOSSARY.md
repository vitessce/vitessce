# Glossary

Each of these terms might refer to a conceptual class, or a particular instance. Hopefully clear in context.

## `component`
One of the main rectangles on the screen, and its corresponding definition in the `viewconf`. (If you mean React components more generally, make that explicit.)

Examples: `Spatial` or `Heatmap` or `TitleInfo`, either the source code, the configuration, or the rectangle on the screen, depending on context.

## `source`
A URL, a `source type`, and optionally, an ID. We don't associate any semantics with the URL string. The type will determine a schema to validate against, and will be used to subtype the load `event`. The optional ID (Not yet implemented!) will allow components to be more precise in the events they publish and subscribe.

Example: URL `https://example.com/.../cells.json` plus type `CELLS`.

## `source type`
A string given with the source which determines the load `event` to publish. These can be broad: If a particular `component` doesn't make sense with a particular `source`, just don't use it, or specialize it by ID. Right now, I don't think we have a need for super-types or sub-types.

Examples: `CELLS`, `MOLECULES`, `RASTER`

## `layer`
The rendering of one `source` within the spatial `component`, implemented by a Deck.gl composite layer.

Examples: Cell outline or raster layers.

## `viewconf`
(Let's spell it that way to be consistent.) The JSON data structure which lists the `sources` and `components` and their arrangement.

Examples: These are currently defined in api.js.

## `event`
Vitessce is built on a pubsub framework. `component`s subscribe to classes of `event`s, and publish individual `event`s in turn. Each `event` has a string message and a JSON payload.

Examples: Event messages include `raster.add` and `cells.hover`.
