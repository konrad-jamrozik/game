// Note: eslint is not running prettier on purpose. Prettier is ran separately.
// https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting/#eslint-plugin-prettier
module.exports = {
  root: true, // [vite template][ts-eslint]
  env: {
    browser: true, // [vite template]
    es2022: true, // [vite template][customized: es2022]
    node: true, // [ts-eslint][customized: node]
    'jest/globals': true,
  },
  extends: [
    'eslint:all', // [eslint all]
    'plugin:@typescript-eslint/all', // [vite template][vite template README][ts-eslint][ts-eslint typechecking][ts-eslint recommended][ts-eslint all]
    'plugin:react/recommended', // [plugin: react]
    'plugin:react/jsx-runtime', // [react new jsx]
    'plugin:react-hooks/recommended', // [vite template][plugin: react-hooks]
    'plugin:import/recommended', // [ts import configs][ts import perf.]
    'plugin:import/react', // [ts import configs][ts import perf.]
    'plugin:import/typescript', // [ts import configs][ts import perf.]
    'plugin:unicorn/all', // [unicorn]
    'plugin:sonarjs/recommended',
    'plugin:lodash/recommended',
  ],
  ignorePatterns: [
    'dist', // [vite template]
    '.eslintrc.cjs', // [vite template]
    'prettier.config.js', // [prettier exclude]
  ],
  parser: '@typescript-eslint/parser', // [vite template][ts-eslint]
  plugins: [
    '@typescript-eslint', // [ts-eslint]
    'import',
    'react-refresh', // [vite template][plugin: react-refresh]
    'sonarjs',
    'github',
    'lodash',
  ],
  overrides: [
    {
      files: ['test/**'],
      plugins: ['jest'],
      extends: ['plugin:jest/all'],
    },
  ],
  // [vite template README][eslint parser options]
  parserOptions: {
    ecmaVersion: 'latest', // [vite template README][eslint parser options][ts-eslint parser package]
    sourceType: 'module', // [vite template README][eslint parser options]
    project: ['./tsconfig.json', './tsconfig.node.json'], // [vite template README]
    tsconfigRootDir: __dirname, // [vite template README][ts-eslint typechecking]
  },
  // [eslint rules]
  rules: {
    // https://eslint.org/docs/latest/rules/sort-imports
    // Turned off. Using 'import/order' instead. It has better sorting defaults.
    // Another rejected solution: https://github.com/lydell/eslint-plugin-simple-import-sort
    'sort-imports': 'off',
    // https://eslint.org/docs/latest/rules/func-style
    'func-style': [
      'error',
      'declaration', // I like declaration more than the default 'expression'
    ],
    // Don't care about comment capitalization
    // https://eslint.org/docs/latest/rules/capitalized-comments
    'capitalized-comments': 'off',
    // I like ternaries
    // https://eslint.org/docs/latest/rules/no-ternary
    'no-ternary': 'off',
    // https://eslint.org/docs/latest/rules/one-var
    'one-var': ['error', 'never'],
    // Used for debugging
    // https://eslint.org/docs/latest/rules/no-console
    'no-console': 'off',
    // https://eslint.org/docs/latest/rules/max-statements
    'max-statements': ['error', { max: 20 }],
    // https://eslint.org/docs/latest/rules/max-lines-per-function
    'max-lines-per-function': ['error', { max: 100 }],
    // https://eslint.org/docs/latest/rules/id-length
    'id-length': ['error', { min: 2, exceptions: ['_'] }],
    // https://typescript-eslint.io/rules/no-unused-vars/
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '_' }],
    // https://eslint.org/docs/latest/rules/no-duplicate-imports#options
    'no-duplicate-imports': ['error', { includeExports: true }],
    // https://eslint.org/docs/latest/rules/sort-keys
    'sort-keys': 'off',
    // https://eslint.org/docs/latest/rules/line-comment-position
    'line-comment-position': 'off',
    // https://eslint.org/docs/latest/rules/no-inline-comments
    'no-inline-comments': 'off',
    // https://eslint.org/docs/latest/rules/multiline-comment-style
    'multiline-comment-style': 'off',
    // https://eslint.org/docs/latest/rules/no-undefined
    'no-undefined': 'off',

    // Disabled because it triggers too many false positives plus the
    // VSCode ESLint extension doesn't appear to recognize some of the allowed
    // options. See comment at the bottom of this file for details.
    // https://typescript-eslint.io/rules/prefer-readonly-parameter-types/
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    // https://typescript-eslint.io/rules/no-magic-numbers/
    // https://eslint.org/docs/latest/rules/no-magic-numbers#options
    '@typescript-eslint/no-magic-numbers': 'off',
    // https://typescript-eslint.io/rules/naming-convention
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'function',
        format: [
          'camelCase', // default value
          'PascalCase', // allow PascalCase for React components, as they require it
        ],
      },
    ],
    // https://typescript-eslint.io/rules/consistent-type-imports/
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        fixStyle: 'inline-type-imports', // This works better with https://eslint.org/docs/latest/rules/no-duplicate-imports
      },
    ],
    // https://typescript-eslint.io/rules/no-misused-promises
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: { attributes: false },
      },
    ],
    // https://typescript-eslint.io/rules/consistent-type-definitions/
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    // https://typescript-eslint.io/rules/consistent-indexed-object-style/
    '@typescript-eslint/consistent-indexed-object-style': [
      'error',
      'index-signature',
    ],
    // https://typescript-eslint.io/rules/sort-type-constituents/
    '@typescript-eslint/sort-type-constituents': 'off',
    // https://eslint.org/docs/latest/rules/no-use-before-define
    // https://typescript-eslint.io/rules/no-use-before-define/
    '@typescript-eslint/no-use-before-define': 'off',
    // https://typescript-eslint.io/rules/no-non-null-assertion/
    '@typescript-eslint/no-non-null-assertion': 'off',
    // https://typescript-eslint.io/rules/max-params/
    '@typescript-eslint/max-params': ['error', { max: 5 }],

    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
    'import/order': [
      'error',
      {
        warnOnUnassignedImports: true,
        'newlines-between': 'never',
        alphabetize: { order: 'asc', orderImportKind: 'asc' },
      },
    ],

    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true, // for files primarily exporting a function
          pascalCase: true, // allow PascalCase for React components, as they require it
        },
        ignore: ['vite-env.d.ts'], // vite-env.d.ts is a file name provided by Vite by default
      },
    ],
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prevent-abbreviations.md
    // I like abbreviations
    'unicorn/prevent-abbreviations': 'off',
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-empty-file.md
    // Sometimes I need empty files while figuring out how to make things work
    'unicorn/no-empty-file': 'off',
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-nested-ternary.md
    // Conflicts with prettier: it removes the parentheses
    'unicorn/no-nested-ternary': 'off',
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-negated-condition.md
    'unicorn/no-negated-condition': 'off',
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-keyword-prefix.md
    'unicorn/no-keyword-prefix': 'off',

    // https://github.com/wix-incubator/eslint-plugin-lodash/blob/master/docs/rules/import-scope.md
    'lodash/import-scope': ['error', 'full'],
    // https://github.com/wix-incubator/eslint-plugin-lodash/blob/master/docs/rules/prop-shorthand.md
    'lodash/prop-shorthand': ['error', 'never'],
    // https://github.com/wix-incubator/eslint-plugin-lodash/blob/master/docs/rules/matches-prop-shorthand.md
    'lodash/matches-prop-shorthand': ['error', 'never'],

    'react-refresh/only-export-components': [
      // [vite template][plugin: react-refresh]
      'warn', // [vite template][plugin: react-refresh]
      { allowConstantExport: true }, // [vite template][plugin: react-refresh]
    ],
    // Rules copy-pasted from:
    // https://github.com/github/eslint-plugin-github/blob/73c236f83045314104556b2be515865f4b6c38d3/lib/index.js#L9C1-L26C73
    // Because [eslint-plugin-github] is not nice enough to provide relevant config.
    'github/array-foreach': 'error',
    'github/async-currenttarget': 'error',
    'github/async-preventdefault': 'error',
    'github/authenticity-token': 'error',
    'github/get-attribute': 'error',
    'github/js-class-name': 'error',
    'github/no-blur': 'error',
    'github/no-d-none': 'error',
    'github/no-dataset': 'error',
    'github/no-implicit-buggy-globals': 'error',
    'github/no-inner-html': 'error',
    'github/no-innerText': 'error',
    'github/no-dynamic-script-tag': 'error',
    'github/no-then': 'error',
    'github/no-useless-passive': 'error',
    'github/prefer-observers': 'error',
    'github/require-passive-events': 'error',
    'github/unescaped-html-literal': 'error',
  },
  settings: {
    react: {
      version: 'detect', // [SO react ver][react legacy config]
    },
    jest: {
      version: require('jest/package.json').version, // [jest version]
    },
    import: {
      // [ts resolver]
      resolver: {
        typescript: true,
        node: true,
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
      // [ts resolver]
      parsers: {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
  },
}
// eslint execution snippets: from current dir:
//
//   npx eslint --ext ts,tsx --plugin @typescript-eslint --rule '@typescript-eslint/prefer-readonly-parameter-types: error' ./src/**
//
// See also: https://eslint.org/docs/latest/use/command-line-interface
//
// Rejected plugins:
// - eslint-plugin-node:
//   disabled due to "Error: Failed to load plugin 'node' declared in 'PersonalConfig': Cannot find module 'eslint-plugin-node'"
//   https://github.com/mysticatea/eslint-plugin-node/issues/203
// - eslint-plugin-yml, eslint-plugin-json:
//   Linting of yaml and json commented out because I don't know how to prevent it from being parsed
//   with typescript parser.
//
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
// Rejected config, kept here for
// // https://typescript-eslint.io/rules/prefer-readonly-parameter-types/
// '@typescript-eslint/prefer-readonly-parameter-types': [
//   'error',
//   {
//     allow: [
//       {
//         from: 'package',
//         name: [
//           'FocusEvent',
//           'KeyboardEvent',
//           'PointerEvent',
//           'ChangeEvent',
//         ],
//         package: 'react',
//       },
//       // This appears to be not recognized by VSCode ESLint extension, even though
//       // it works for the CLI and CI.
//       {
//         from: 'file',
//         name: 'GameState',
//         path: 'src/types/GameState.ts',
//       },
//     ],
//   },
// ],
//
// References:
// [SO react ver]: https://stackoverflow.com/a/73014978/986533
// [customized: es2022]: the vite template had es2020 but I set it to 2022.
// [customized: node]: the [ts-eslint] suggested to use /* eslint-env node */ but per copilot I can do env/node instead.
// [eslint all]: https://eslint.org/docs/latest/use/configure/configuration-files#using-eslintall
// [eslint parser options]: https://eslint.org/docs/latest/use/configure/language-options#specifying-parser-options
// [eslint rules]: https://eslint.org/docs/latest/use/configure/rules
// [eslint-plugin-github]: https://github.com/github/eslint-plugin-github/tree/73c236f83045314104556b2be515865f4b6c38d3
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
// [ts-eslint all]: https://typescript-eslint.io/linting/configs/#all
// [ts-eslint parser package]: https://typescript-eslint.io/packages/parser
// [ts-eslint recommended]: https://typescript-eslint.io/linting/configs/#recommended-configurations
// [ts-eslint typechecking]: https://typescript-eslint.io/linting/typed-linting/
// [ts-eslint]: https://typescript-eslint.io/getting-started
// [unicorn]: https://github.com/sindresorhus/eslint-plugin-unicorn
// [vite template README]: https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/README.md
// [vite template]: https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/.eslintrc.cjs
