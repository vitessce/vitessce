import { ScatterplotLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import { log } from '@vitessce/globals';

// The ScatterplotLayer fragment shader computes the distance from
// the fragment to the center of the circle using the Euclidean norm.
// For square spots, we instead use the Chebyshev (L-infinity) norm,
// so that the fragments with distance <= radius form a square
// with side length 2 * radius (and the stroke follows the square outline).
const DIST_TO_CENTER_ORIGINAL = 'float distToCenter = length(unitPosition) * outerRadiusPixels;';
const DIST_TO_CENTER_REPLACEMENT = `\
float distToCenter = (
    uIsSquare
    ? max(abs(unitPosition.x), abs(unitPosition.y))
    : length(unitPosition)
  ) * outerRadiusPixels;`;

const defaultProps = {
  spotShape: { type: 'string', value: 'circle', compare: true },
};

/**
 * A ScatterplotLayer which can render each point as
 * either a circle or a square, via the spotShape prop.
 */
export default class SpotLayer extends ScatterplotLayer {
  getShaders() {
    const shaders = super.getShaders();
    if (!shaders.fs.includes(DIST_TO_CENTER_ORIGINAL)) {
      log.warn('SpotLayer: unable to modify ScatterplotLayer fragment shader; spots will be rendered as circles.');
      return shaders;
    }
    return {
      ...shaders,
      fs: shaders.fs
        .replace('uniform bool antialiasing;', 'uniform bool antialiasing;\nuniform bool uIsSquare;')
        .replace(DIST_TO_CENTER_ORIGINAL, DIST_TO_CENTER_REPLACEMENT),
    };
  }

  draw(opts) {
    const { spotShape } = this.props;
    super.draw({
      ...opts,
      uniforms: {
        ...opts.uniforms,
        uIsSquare: spotShape === 'square',
      },
    });
  }
}

SpotLayer.layerName = 'SpotLayer';
SpotLayer.defaultProps = defaultProps;
