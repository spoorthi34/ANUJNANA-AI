import "@testing-library/jest-dom";

// In Node 22+ with jsdom, ensure localStorage is fully mocked
const storageStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageStore.get(key) ?? null,
  setItem: (key: string, val: string) => { storageStore.set(key, String(val)); },
  removeItem: (key: string) => { storageStore.delete(key); },
  clear: () => { storageStore.clear(); },
  get length() { return storageStore.size; },
  key: (index: number) => Array.from(storageStore.keys())[index] ?? null,
};
Object.defineProperty(window, "localStorage", {
  writable: true,
  value: localStorageMock,
});
Object.defineProperty(globalThis, "localStorage", {
  writable: true,
  value: localStorageMock,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
