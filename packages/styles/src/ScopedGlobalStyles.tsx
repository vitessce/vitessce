import React, { useMemo } from 'react';
import { GlobalStyles, CSSObject } from 'tss-react';


function prependParentClassName(jssObject: CSSObject, parentClassName: string): CSSObject {
  return Object.entries(jssObject).reduce<CSSObject>((accumulator, [key, value]) => {
    accumulator[`.${parentClassName} ${key}`] = value;
    return accumulator;
  }, {});
}

export interface ScopedGlobalStylesProps {
  styles: CSSObject;
  parentClassName: string;
}

export function ScopedGlobalStyles(props: ScopedGlobalStylesProps) {
  const { styles, parentClassName } = props;

  const component = useMemo(() => {
    const computedStyles = prependParentClassName(
      styles,
      parentClassName,
    );
    return (
      <GlobalStyles styles={computedStyles} />
    );
  }, [parentClassName, styles]);
  return component;
}
