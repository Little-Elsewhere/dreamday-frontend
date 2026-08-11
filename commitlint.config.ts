import type { UserConfig } from '@commitlint/types'

/**
 * Conventional Commits 1.0.0 — https://www.conventionalcommits.org/en/v1.0.0/
 *
 * Format:
 *   <type>[optional scope][optional !]: <description>
 *
 *   [optional body]
 *
 *   [optional footer(s)]
 *
 * Types align with release-please changelog-sections (+ Angular/conventional defaults).
 */
const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'deps',
        'revert',
        'docs',
        'style',
        'refactor',
        'test',
        'build',
        'ci',
        'chore',
      ],
    ],
    // Spec does not require a specific subject case
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
}

export default config
