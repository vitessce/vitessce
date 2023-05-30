# Test protocol

This doesn't replace automated tests, but we do want a detailed explanation of the functionality.
The description below should work for any deployment.  All three major browsers (Safari, Chrome, Firefox) should be tested - if it's too much for just one person,
you can enlist the reviewer of the version bump PR, for example.

If the release involves heavy changes to functionality that is used in the Portal, it may be a good idea to build locally and test there.
```bash
npm run-script build-lib && npm pack
cd ../path/to/portal-ui
cd context
npm i ../path/to/vitessce/vitessce-VERSION.tar.gz
cd ..
./dev-start.sh
```

## Welcome Page

 Bring up Vitessce. The welcome page should include:
 - A list of datasets
 - A description of the project
 - A link to HuBMAP, and thanks to the NIH for funding
 - Links to documentation, GitHub, and NPM.
 - Info about the current deployment.

 There is an input field where the URL of a config could be given.
 You can also paste a data URI like this: `data:,{"name":"FAKE", "version": "0.1.0", "description":"fake dataset", "layers":[], "staticLayout":[{"component":"description", "props":{"description": "Hello World"}, "x":0, "y": 0, "w": 2, "h": 2}]}`

## HuBMAP view configs
- CODEX (bitmask segmentations) http://localhost:3000/?url=https://portal.hubmapconsortium.org/browse/dataset/69d9c52bc9edb625b496cecb623ec081.vitessce.json
- SLIDE-seq (diamond segmentations) http://localhost:3000/?url=https://portal.hubmapconsortium.org/browse/dataset/2107df00633f703d39e1ec74c271a9e5.vitessce.json
- IMS 3D http://localhost:3000/?url=https://portal.hubmapconsortium.org/browse/dataset/a296c763352828159f3adfa495becf3e.vitessce.json

## Application Layout

Click on "Linnarsson: Spatial organization of the somatosensory cortex revealed by cyclic smFISH", and, after it loads, add `debug=true` as a URL argument before reloading the page.  Make sure that the dataset loads and you can do a few basic interactions without raising an error about the config schema being invalid.

Remove the argument `debug=true` and reload the page from the new url.  While data loads, there should be a spinner over every component on the grid, which disappear independently as data loads.

The components are arranged in four columns, with another component (heatmap) as a footer.
The components in the successive columns should be:
- Data Set, Layer Controller, Status
- Spatial
- Scatterplot (PCA),Scatterplot (t-SNE)
- Expression Levels, Cell-Sets

Except for "Data Set" and "Status", each component should have summary in the upper right. In particular:
- For "Spatial": "4839 cells, 39 molecules at 2M locations"
- For "Heatmap": "4839 cells x 33 genes, with 4839 cells selected"

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
- On the lefthand side, use the Layer Controller to change the opacity of each layer -  molecules should
slowly disappear while the cell boundaries should remain as opacity decreases.
- Turn on and off the molecules and cell segmentations layers.
- In the image layer, change the colormap, domain, and opacity - confirm that each works as expected.
  - The colormap should change the image so that both channels are in one colormap.
  - The domain should change considerably how the sliders display but not how the image renders.
  - Opacity should slowly decrease the opacity of whatever is shown in the image.
- Change the channels and try adding another channel as well as removing channels.
- Remove the image layer and then add it back.

Hover:
- As you move the mouse over different cells, the "Status" component should update.
- Tooltips should appear over all other components that show data except for the one on which you are hovering.
- Where the tooltip does not appear, crosshairs should appear instead.
- Hover over a cell in the scatterplot and confirm that the crosshair appears over a cell with the same color in the spatial plot.
- Hover over a cell in the spatial plot and confirm that the crosshair appears over a cell with the same color in the scatterplot.

Select cells:
- Click on the lasso tool, and make a selection over the middle of the view.
- When you release the mouse, the cells contained in your selection should be brighter.
- The corresponding points in the scatterplots should also be brighter.
- On the heatmap, only selected cells should appear.

Recenter the view:
- Repeat the following steps, once for Spatial view type and once for Scatterplot view type.
- Go to the respective view type and zoom in.
- Click on the `CenterFocusStrong` button on the top left of the view type.
- The view type should return back to its original position.

Color the cells:
- Leave a subset of cells selected.
- Click the "subcluster" radio button in the "Factors" component.
All the components are now more colorful:
- In "Spatial", you should see layers of cells with similar types.
- In "Scatterplot (t-SNE)", you should see each cluster given a different color.
- In "Scatterplot (PCA)", the pattern is less clear.
- In "Heatmap", there should now be a corresponding band of color across the top.
- The selected cells should remain brighter than the unselected cells.

Heatmap:
- Use the colormapping tool to bring out expression levels.
- Try zooming and panning.
- As you hover over cells in other components, the tooltip should appear in the middle of the label on the heatmap.

Finally, make sure you can download some of the available data (it will likely just appear as parsed JSON in another window).
