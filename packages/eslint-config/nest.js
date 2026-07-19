/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./index.js'],
  rules: {
    // NestJS uses decorators extensively
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-extraneous-class': 'off', // NestJS modules are empty classes
    'unicorn/no-static-only-class': 'off',

    // Dependency injection pattern
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow-as-parameter' },
    ],

    // Allow console in NestJS for logging
    'no-console': 'off',

    // NestJS controllers use default exports for Swagger
    'import/no-default-export': 'off',
  },
}
