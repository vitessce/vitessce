import React, { ComponentProps, useMemo } from 'react';
import { GlobalStyles } from 'tss-react';

interface ScopedGlobalStylesProps {
  styles: Record<string, React.CSSProperties>;
  parentClassName: string;
}

type CSSProperties = ComponentProps<typeof GlobalStyles>['styles']

function prependParentClassName(
  jssObject: Record<string, React.CSSProperties>,
  parentClassName: string,
): CSSProperties {
  return Object.entries(jssObject).reduce<CSSProperties>(
    (accumulator, [key, value]) => {
      (accumulator as Record<string, React.CSSProperties>)[`.${parentClassName} ${key}`] = value;
      return accumulator;
    },
    {},
  );
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
