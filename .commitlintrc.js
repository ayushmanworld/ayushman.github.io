/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting, no logic change
        'refactor', // Code refactoring
        'perf',     // Performance improvement
        'test',     // Adding or updating tests
        'build',    // Build system changes
        'ci',       // CI configuration changes
        'chore',    // Maintenance tasks
        'revert',   // Reverting a commit
        'security', // Security fix
        'deps',     // Dependency updates
        'i18n',     // Internationalisation
        'a11y',     // Accessibility
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
  prompt: {
    messages: {
      skip: '(press enter to skip)',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'cannot be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
    questions: {
      type: {
        description: "Select the type of change you're committing:",
        enum: {
          feat: { description: 'A new feature', title: 'Features' },
          fix: { description: 'A bug fix', title: 'Bug Fixes' },
          docs: { description: 'Documentation only changes', title: 'Documentation' },
          style: { description: 'Formatting, no logic change', title: 'Styles' },
          refactor: { description: 'Code change, not a fix or feature', title: 'Code Refactoring' },
          perf: { description: 'Performance improvement', title: 'Performance Improvements' },
          test: { description: 'Adding or updating tests', title: 'Tests' },
          build: { description: 'Build system changes', title: 'Builds' },
          ci: { description: 'CI configuration changes', title: 'Continuous Integration' },
          chore: { description: 'Maintenance tasks', title: 'Chores' },
          revert: { description: 'Reverts a previous commit', title: 'Reverts' },
          security: { description: 'Security fix', title: 'Security' },
          deps: { description: 'Dependency updates', title: 'Dependencies' },
          a11y: { description: 'Accessibility improvements', title: 'Accessibility' },
        },
      },
    },
  },
}
