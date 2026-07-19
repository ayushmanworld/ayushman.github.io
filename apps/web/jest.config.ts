import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ayushman/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^@ayushman/config$': '<rootDir>/../../packages/config/src/index.ts',
    '^@ayushman/utils$': '<rootDir>/../../packages/utils/src/index.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
}

export default createJestConfig(config)
