import { jsxs as _jsxs } from "react/jsx-runtime";
import { add } from '@vitessce/utils';
export function MyComponent(props) {
    const { a, b, color } = props;
    return (_jsxs("p", { style: { color }, children: [a, "+", b, "=", add(a, b, 1)] }));
}
