export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/tests/**/*.test.ts'],
    setupFilesAfterEnv: ['./src/tests/setup.ts'],
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '/coverage/'
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/'
    ],
    globals: {
      'ts-jest': {
        isolatedModules: true
      }
    }
  };