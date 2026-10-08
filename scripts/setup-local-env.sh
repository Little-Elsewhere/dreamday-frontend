#!/bin/sh

set -eu

DOPPLER="${DOPPLER:-doppler}"
DOPPLER_PROJECT="${DOPPLER_PROJECT:-dreamday}"
DOPPLER_CONFIG="${DOPPLER_CONFIG:-dev}"
PNPM="${PNPM:-pnpm}"

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
temp_dir=$(mktemp -d)

trap 'rm -rf "$temp_dir"' EXIT
trap 'exit 1' HUP INT TERM

doppler_file="$temp_dir/doppler.json"
supabase_status_file="$temp_dir/supabase-status.json"

run_with_doppler() {
  "$DOPPLER" run \
    --project "$DOPPLER_PROJECT" \
    --config "$DOPPLER_CONFIG" \
    --no-fallback \
    -- "$@"
}

cd "$project_root"

printf '[setup] Downloading Doppler configuration...\n'
"$DOPPLER" secrets download \
  --project "$DOPPLER_PROJECT" \
  --config "$DOPPLER_CONFIG" \
  --format json \
  --no-file > "$doppler_file"

printf '[setup] Reading local Supabase status...\n'
run_with_doppler "$PNPM" exec supabase status -o json > "$supabase_status_file"

printf '[setup] Writing .env.local (secret values are not printed)...\n'
node scripts/generate-local-env.mjs "$doppler_file" "$supabase_status_file"
