import React, { useMemo } from 'react';
import { GlobalStyles } from 'tss-react';

function prependParentClassName(jssObject, parentClassName) {
  return Object.entries(jssObject).reduce((accumulator, [key, value]) => {
    accumulator[`.${parentClassName} ${key}`] = value;
    return accumulator;
  }, {});
}

export function ScopedGlobalStyles(props) {
  const { styles, parentClassName } = props;

  const component = useMemo(() => {
    const computedStyles = prependParentClassName(
      styles,
      parentClassName,
    );
    return (
      <GlobalStyles styles={computedStyles} />
    );
  }, [parentClassName]);
  return component;
}
