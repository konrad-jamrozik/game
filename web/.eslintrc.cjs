// Helpful links:
// https://typescript-eslint.io/
// https://typescript-eslint.io/linting/configs/
// https://duncanleung.com/how-to-setup-eslint-eslintrc-config-difference-eslint-config-plugin/
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
