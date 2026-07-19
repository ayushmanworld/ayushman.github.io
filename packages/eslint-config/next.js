/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/strict',
    'next/core-web-vitals',
    'prettier',
  ],
  plugins: ['react', 'react-hooks', 'jsx-a11y'],
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'error',
    'react/jsx-no-leaked-render': 'error',
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/self-closing-comp': ['error', { component: true, html: false }],

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Accessibility (WCAG 2.2 AA)
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/tab-index': 'error',

    // Next.js — allow default exports for pages
    'import/no-default-export': 'off',
  },
  settings: {
    react: { version: 'detect' },
  },
}
