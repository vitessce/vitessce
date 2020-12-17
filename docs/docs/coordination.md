---
id: coordination
title: Coordination Model
sidebar_label: Coordination Model
slug: /coordination
---

Vitessce supports *coordinated multiple views*, meaning that visualizations can be linked together on many properties.

The implementation of coordinated multiple views in Vitessce follows a coordination model proposed by Boukhelifa and Rodgers (Information Visualization 2003).

## Graph Representation

We can think about the coordination model as a graph in which there are three types of nodes: coordination types, coordination scopes, and views.

[![Coordination model as graph representation - multiple coordination types - node encoding](https://docs.google.com/drawings/d/e/2PACX-1vRdNNkA8lCXj62edJMB7i6dvDxYxlv127sg9ZvtS7fLMCatG5jh3AyD1A6yqnhTFqi5YIft-T1nsBIT/pub?w=800)](https://docs.google.com/drawings/d/1w64tYpHgkxgoUlmYw02HKM6q2GDiz_ev77TZFhqywi4/edit)

## Glossary

### Coordination Model
The term "coordination model" refers to the approach or architecture used to achieve view coordination (Roberts 2007).

### Coordination Type
In the context of Vitessce and the coordination model described by Boukhelifa and Rodgers (2003), the term "coordination type" refers to the property or parameter being coordinated, such as "spatial rotation" or "heatmap zoom" or "gene expression colormap". Vitessce and other visualization systems may require that coordination type values conform to a programming language-like type, such as the primitive "integer" or a more complex array or object schema.

### Coordination Scope
In the context of Vitessce, the term "coordination scope" refers to a named instance of a coordination type. Each (coordination type, view) tuple may map onto a different coordination scope. Views are "coordinated" if they are linked to a common coordination scope. Views may update their (coordination type, coordination scope) tuples if changes to the coordinated view connections are initiated by the user.

### Coordination Value
In the context of Vitessce, the term "coordination value" refers to the value of a given coordination scope at a given time.

### Coordination Object
In the context of Vitessce, the term "coordination object" refers to the container for a particular coordination type and its associated coordination scopes & values. There can be at most one coordination object for each coordination type.

### Coordination Space
In the context of the coordination model described by Boukhelifa and Rodgers (2003), the term "coordination space" refers to the container for all coordination objects in a visualization system. In Vitessce, the coordination space is stored in the view config in a serializable JSON format.

### Translation Function
Coordination values may be stored in an abstract format rather than the format required for any particular view. For this reason, coordinated views must define a translation function for each coordination type, which maps coordination values onto the native format used by the view. In the simplest case the identity function may be used.

