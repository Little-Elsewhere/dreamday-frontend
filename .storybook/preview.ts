import '@/app/globals.css'

import type { Preview } from '@storybook/nextjs-vite'

import { COLOR_MATCHER, DATE_MATCHER } from './constants/controls'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: COLOR_MATCHER,
        date: DATE_MATCHER,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
