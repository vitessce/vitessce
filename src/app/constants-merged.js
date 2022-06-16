/**
 * The exports from this file are not intended to be used for internal development.
 * They are only meant to be exported from the package's main index.js to enable
 * backwards compatibility.
 */
import {
  Component as ComponentCurr,
  DataType as DataTypeCurr,
  FileType as FileTypeCurr,
  CoordinationType as CoordinationTypeCurr,
} from './constants';
import {
  Component as ComponentOld,
  DataType as DataTypeOld,
  FileType as FileTypeOld,
  CoordinationType as CoordinationTypeOld,
} from './constants-old';

function makeConstantWithDeprecationMessage(currObj, oldObj) {
  const handler = {
    get(obj, prop) {
      const oldKeys = Object.keys(oldObj);
      if (oldKeys.includes(prop)) {
        console.warn(`Notice about the constant mapping ${prop}: '${oldObj[prop][0]}':\n${oldObj[prop][1]}`);
        return oldObj[prop];
      }
      return obj[prop];
    },
  };
  const objWithMessage = new Proxy(currObj, handler);
  return objWithMessage;
}

export const Component = makeConstantWithDeprecationMessage(
  ComponentCurr,
  ComponentOld,
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
