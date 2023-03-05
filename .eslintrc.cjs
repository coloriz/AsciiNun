module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  settings: {
    'import/extensions': ['.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      'typescript': {
        'alwaysTryTypes': true
      }
    }
  },
  rules: {
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc'
        }
      }
    ]
  },
  ignorePatterns: ['dist/'],
};
