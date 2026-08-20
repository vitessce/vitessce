---
name: vitessce-write-tests
description: Use when writing, adding, or updating unit tests in Vitessce. Covers Vitest conventions, file co-location, fixture files, and assertion patterns. Trigger when user says "write tests", "add unit tests", "test this function", "test coverage", "write a test for", or "how do I test this".
---

# Writing Tests in Vitessce

Vitessce uses **Vitest**, configured once at the root in `vite.config.mjs` and applied to each
sub-package listed in `vitest.workspace.ts` (which globs `packages/*`, `packages/view-types/*`,
`packages/file-types/*`, `packages/utils/*`, `packages/main/all`).

## File conventions

- Test files must live **inside the package's `src/` directory** — the Vitest `include` pattern is
  `src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`. A test outside `src/` is silently skipped.
- Test files are **co-located with source**: `MyComponent.test.tsx`, `utils.test.ts`
- Use `.test.jsx` / `.test.tsx` for files containing JSX
- Use `.test.js` / `.test.ts` for non-JSX files
- Toy data and fixtures go in co-located `*.test.fixtures.js` files

## Imports

```ts
import { describe, it, expect } from 'vitest';
```

## Pattern: test pure utility functions

Keep business logic in utility functions and test them with inline data and straightforward
assertions:

```ts
import { describe, it, expect } from 'vitest';
import { unnestMap } from './root.js';

describe('root.ts', () => {
  describe('unnestMap', () => {
    it('can flatten a Map with one level', () => {
      const m = new Map([
        ['Boxing', 1],
        ['Soccer', 2],
      ]);
      expect(unnestMap(m, ['sport', 'value'])).toEqual([
        { sport: 'Boxing', value: 1 },
        { sport: 'Soccer', value: 2 },
      ]);
    });
  });
});
```

## Pattern: component tests

`@testing-library/react` is available when a component test is genuinely warranted. Keep them
shallow — render, assert on visible text:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Status from './Status.js';

describe('Status.js', () => {
  it('shows warning', async () => {
    render(<Status warn="WARN" />);
    expect(await screen.findByText('WARN'));
  });
});
```

See `packages/view-types/status/src/Status.test.jsx` for the full example.

## Running tests

```bash
pnpm run test              # vitest --run (unit tests, all workspace packages)
pnpm run test-watch        # watch mode
pnpm run test-ui           # Vitest UI
pnpm run lint-fix          # fix linting issues
```

## Tips

- Prefer testing pure utility functions over React components — they're faster and more reliable.
  When component bodies get complex, refactor business logic into custom hooks or utility functions
  so that the core logic can be tested via plain unit tests.
- Shared data fixtures can be stored in `*.test.fixtures.js` files rather than inlined in test files.
- Utility functions shared across subpackages belong in one of the `packages/utils/*` sub-packages
  (`other-utils`, `sets-utils`, `spatial-utils`, `image-utils`, `zarr-utils`, `export-utils`).
