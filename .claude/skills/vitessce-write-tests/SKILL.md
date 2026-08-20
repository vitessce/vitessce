---
name: vitessce-write-tests
description: Use when writing, adding, or updating unit tests in Vitessce. Covers Vitest conventions, file co-location, fixture files, and assertion patterns. Trigger when user says "write tests", "add unit tests", "test this function", "test coverage", "write a test for", or "how do I test this".
---

# Writing Tests in Vitessce

Vitessce uses **Vitest** for unit testing.

## File Conventions

- Test files are **co-located with source**: `MyComponent.test.tsx`, `utils.test.ts`
- Use `.test.jsx` / `.test.tsx` for files containing JSX
- Use `.test.js` / `.test.ts` for non-JSX files
- Toy data and fixtures go in co-located `*.test.fixtures.js` files

## Imports

```ts
import { describe, it, expect } from 'vitest';
```

## Pattern: Test pure utility functions

Keep business logic in utility functions and test them with inline data and straightforward assertions:

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

## Running Tests

```bash
pnpm run test              # unit tests only
pnpm run lint-fix          # fix linting issues
```

## Tips

- Prefer testing pure utility functions over React components — they're faster and more reliable. When component bodies get complex, refactor business logic into custom hooks or utility functions so that the core logic can be tested via plain unit tests.
- Shared data fixtures for tests can be stored in `*.test.fixtures.js` files rather than inlining the data in test files.
- Utility functions that are shared across subpackages can be refactored into the shared utility subpackages within the `packages/utils/` directory.
