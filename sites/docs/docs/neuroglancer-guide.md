---
id: ng-guide
title: Neuroglancer View Navigation Guide
sidebar_label: Neuroglancer View Navigation Guide
slug: /ng-guide
---

# Neuroglancer View Navigation Guide

This guide covers the key interactions available in the Neuroglancer view.


## Controlling the Camera

| Interaction | How To |
|---|---|
|  Rotate the camera | click & drag |
|  Zoom in / out | <kbd>CTRL</kbd> + scroll (with mouse wheel or trackpad gesture) |
|  Center on a specific cell/mesh | right-click on the item of interest |



## Repositioning the Volume

To reposition the volume within the coordinate system, hold <kbd>SHIFT</kbd> and drag
within the Neuroglancer view. This pans the volume without changing the zoom level
or rotation.

| Interaction | How To |
|---|---|
|  Pan the volume | <kbd>SHIFT</kbd> + click & drag |



## Coloring Cells by Cell Set

The cell colors in Neuroglancer view correspond to their cell set grouping. Selecting/unselecting the group in the cell set manager view will update the selection in the  Neuroglancer view. Similarly, lasso selection on the scatterplot view will create a new cell set, and subsequently color the selected cells.

:::info
If no cell set is selected, cells will appear in their default grey color.
:::
