// Note: eslint is not running prettier on purpose. Prettier is ran separately.
// https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting/#eslint-plugin-prettier
module.exports = {
  root: true, // [vite template][ts-eslint]
  env: {
    // [vite template]
    browser: true, // [vite template]
    es2022: true, // [vite template][customized: es2022]
    node: true, // [ts-eslint][customized: node]
    'jest/globals': true,
  },
  extends: [
    // [vite template]
    'eslint:recommended', // [vite template][ts-eslint]
    'plugin:@typescript-eslint/all', // https://typescript-eslint.io/linting/configs/#all
    // alternative to 'plugin:@typescript-eslint/all':
    // // 'plugin:@typescript-eslint/strict-type-checked', // [vite template][vite template README][ts-eslint][ts-eslint typechecking][ts-eslint recommended]
    // // 'plugin:@typescript-eslint/stylistic-type-checked', // [vite template][vite template README][ts-eslint][ts-eslint typechecking][ts-eslint recommended]
    'plugin:react/recommended', // [plugin: react]
    'plugin:react/jsx-runtime', // [react new jsx]
    'plugin:react-hooks/recommended', // [vite template][plugin: react-hooks]
    'plugin:import/recommended', // [ts import configs][ts import perf.]
    'plugin:import/react', // [ts import configs][ts import perf.]
    'plugin:import/typescript', // [ts import configs][ts import perf.]
    'plugin:unicorn/all', // [unicorn]
  ],
  ignorePatterns: [
    'dist', // [vite template]
    '.eslintrc.cjs', // [vite template]
    'prettier.config.js', // [prettier exclude]
  ],
  parser: '@typescript-eslint/parser', // [vite template][ts-eslint]
  plugins: [
    // [vite template]
    '@typescript-eslint', // [ts-eslint]
    'react-refresh', // [vite template][plugin: react-refresh]
    'import',
  ],
  rules: {
    // [vite template][eslint rules]
    'react-refresh/only-export-components': [
      // [vite template][plugin: react-refresh]
      'warn', // [vite template][plugin: react-refresh]
      { allowConstantExport: true }, // [vite template][plugin: react-refresh]
    ],
    // https://typescript-eslint.io/rules/no-magic-numbers/
    // https://eslint.org/docs/latest/rules/no-magic-numbers#options
    '@typescript-eslint/no-magic-numbers': ['error', { ignore: [0, 1] }],
    'unicorn/filename-case': 'off', // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md
    'unicorn/prevent-abbreviations': 'off', // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prevent-abbreviations.md
  },
  overrides: [
    {
      files: ['test/**'],
      plugins: ['jest'],
      extends: ['plugin:jest/all'],
    },
  ],
  parserOptions: {
    // [vite template README][eslint parser options]
    ecmaVersion: 'latest', // [vite template README][eslint parser options][ts-eslint parser package]
    sourceType: 'module', // [vite template README][eslint parser options]
    project: ['./tsconfig.json', './tsconfig.node.json'], // [vite template README]
    tsconfigRootDir: __dirname, // [vite template README][ts-eslint typechecking]
  },
  settings: {
    react: {
      version: 'detect', // [SO react ver][react legacy config]
    },
    jest: {
      // [jest version]
      version: require('jest/package.json').version,
    },
    import: {
      resolver: {
        // [ts resolver]
        typescript: true,
        node: true,
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
      parsers: {
        // [ts resolver]
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
  },
}
// Helpful links:
// https://duncanleung.com/how-to-setup-eslint-eslintrc-config-difference-eslint-config-plugin/
// https://eslint.org/
// https://eslint.org/docs/latest/use/configure/configuration-files
// https://typescript-eslint.io/
// https://typescript-eslint.io/linting/configs/
// https://www.npmjs.com/search?q=eslint-plugin&ranking=optimal
// Awesome: https://github.com/dustinspecker/awesome-eslint#plugins
//
// Prettier:
// https://www.npmjs.com/package/eslint-plugin-prettier
// https://prettier.io/docs/en/install#eslint-and-other-linters
// https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting#eslint-plugin-prettier
// https://typescript-eslint.io/linting/troubleshooting/formatting#suggested-usage---prettier
//
// References:
// [SO react ver]: https://stackoverflow.com/a/73014978/986533
// [customized: es2022]: the vite template had es2020 but I set it to 2022.
// [customized: node]: the [ts-eslint] suggested to use /* eslint-env node */ but per copilot I can do env/node instead.
// [eslint parser options]: https://eslint.org/docs/latest/use/configure/language-options#specifying-parser-options
// [eslint rules]: https://eslint.org/docs/latest/use/configure/rules
// [jest version]: https://www.npmjs.com/package/eslint-plugin-jest#jest-version-setting
// [plugin: react-hooks]: https://www.npmjs.com/package/eslint-plugin-react-hooks
// [plugin: react-refresh]: https://github.com/ArnaudBarre/eslint-plugin-react-refresh
// [plugin: react]: https://github.com/jsx-eslint/eslint-plugin-react
// [prettier exclude]: https://typescript-eslint.io/linting/troubleshooting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file
// [prettier install]: https://github.com/prettier/eslint-plugin-prettier#configuration-legacy-eslintrc, https://typescript-eslint.io/linting/troubleshooting/formatting#suggested-usage---prettier
// [react legacy config]: https://github.com/jsx-eslint/eslint-plugin-react#configuration-legacy-eslintrc-
// [react new jsx]: [react legacy config], https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
// [ts import configs]: https://github.com/import-js/eslint-plugin-import/tree/v2.29.1/config
// [ts import perf.]: https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting#eslint-plugin-import
// [ts resolver]: https://github.com/import-js/eslint-import-resolver-typescript
// [ts-eslint parser package]: https://typescript-eslint.io/packages/parser
// [ts-eslint recommended]: https://typescript-eslint.io/linting/configs/#recommended-configurations
// [ts-eslint typechecking]: https://typescript-eslint.io/linting/typed-linting/
// [ts-eslint]: https://typescript-eslint.io/getting-started
// [unicorn]: https://github.com/sindresorhus/eslint-plugin-unicorn
// [vite template README]: https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/README.md
// [vite template]: https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/.eslintrc.cjs
