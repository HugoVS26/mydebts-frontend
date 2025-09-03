module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  ignorePatterns: ['index.html', 'dist', 'node_modules', '.vscode'],
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['tsconfig.app.json', 'tsconfig.spec.json'],
        createDefaultProgram: true,
      },
      plugins: ['@typescript-eslint', '@angular-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
        'plugin:prettier/recommended',
      ],
      rules: {
        eqeqeq: ['error', 'always'],
        curly: ['error', 'all'],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': ['warn'],
        '@angular-eslint/component-class-suffix': [
          'error',
          { suffixes: ['Component'] },
        ],
        '@angular-eslint/directive-class-suffix': [
          'error',
          { suffixes: ['Directive'] },
        ],
        '@angular-eslint/no-empty-lifecycle-method': 'off',
        '@angular-eslint/use-lifecycle-interface': 'warn',
        '@angular-eslint/no-output-on-prefix': 'warn',
        '@angular-eslint/directive-selector': [
          'error',
          { type: 'attribute', prefix: 'app', style: 'camelCase' },
        ],
        '@angular-eslint/component-selector': [
          'error',
          { type: 'element', prefix: 'app', style: 'kebab-case' },
        ],
      },
    },

    {
      files: ['*.html'],
      parser: '@angular-eslint/template-parser',
      plugins: ['@angular-eslint/template'],
      extends: ['plugin:@angular-eslint/template/recommended'],
      rules: {
        '@angular-eslint/template/eqeqeq': 'error',
        '@angular-eslint/template/no-negated-async': 'error',
      },
    },

    {
      files: ['**/*.{ts,html,css,scss,json,md}'],
      extends: ['plugin:prettier/recommended'],
    },
  ],
};
