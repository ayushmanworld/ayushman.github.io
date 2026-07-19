/** @type {import('lint-staged').Config} */
module.exports = {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': ['eslint --fix --max-warnings=0', 'prettier --write'],

  // JSON, YAML, Markdown files
  '*.{json,yaml,yml,md}': ['prettier --write'],

  // CSS files
  '*.css': ['prettier --write'],

  // Prisma schema
  '*.prisma': ['prettier --write'],

  // Shell scripts
  '*.sh': ['shfmt -w -i 2'],

  // Terraform files
  '*.tf': ['terraform fmt'],
}
