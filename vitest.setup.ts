import '@testing-library/jest-dom/vitest';

// jsdom has no ResizeObserver; recharts' ResponsiveContainer needs one to measure its container.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
