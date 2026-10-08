import { defineConfig } from 'lint-staged/config'

export default defineConfig({
  '*.{js,ts,jsx,tsx}': [
    'eslint --fix --no-warn-ignored',
    'prettier --write',
    () => 'pnpm test:unit --project unit',
  ],
  '*.{css,json,yaml,yml,mjs,md,mdx}': ['prettier --write'],
})
