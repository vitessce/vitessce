# Test protocol

This doesn't replace automated tests, but we do want a detailed explanation of the functionality.
The description below should work for any deployment.  All three major browsers (Safari, Chrome, Firefox) should be tested - if it's too much for just one person,
you can enlist the reviewer of version bump PR, for example.

## Welcome Page

 Bring up Vitessce. The welcome page should include:
 - A list of datasets
 - A description of the project
 - A link to HuBMAP, and thanks to the NIH for funding
 - Links to documentation, GitHub, and NPM.
 - Info about the current deployment.

 There is an input field where the URL of a config could be given.
 You can also paste a data URI like this: `data:,{"name":"FAKE", "description":"fake dataset", "layers":[], "staticLayout":[{"component":"description", "props":{"description": "Hello World"}, "x":0, "y": 0, "w": 2, "h": 2}]}`

## Application Layout

Click on "Linnarsson: Spatial organization of the somatosensory cortex revealed by cyclic smFISH".

While data loads, there should be a modal please-wait.

The components are arranged in three columns, with another component (heatmap) as a footer.
The components in the successive columns should be:
- Data Set, Status, Scatterplot (t-SNE)
- Spatial, Scatterplot (PCA)
- Factors, Expression Levels

Except for "Data Set" and "Status", each component should have summary in the upper right. In particular:
- For "Spatial": "4839 cells, 39 molecules at 2M locations"
- For "Heatmap": "4839 cells x 33 genes, with 0 cells selected"

- If you change the width of the window, the columns should resize responsively:
The right-most column (with radio buttons) should remain an approximately constant width,
while the first two columns will split the remainder 50/50.
- If you change the height of the window, the components should not resize:
If it's taller, there may be empty space, or if it's smaller the components may go out of view.
- There should not be a scrollbar on the window. (Though this design choice could be argued.)

The components themselves can be moved and resized.
- Click on the "Data Set" title in the upper left and drag it down over "Status":
They should swap positions.
- Drag the handle in the lower right of the "Data Set" component:
You can make it larger or smaller.

## Component Interactions

The most complicated component is "Spatial", and other components relate to it.

Change the Spatial viewport:
- Drag within the view, and it should move, and the mouse cursor should be a grabbing hand.
- Do the mouse gesture for zoom, and it should zoom.
(For me, it's a two finger swipe up and down on trackpad.)

Change the Spatial layers:
- Hover over "Layers": The menu should become opaque.
- Starting at the top, turn off each layer in turn, and you are left with just a black view.
- Turn "cells" back on: You should have an arc of small grey blobs. (Or rectangles, if you zoom in enough.)

Hover:
- As you move the mouse over different cells, the "Status" component should update.

Select cells:
- Click on the marquee tool, and drag a rectangle over the middle of the view.
- When you release the mouse, the cells contained in your rectangle should be brighter.
- The corresponding points in the scatterplots should also be brighter.
- On the heatmap, there should be tickmarks above the matrix, corresponding to your cells.

Color the cells:
- Leave a subset of cells selected.
- Click the "subcluster" radio button in the "Factors" component.
All the components are now more colorful:
- In "Spatial", you should see layers of cells with similar types.
- In "Scatterplot (t-SNE)", you should see each cluster given a different color.
- In "Scatterplot (PCA)", the pattern is less clear.
- In "Heatmap", there should now be a corresponding band of color across the top.
- The selected cells should remain brighter than the unselected cells.
