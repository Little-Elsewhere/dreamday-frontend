// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import noComments from 'eslint-plugin-no-comments'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import storybook from 'eslint-plugin-storybook'
import unusedImports from 'eslint-plugin-unused-imports'
import React from 'react'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      '@next/next/no-img-element': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/jsx-no-comment-textnodes': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'warn',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // Side effects
            ['^node:'], // Node.js built-ins
            ['^@?\\w'], // External packages
            ['^@/'], // Internal alias
            ['^\\.'], // Relative imports
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'sort-imports': 'off',
      'import/order': 'off',
    },
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    ignores: ['src/app/sw.ts'],
    plugins: {
      'no-comments': noComments,
    },
    rules: {
      'no-comments/disallowComments': [
        'error',
        {
          allow: ['__no_comments_allowlist_never__'],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'design/**',
  ]),
  ...storybook.configs['flat/recommended'],
  {
    settings: {
      react: {
        version: React.version,
      },
    },
  },
])

export default eslintConfig
