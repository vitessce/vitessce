import {
  useQueryParam,
  StringParam as StringQueryParam,
  ArrayParam as StringArrayQueryParam,
} from 'use-query-params';
import { useHashParam } from './use-hash-param.js';

const DtypeToParamType = {
  string: StringQueryParam,
  'string-array': StringArrayQueryParam,
  // Use string param for boolean since use-query-params only supports 0/1.
  boolean: StringQueryParam,
};

function isTruthyString(v) {
  return ['1', 'true'].includes(String(v).toLowerCase());
}

function useHashOrQueryParamAux(paramName, defaultValue, dtype) {
  const [valueQ, setValueQ] = useQueryParam(paramName, DtypeToParamType[dtype]);
  const [valueH, setValueH] = useHashParam(paramName, undefined, dtype);

  if (dtype === 'boolean') {
    const boolValueQ = valueQ !== undefined ? isTruthyString(valueQ) : undefined;
    const boolValueH = valueH !== undefined ? isTruthyString(valueH) : undefined;

    return valueQ ? [boolValueQ, setValueQ] : [boolValueH, setValueH];
  }

  if (dtype === 'string-array') {
    // eslint-disable-next-line max-len
    if (Array.isArray(valueH) && valueH.length > 0 && (!Array.isArray(valueQ) || valueQ.length === 0)) {
      // Check for ; delimiter in individual array values, and split if necessary.
      const splitValues = valueH.map(item => item.split(';')).flat();
      return [splitValues, setValueH];
      // eslint-disable-next-line max-len
    } if (Array.isArray(valueQ) && valueQ.length > 0 && (!Array.isArray(valueH) || valueH.length === 0)) {
      // Check for ; delimiter in individual array values, and split if necessary.
      const splitValues = valueQ.map(item => item.split(';')).flat();
      return [splitValues, setValueQ];
    }
    return [null, setValueH];
  }
  if (Array.isArray(valueQ) || Array.isArray(valueH)) {
    throw new Error(`Expected non-array values for "${paramName}".`);
  }


  if (valueQ && valueH) {
    throw new Error(`Both query and hash parameters provided for "${paramName}". Please provide only one.`);
  }

  return valueQ ? [valueQ, setValueQ] : [valueH, setValueH];
}

export function useHashOrQueryParam(paramName, defaultValue, dtype) {
  const [value, setValue] = useHashOrQueryParamAux(paramName, defaultValue, dtype);
  try {
    return [value, setValue, false];
  } catch (error) {
    return [value, setValue, error.message];
  }
}
