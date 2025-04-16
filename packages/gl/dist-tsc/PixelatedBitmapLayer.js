import { BitmapLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import { CompositeLayer } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { PIXELATED_TEXTURE_PARAMETERS } from './heatmap-constants.js';
// These are the same defaultProps as for BitmapLayer.
const defaultProps = {
    ...BitmapLayer.defaultProps,
    image: { type: 'object', value: null, async: true },
    bounds: { type: 'array', value: [1, 0, 0, 1], compare: true },
    desaturate: {
        type: 'number', min: 0, max: 1, value: 0,
    },
    transparentColor: { type: 'color', value: [0, 0, 0, 0] },
    tintColor: { type: 'color', value: [255, 255, 255] },
};
export default class PixelatedBitmapLayer extends CompositeLayer {
    renderLayers() {
        const { image } = this.props;
        return new BitmapLayer(this.props, {
            id: `${this.props.id}-wrapped`,
            image,
            textureParameters: PIXELATED_TEXTURE_PARAMETERS,
        });
    }
}
PixelatedBitmapLayer.layerName = 'PixelatedBitmapLayer';
PixelatedBitmapLayer.defaultProps = defaultProps;
