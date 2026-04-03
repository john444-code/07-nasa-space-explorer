module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['js/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/']
};
