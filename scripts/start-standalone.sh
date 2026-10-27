#!/bin/sh

set -eu

root_dir=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
standalone_dir="$root_dir/.next/standalone"

if [ ! -f "$standalone_dir/server.js" ]; then
  printf '%s\n' 'Standalone build not found. Run pnpm build first.' >&2
  exit 1
fi

cd "$root_dir"

if [ ! -f .env.production ]; then
  printf '%s\n' 'Missing .env.production. Create it before starting the standalone server.' >&2
  exit 1
fi

set -a
. ./.env.production
set +a

exec node "$standalone_dir/server.js"
