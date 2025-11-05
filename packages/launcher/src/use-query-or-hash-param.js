import {
  useQueryParam, StringParam as StringQueryParam, ArrayParam as StringArrayQueryParam,
} from 'use-query-params';
import { useHashParam } from './use-hash-param.js';

const DtypeToParamType = {
  string: StringQueryParam,
  'string-array': StringArrayQueryParam,
}

function useHashOrQueryParamAux(paramName, defaultValue, dtype) {
  const [valueQ] = useQueryParam(paramName, DtypeToParamType[dtype]);
  const [valueH] = useHashParam(paramName, undefined, dtype);
  
  if (dtype === 'string-array') {
    if(Array.isArray(valueH) && valueH.length > 0 && (!Array.isArray(valueQ) || valueQ.length === 0)) {
      // Check for ; delimiter in individual array values, and split if necessary.
      const splitValues = valueH.map(item => item.split(';')).flat();
      return splitValues;
    } else if (Array.isArray(valueQ) && valueQ.length > 0 && (!Array.isArray(valueH) || valueH.length === 0)) {
      // Check for ; delimiter in individual array values, and split if necessary.
      const splitValues = valueQ.map(item => item.split(';')).flat();
      return splitValues;
    } else {
      return null;
    }
  } else {
    if (Array.isArray(valueQ) || Array.isArray(valueH)) {
      throw new Error(`Expected non-array values for "${paramName}".`);
    }
  }

  if (valueQ && valueH) {
    throw new Error(`Both query and hash parameters provided for "${paramName}". Please provide only one.`);
  }

  return valueH ? valueH : valueQ;
}

export function useHashOrQueryParam(paramName, defaultValue, dtype) {
  try {
    return [useHashOrQueryParamAux(paramName, defaultValue, dtype), false];
  } catch (error) {
    return [defaultValue, error.message];
  }
}