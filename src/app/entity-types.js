import {
  getDefaultEntityTypeValues,
  getDataTypeEntityTypesMapping,
} from './plugins';


export function getEntityTypeKey(dataType, entityTypes) {
  const defaultEntityTypeValues = getDefaultEntityTypeValues();
  const dataTypeEntityTypesMapping = getDataTypeEntityTypesMapping();
  const entityTypeNames = dataTypeEntityTypesMapping[dataType];
  const entityTypeArr = entityTypeNames.map(name => (
    entityTypes[name] || defaultEntityTypeValues[name]
  ));
  return entityTypeArr;
}
