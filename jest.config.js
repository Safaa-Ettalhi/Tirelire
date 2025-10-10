module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.vscode/',
    '/AppData/'
  ],
  modulePathIgnorePatterns: [
    '/.vscode/',
    '/AppData/'
  ]
};
