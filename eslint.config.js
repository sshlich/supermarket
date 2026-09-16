import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config(
  { ignores: ['dist/**', 'node_modules/**', 'artifacts/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  { files: ['**/*.ts'], rules: { '@typescript-eslint/no-non-null-assertion': 'off' } },
  {
    files: ['packages/sim/src/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'performance',
        'Date',
        'setTimeout',
        'setInterval',
        'fetch',
      ],
      'no-restricted-imports': ['error', { patterns: ['phaser', 'node:*', '**/src/client*'] }],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use the project PRNG.' },
      ],
    },
  },
);
