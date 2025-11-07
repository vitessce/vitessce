/* eslint-disable no-unused-vars */
import { hconcat, vconcat } from './VitessceConfig.js';
import { AbstractAutoConfig } from './generate-config-helpers.js';

export class SpatialDataAutoConfig extends AbstractAutoConfig {
  getOptions() {
    const { zmetadata } = this;
    const options = {};

    const availableElements = zmetadata.filter(({ path }) => {
      const relPath = path.substring(1);
      return relPath.match(/^(tables|table|images|labels|shapes|points)\/([^/]*)$/);
    });

    availableElements.forEach(({ path, attrs }) => {
      const relPath = path.substring(1);

      const firstCoordinateSystem = attrs
        ?.multiscales?.[0]
        ?.coordinateTransformations?.[0]
        ?.output?.name;

      // Handle image elements.
      if (relPath.match(/^(images)\/([^/]*)$/)) {
        options.image = {
          path: relPath,
          coordinateSystem: firstCoordinateSystem,
          // TODO: support a fileUid property in the schema?
        };
      }
      // Handle labels elements.
      if (relPath.match(/^(labels)\/([^/]*)$/)) {
        options.obsSegmentations = {
          path: relPath,
          coordinateSystem: firstCoordinateSystem,
          // TODO: support a fileUid property in the schema?
        };

        // TODO: check which table annotates these labels.
      }

      // Handle shapes elements.
      /*
      if (relPath.match(/^(shapes)\/([^/]*)$/)) {
        // TODO: check if shapes are circles or polygons
        // to determine which Vitessce data type to use.
        options.obsSpots = {
          path: relPath,
          coordinateSystem: firstCoordinateSystem,
        };

        // TODO: check which table annotates these shapes.
      }

      // Handle point elements.
      if (relPath.match(/^(points)\/([^/]*)$/)) {
        options.obsPoints = {
          path: relPath,
          coordinateSystem: firstCoordinateSystem,
        };

        // TODO: check which table annotates these shapes.
      }
      */

      // Handle table elements.
      if (relPath.match(/^(tables|table)\/([^/]*)$/)) {
        // Identify all sub-paths within this table element.
        const tableEls = zmetadata.filter(({ path: subpath }) => subpath.startsWith(path));

        // Check if the table contains an X array.
        const hasX = tableEls.find(el => el.path === `${path}/X`);
        if (hasX) {
          options.obsFeatureMatrix = {
            path: hasX.path.substring(1),
            // region: null,
          };
        }

        // Check if the table contains an obs dataframe.
        const hasObs = tableEls.find(el => el.path === `${path}/obs`);
        /* if (hasObs) {
          const columnOrder = hasObs.attrs?.['column-order'];
          // Use the columns of this dataframe to configure the obsSets.
          options.obsSets = {
            // region: null,
            tablePath: relPath,
            obsSets: columnOrder.map(c => ({
              // TODO: determine whether this column is string/categorical.
              // TODO: determine whether this column contains too many
              // categories to make sense to consider a cell set.
              path: `${hasObs.path.substring(1)}/${c}`,
              name: c,
            })),
          };
        } */
      }
    });

    return options;
  }

  addFiles(vc, dataset) {
    const { url, fileType } = this;
    dataset.addFile({
      url,
      fileType,
      options: this.getOptions(),
      // TODO: coordination values?
    });
  }

  // eslint-disable-next-line class-methods-use-this
  addViews(vc, dataset, layoutOption) {
    const options = this.getOptions();

    // Add spatialBeta/layerControllerBeta views.
    const spatialView = vc.addView(dataset, 'spatialBeta');
    const lcView = vc.addView(dataset, 'layerControllerBeta');

    const controlViews = [lcView];
    // If obsSets are present, add obsSets view.
    if (options.obsSets) {
      const obsSets = vc.addView(dataset, 'obsSets');
      controlViews.push(obsSets);
    }
    // If obsFeatureMatrix is present, add featureList view.
    if (options.obsFeatureMatrix) {
      const featureList = vc.addView(dataset, 'featureList');
      controlViews.push(featureList);
    }

    // TODO: set up coordination stuff here?

    // Layout.
    vc.layout(hconcat(spatialView, vconcat(...controlViews)));
  }
}
