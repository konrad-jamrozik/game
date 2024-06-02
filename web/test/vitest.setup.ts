import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { beforeAll, beforeEach, vi } from 'vitest'
import { verifyBackendApiIsReachable } from './test_lib/testUtils'

beforeAll(async () => {
  await verifyBackendApiIsReachable()
})

beforeEach(() => {
  // Needed per:
  // https://stackoverflow.com/questions/78493555/how-can-i-run-tests-in-a-single-file-in-parallel-when-using-screen-from-testin
  cleanup()
  localStorage.clear()
})

// This is required to allow vitest to connect to localhost backend using self-signed certificate.
// Without this, I was getting:
//
//     callApi() TRY: POST https://localhost:7128/advanceTurns?includeAllStates=true&turnLimit=1&delegateToAi=false
//     TypeError: fetch failed
//         at node:internal/deps/undici/undici:12442:11
//     (...)
//     cause: Error: self-signed certificate
//     (...)
//         code: 'DEPTH_ZERO_SELF_SIGNED_CERT'
//
// SOLUTION:
// Solved based on this:
// - SOQ: Node-fetch: Disable SSL verification
//   A: https://stackoverflow.com/a/52479399/986533
//
// Supplementary materials:
// - SOQ: Client certificate validation on server side, DEPTH_ZERO_SELF_SIGNED_CERT error
//   A: https://stackoverflow.com/a/32353574/986533
// - SOQ: nodejs - error self signed certificate in certificate chain
//   A: https://stackoverflow.com/a/45088585/986533
//   - This answer has a comment that talks about hitting .NET localhost web API and links to setting up cert:
//     https://learn.microsoft.com/en-us/dotnet/core/additional-tools/self-signed-certificates-guide#with-dotnet-dev-certs
// - Vite config entry on server.https recommending @vitejs/plugin-basic-ssl
//   https://vitejs.dev/config/server-options.html#server-https
//   - More context for this here:
//     https://stackoverflow.com/questions/76965767/vite-documentation-recommends-for-ssl-creating-your-own-certificates-but-how-d
// - Notes on self-signed SSL cert for .NET Web API
//   https://learn.microsoft.com/en-us/aspnet/web-api/overview/security/working-with-ssl-in-web-api#enabling-ssl-on-the-server
//   - Note the section 'Creating a Client Certificate for Testing' is probably worse than the guide linked above:
//     'self-signed-certificates-guide#with-dotnet-dev-certs'.
// - Notes on SSL from Mock Service Worker (MSW)
//   https://mswjs.io/docs/recipes/using-local-https
import.meta.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

// This snippet mocks window.matchMedia. This is necessary as vitest tests simulate browser
// API using jsdom which doesn't implement window.matchMedia.
// I observed from the error stack trace that MUI charts call into this API.
//
// Researched docs:
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

// https://testing-library.com/docs/dom-testing-library/api-debugging/#automatic-logging
import.meta.env['DEBUG_PRINT_LIMIT'] = '0'

// Some of this file content is based on:
// https://github.com/testing-library/jest-dom#with-vitest
// https://mayashavin.com/articles/test-react-components-with-vitest#extending-vitests-expect-method
// future work: extending martchers for testing
// https://vitest.dev/guide/extending-matchers.html#extending-matchers
// https://www.geeksforgeeks.org/typescript-ambients-declaration/
