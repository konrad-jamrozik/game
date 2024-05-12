import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
// https://vitest.dev/guide/mocking.html
// https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: unknown) => ({
    matches: false,
    media: query,
    onchange: undefined,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// This file content is based on:
// https://github.com/testing-library/jest-dom#with-vitest
// https://mayashavin.com/articles/test-react-components-with-vitest#extending-vitests-expect-method
// Future work:
// https://vitest.dev/guide/extending-matchers.html#extending-matchers
// https://www.geeksforgeeks.org/typescript-ambients-declaration/
