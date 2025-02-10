// @ts-check
/**
 * The exports from this file are not intended to be used for internal development.
 * They are only meant to be exported from the package's main index.js to enable
 * backwards compatibility.
 */

import {
  ViewType as ViewTypeCurr,
  DataType as DataTypeCurr,
  FileType as FileTypeCurr,
  CoordinationType as CoordinationTypeCurr,
} from '@vitessce/constants-internal';
import { log } from '@vitessce/globals';
import {
  ViewType as ViewTypeOld,
  DataType as DataTypeOld,
  FileType as FileTypeOld,
  CoordinationType as CoordinationTypeOld,
} from './constants-old.js';

/**
 * Creates a constant with a deprecation message.
 * @template {ViewTypeCurr | DataTypeCurr | FileTypeCurr | CoordinationTypeCurr} T
 * @param {T} currObj
 * @param {ViewTypeOld | DataTypeOld | FileTypeOld | CoordinationTypeOld} oldObj
 * @returns {T} A proxy object with deprecation warnings.
 */
function makeConstantWithDeprecationMessage(currObj, oldObj) {
  /** @type {ProxyHandler<any & string>} */
  const handler = {
    get(obj, prop) {
      const oldKeys = Object.keys(oldObj);
      const propKey = String(prop);
      if (oldKeys.includes(propKey)) {
        log.warn(`Notice about the constant mapping ${propKey}: '${oldObj[propKey][0]}':\n${oldObj[propKey][1]}`);
        return oldObj[propKey];
      }
      return obj[prop];
    },
  };
  // eslint-disable-next-line no-undef
  const objWithMessage = new Proxy(currObj, handler);
  return objWithMessage;
}

export const ViewType = makeConstantWithDeprecationMessage(
  ViewTypeCurr,
  ViewTypeOld,
);
export const DataType = makeConstantWithDeprecationMessage(
  DataTypeCurr,
  DataTypeOld,
);
export const FileType = makeConstantWithDeprecationMessage(
  FileTypeCurr,
  FileTypeOld,
);
export const CoordinationType = makeConstantWithDeprecationMessage(
  CoordinationTypeCurr,
  CoordinationTypeOld,
);
