/* Keep exporting everything for backwards compatibility */
import {
  Component as ComponentV1,
  CoordinationType as CoordinationTypeV1,
  FileType as FileTypeV1,
  DataType as DataTypeV1,
} from './v1/v1-constants';
import {
  ViewType,
  CoordinationType as CoordinationTypeV2,
  FileType as FileTypeV2,
  DataType as DataTypeV2,
  EntityTypes,
} from './v2/v2-constants';

function makeConstantWithDeprecationMessage(fullObj, oldObj) {
  const oldKeys = Object.keys(oldObj);
  const handler = {
    get(obj, prop) {
      if (oldKeys.includes(prop)) {
        console.warn(`The constant mapping ${prop}: ${obj[prop]} was deprecated in package version 2.0.0 and will be removed in 3.0.0.`);
      }
      return obj[prop];
    },
  };
  const objWithMessage = new Proxy(fullObj, handler);
  return objWithMessage;
}

const CoordinationTypeFull = {
  ...CoordinationTypeV1,
  ...CoordinationTypeV2,
};

const FileTypeFull = {
  ...FileTypeV1,
  ...FileTypeV2,
};

const DataTypeFull = {
  ...DataTypeV1,
  ...DataTypeV2,
};

const CoordinationType = makeConstantWithDeprecationMessage(
  CoordinationTypeFull, CoordinationTypeV1,
);
const FileType = makeConstantWithDeprecationMessage(FileTypeFull, FileTypeV1);
const DataType = makeConstantWithDeprecationMessage(DataTypeFull, DataTypeV1);
const Component = makeConstantWithDeprecationMessage(ComponentV1, ComponentV1);

export {
  Component,
  ViewType,
  EntityTypes,
  CoordinationType,
  FileType,
  DataType,
};
