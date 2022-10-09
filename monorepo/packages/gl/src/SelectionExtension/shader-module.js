const vs = `
attribute float isSelected;
`;

const inject = {
  'vs:DECKGL_FILTER_GL_POSITION': `
    position.z += (1. - isSelected) * .00005; // Add a small z offset for unselected points in the positive direction i.e into the screen.
  `,
  'fs:#main-start': ` // Gets rid of bad border effects (active after deck.gl 8.5): https://github.com/visgl/deck.gl/pull/6081
    float distToCenterNew = length(unitPosition) * outerRadiusPixels;
    float inCircleNew = step(distToCenterNew, outerRadiusPixels);
    if (inCircleNew == 0.0) {
      discard;
    }
  `,
};

export default {
  name: 'selection',
  vs,
  inject,
};
