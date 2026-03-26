---
id: ng-guide
title: Neuroglancer View Navigation Guide
sidebar_label: Neuroglancer View Navigation Guide
slug: /ng-guide
---

# Neuroglancer View Navigation Guide

This guide covers the key interactions available in the Neuroglancer view.

---

## Coloring Cells by Cell Set

The cell colors in Neuroglancer view represents the color by their cell set grouping. Selecting/unselecting the group in the cell set panel will update the selection in the  Neuroglancer view. Similarly, lasso selection on the Scatter plot view updates the cells.

:::info
If no cell set is selected, cells will appear in their default grey color.
:::
---

## Repositioning the Volume

To reposition the volume within the coordinate system, hold **Shift** and drag
within the Neuroglancer view. This pans the volume without changing the zoom level
or rotation.

| Interaction | Control |
|---|---|
|  Pan the volume | shift + left click & drag |
|  Rotate the volume | Drag (no modifier) |
|  Zoom in / out | ctrl + mouse wheel (on trackpads, slide two fingers apart) |
|  Center a cell/mesh | right click on it |

---



## Zooming in on a Specific Cell

Right-clicking anywhere in the Neuroglancer view repositions the viewstate so that
the clicked coordinate becomes the new center. This makes it easy to zoom in on a
particular cell:

**Right-click** on a cell of interest — the view recenters on that coordinate.


