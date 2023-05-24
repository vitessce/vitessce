/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
import GL from '@luma.gl/constants';
import { LayerExtension } from '@deck.gl/core';
import module from './shader-module.js';

export default class SelectionExtension extends LayerExtension {
  // eslint-disable-next-line class-methods-use-this
  getShaders() {
    return {
      modules: [module],
    };
  }

  initializeState(context, extension) {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.add({
        isSelected: {
          type: GL.FLOAT,
          size: 1,
          transition: true,
          accessor: 'getCellIsSelected',
          defaultValue: 1,
          // PolygonLayer needs not-intsanced attribute but
          // ScatterplotLayer needs instanced.
          divisor: Number(extension.opts.instanced),
        },
      });
    }
  }
}

SelectionExtension.extensionName = 'SelectionExtension';
