// Jest setup file
// Add any global test configuration here

// Mock DOM APIs for testing
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Note: Firebase is loaded from CDN in browser context, not available in Node.js tests
// Individual test files can mock Firebase features as needed

// Suppress console errors in tests (optional)
global.console.error = jest.fn();
global.console.warn = jest.fn();
