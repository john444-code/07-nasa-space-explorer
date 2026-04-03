// Jest setup file for jsdom environment
// This ensures the DOM is ready before tests run

// Mock localStorage if needed
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock console methods to keep test output clean
global.console.error = jest.fn();
global.console.warn = jest.fn();
