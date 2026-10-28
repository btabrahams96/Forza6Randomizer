import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

// jsdom gaps that vaul and motion touch.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }) as MediaQueryList
}
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver
}
Element.prototype.scrollTo ??= function () {}

// Testing Library only auto-cleans with vitest globals on; we import explicitly.
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
afterEach(() => cleanup())
Element.prototype.setPointerCapture ??= function () {}
Element.prototype.releasePointerCapture ??= function () {}
Element.prototype.hasPointerCapture ??= function () { return false }
