import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const templatesDirectory = resolve(projectRoot, 'supabase/templates')
const generatedDirectory = resolve(templatesDirectory, 'generated')
const emailTypes = ['confirmation', 'recovery']

await mkdir(generatedDirectory, { recursive: true })

for (const emailType of emailTypes) {
  const [englishTemplate, vietnameseTemplate] = await Promise.all([
    readFile(resolve(templatesDirectory, 'en', `${emailType}.html`), 'utf8'),
    readFile(resolve(templatesDirectory, 'vi', `${emailType}.html`), 'utf8'),
  ])

  const generatedTemplate = [
    '{{ if eq .Data.locale "vi" }}',
    vietnameseTemplate.trim(),
    '{{ else }}',
    englishTemplate.trim(),
    '{{ end }}',
    '',
  ].join('\n')

  await writeFile(resolve(generatedDirectory, `${emailType}.html`), generatedTemplate, 'utf8')
}

console.log('Built locale-aware Supabase Auth email templates.')
