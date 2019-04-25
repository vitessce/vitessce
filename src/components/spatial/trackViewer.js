import { viewer } from 'higlass';

export default function trackViewer(element, [xMin, xMax, yMin, yMax], trackConfig) {
  if (!trackConfig.options) {
    trackConfig.options = {};
  }
  if (!trackConfig.options.colorbarPosition) {
    trackConfig.options.colorbarPosition = 'hidden';
    // If the colorbar were all SVG, I could change the colorbar Z position,
    // and move the whole thing around, but apart from the handlebars,
    // I think it's all part of the canvas, right?
  }
  if (!trackConfig.options.labelPosition) {
    trackConfig.options.labelPosition = false;
    // TODO: Is this best idiom?
  }
  const id = 'arbitary-id';
  const viewConfig = {
    editable: false,
    zoomFixed: false,
    views: [
      {
        uid: id,
        initialXDomain: [xMin, xMax],
        initialYDomain: [yMin, yMax],
        tracks: {
          center: [trackConfig],
        },
        layout: {
          w: 12,
          h: 12,
          x: 0,
          y: 0,
          moved: false,
          static: false,
        },
      },
    ],
  };
  return {
    id,
    hgApi: viewer(element, viewConfig, { bounded: true }),
  };
}
