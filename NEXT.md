This branch contains the code for a "next version" of Vitessce which will have the following key features:
- Coordinated multiple views
- Multi-dataset support
- Global state support

Please see the changelog for detailed information about what has been changed so far.

## Coordination object model

The implementation of coordinated multiple views here follows the coordination object model proposed by Boukhelifa and Rodgers (Information Visualization 2003).

Below left is Figure 1 from Boukhelifa and Rodgers. Below right is that figure adapted to the Vitessce view config. ([view the diagram on google drawings here](https://docs.google.com/drawings/d/1jsNd2aG3OFlHfNzI3nfOl6UpMACw9JKyexCQUEd31fc/edit)).

![Coordination object model in vitessce](https://user-images.githubusercontent.com/7525285/89790691-49008b00-daf0-11ea-95b5-cd74fe3499af.png)

Note that "Dataset" is also a coordination type here.


Perhaps another way to think of the coordination scopes model is:
- in Vitessce currently, state values are one-dimensional, and state is either global (via PubSub) or within-component.
- in the new model, state values (those that are held in coordination objects) are multi-dimensional and are always global. The "coordination scope" tells each component, for each state value, _which_ dimension of the state value should be used.


### Tradeoffs

Storing coordination state in the view config will make this state:
- easy to share
- easy to navigate forwards / backwards (for undo/redo)
- easy to bubble up to a Jupyter notebook or other analysis environment via event handlers

Challenges associated with storing coordination state in the view config:
- old Vitessce view configs will break (however we currently have control over all vitessce view configs: demos here and those in the HuBMAP Portal)
- need to provide an easy way for a user to set up a view config without overwhelming them by requiring every coordination to be explicitly defined
    - two possible solutions: "template" view configs or an "initialization strategy" view config field (to determine how to initialize missing coordination objects/scopes)

Including `dataset` as a coordination type allows:
- different components to be associated with different datasets
    - facilitates multi-dataset comparisons
- changing multiple components from some dataset `D1` to some other dataset `D2` would simply require setting one coordination scope value, from `D1` to `D2`.
    - For example, in the HuBMAP portal, the current dataset dropdown menu could be implemented as a very simple component which just changes the value of the `dataset` coordination object.
- getting rid of a global `RESET` event for resetting datasets, since components are already listening for changes to coordination objects


## Future UI ideas

As a first step, linking of views will mainly be controlled via view config definitions.
However, in the future, we would like to implement an interface to allow the end user to update linked views and coordination scopes during the exploration process.

A basic UI would allow the user to view and update the mappings from components to "coordination scopes" via simple dropdowns for each view and coordination type.

<img width="1417" alt="Screen Shot 2020-08-09 at 11 20 17 PM" src="https://user-images.githubusercontent.com/7525285/89749769-242bf980-da97-11ea-8136-4309b70f98c8.png">

<!--
For example, in the above mockup, notice that the PCA and t-SNE scatterplots have different coordination scopes for the "Cell Color Encoding" coordination type. Perhaps the value of the `Cell Color Encoding` coordination object looks like `{ A: 'cell-set-colors', B: 'gene-expression' }`, meaning that the PCA scatterplot cells would be colored by the colors of the currently-selected cell sets, while the t-SNE scatterplot cells would be colored by the gene expression values of the currently-selected gene.

This would also facilitate multi-dataset comparisons. For example, if you want to compare `linnarsson-2018` to `dries-2019`, just create two different scopes for the `dataset` coordination object. Then, map the half of the components to scope `A` and the other half to scope `B`, where the coordination object value looks like  `{ A: 'linnarsson-2018', B: 'dries-2019' }`. Then, let's say you want to switch the comparison, and now you want to compare `linnarsson-2018` to `spraggins-2020`. Then the only thing you need to do is update the coordination object `{ A: 'linnarsson-2018', B: 'spraggins-2020' }`. (Assuming the view config `datasets` property was an array containing the file URL mappings for all 3 datasets `linnarsson-2018`, `dries-2019`, and `spraggins-2020`).
-->

## Dataset loader objects

The loader objects for each file of each dataset can be thought as _derived from_ the "Dataset" coordination. Components receive a mapping from the `dataset` coordination type to a particular coordination scope (for example, scope `A`). Then, the component can "look up" the `dataset` value associated with their particular scope, to obtain their dataset ID (for example, `linnarsson-2018`). Then, the component can look up the loader instances of interest that are associated with `linnarsson-2018` (for example, the `ScatterplotSubscriber` would find an instance of the `JsonLoader` for the `cells` data type). These loader objects are created by a new `DatasetLoaderProvider` component, and passed down to all `___Subscriber` components via `VitessceGrid`.


## Selecting, filtering, and highlighting

In this process of coordinating views, I think we should also make better distinction between `selection`, `highlight`, and `filter` for cells, cell sets, and genes. These are my thoughts so far but of course open to other ideas:
- highlight: only for single items, only on mouse hover
- select: for one or more items, adds visual emphasis for the selected items in the visualizations (does **not** filter out non-selected items)
- filter: for one or more items, removes all other items from view, and removes all other items from consideration when doing searches or aggregation computations like `min`, `max`, `mean`, `sum`, etc.

Note that cell/cell-set/gene selection/highlight/filtering states could also be held in the coordination space, which would work out nicely, in particular when viewing multiple datasets or when performing differential expression (could just use two different scopes for a "Selected Cells" coordination object)


## Specific issues

Towards #30 
Towards #189 (overview/detail problem can be mostly solved by using two different plots with all of the same scope mappings, except the overview plot maps to a different zoom scope, and keeps that zoom scope value fixed)
Towards #693 (zoom/target reset problem reduces to updating a coordination object)
Towards #574 
Towards #465 
Towards #716 (the coordination objects are an example of global app state)

