# Glossary

Each of these terms might refer to a conceptual class, or a particular instance. Hopefully clear in context.

## `component`
One of the main rectangles on the screen, and its corresponding definition in the `viewconf`. (If you mean React components more generally, make that explicit.)

Examples: `Spatial` or `Heatmap` or `TitleInfo`, either the source code, the configuration, or the rectangle on the screen, depending on context.

## `dataset file` or `source`
A `url`, a `data type`, and a `file type`. We don't associate any semantics with the URL string. For JSON file types, the file type will determine a JSON schema to validate against. Files with the same `data type`, regardless of their `file type`, should have the same JSON structure _after_ they are loaded by a loader instance.

Example: URL `https://example.com/.../some-cells.json`, data type `cells`, and file type `cells.json`.

## `spatial layer`
One array element in the value of a `spatialLayers` coordination scope.
The layer `type` corresponds to the `dataset file`'s `type`.
Spatial layers are rendered within the spatial `component`, implemented by a Deck.gl layer.
The `raster` layer type in particular is rendered by a [Viv](https://github.com/hms-dbmi/viv) Deck.gl layer.

## `viewconf`
(Let's spell it that way to be consistent.) The JSON data structure which lists the `datasets`, `components` and their arrangement in the `layout`.

Examples: These are currently defined in api.js.

# Coordination

The implementation of coordinated multiple views in Vitessce follows the coordination object model proposed by Boukhelifa and Rodgers (Information Visualization 2003).

Below left is Figure 1 from Boukhelifa and Rodgers.
Below right is that figure adapted to the Vitessce view config. 

[![Coordination object model in vitessce](https://user-images.githubusercontent.com/7525285/89790691-49008b00-daf0-11ea-95b5-cd74fe3499af.png)](https://docs.google.com/drawings/d/1jsNd2aG3OFlHfNzI3nfOl6UpMACw9JKyexCQUEd31fc/edit)

## Multiple Views
The term "multiple views" in the context of information visualization systems refers to "any instance where data is represented in multiple windows" (Roberts 2007).

## Coordinated Multiple Views
The term "coordinated multiple views" describes an instance of "multiple views" in which operations on the views are coordinated (although this is typically implied by the term "multiple views") (Roberts 2007).

## Coordination Model
The term "coordination model" refers to the approach or architecture used to achieve view coordination (Roberts 2007).

## Coordination Type
In the context of Vitessce and the coordination model described by Boukhelifa and Rodgers (2003), the term "coordination type" refers to the property or parameter being coordinated, such as "spatial rotation" or "heatmap zoom" or "gene expression colormap". Vitessce and other visualization systems may require that coordination type values conform to a programming language-like type, such as the primitive "integer" or a more complex array or object schema.

## Coordination Scope
In the context of Vitessce, the term "coordination scope" refers to a named instance of a coordination type. Each (coordination type, view) tuple may map onto a different coordination scope. Views are "coordinated" if they are linked to a common coordination scope. Views may update their (coordination type, coordination scope) tuples if changes to the coordinated view connections are initiated by the user.

## Coordination Value
In the context of Vitessce, the term "coordination value" refers to the value of a given coordination scope at a given time.

## Coordination Object
In the context of Vitessce, the term "coordination object" refers to the container for a particular coordination type and its associated coordination scopes & values. There can be at most one coordination object for each coordination type.

## Coordination Space
In the context of the coordination model described by Boukhelifa and Rodgers (2003), the term "coordination space" refers to the container for all coordination objects in a visualization system. In Vitessce, the coordination space is stored in the view configuration in a serializable JSON format.

## Translation Function
Coordination values may be stored in an abstract format rather than the format required for any particular view. For this reason, coordinated views must define a translation function for each coordination type, which maps coordination values onto the native format used by the view. In the simplest case the identity function may be used.
