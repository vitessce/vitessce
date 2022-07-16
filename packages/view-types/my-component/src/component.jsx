import { add } from '@vitessce/utils';

export function MyComponent(props) {
  const { a, b, color } = props;
  return (
    <p style={{ color }}>
      {a}+{b}={add(a, b, 1)}
    </p>
  );
}
