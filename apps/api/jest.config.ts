import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ayushman/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^@ayushman/config$': '<rootDir>/../../packages/config/src/index.ts',
    '^@ayushman/utils$': '<rootDir>/../../packages/utils/src/index.ts',
  },
  coverageDirectory: 'coverage',
  testTimeout: 30_000,
}

export default config
