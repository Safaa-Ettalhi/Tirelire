module.exports = {
  displayName: 'Functional Tests',
  testEnvironment: 'node',
  testMatch: ['**/tests/functional/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middlewares/**/*.js',
    'utils/**/*.js',
    'routes/**/*.js'
  ],
  coverageDirectory: 'coverage/functional',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 30000, // 30 secondes
  maxWorkers: 1, // Exécuter les tests en série
  forceExit: true,
  detectOpenHandles: true
};