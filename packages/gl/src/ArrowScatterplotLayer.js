

/* eslint-disable no-underscore-dangle */
import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { ScatterplotLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import { PALETTE } from '@vitessce/utils';


// Remove data and getPosition from the upstream default props
const {
  data: _data,
  getPosition: _getPosition,
  ..._upstreamDefaultProps
} = ScatterplotLayer.defaultProps;

// Default props added by us
const ourDefaultProps = {
  _validate: true,
};

const defaultProps = {
  ..._upstreamDefaultProps,
  ...ourDefaultProps,
};

// Reference: https://github.com/geoarrow/deck.gl-layers/blob/598a62cdae112129e12d43067d4f724f3742c9ed/src/layers/scatterplot-layer.ts#L98
export default class ArrowScatterplotLayer extends CompositeLayer {

  _renderRecordBatches() {
    const {
      data,
      id: layerId,
    } = this.props;

    // TODO: use all props except accessors.

    return (data ? data.map((batchData, batchIdx) => {
      const sublayerProps = this.getSubLayerProps({
        ...this.props,
        // Overwrite things from this.props
        id: `${layerId}-arrow-scatterplot-batch-${batchIdx}`,
        data: batchData,
        getPosition: (object, { index, data, target }) => {
          target[0] = data.src.x[index];
          target[1] = -data.src.y[index];
          target[2] = 0;
          return target;
        },
        getFillColor: (object, { index, data, target }) => {
          const code = data.src.setName_codes[index];
          const color = PALETTE[code % PALETTE.length];
          target[0] = color[0];
          target[1] = color[1];
          target[2] = color[2];
          return target;
        },
      });

      // TODO: create CompositeLayer to optimize
      
      return new ScatterplotLayer(sublayerProps)
    }) : []);
  }

  renderLayers() {
    return this._renderRecordBatches();
  }
}

ArrowScatterplotLayer.layerName = 'ArrowScatterplotLayer';
ArrowScatterplotLayer.defaultProps = defaultProps;
