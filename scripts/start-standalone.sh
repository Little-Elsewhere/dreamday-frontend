#!/bin/sh

set -eu

standalone_dir='.next/standalone'

if [ ! -f "$standalone_dir/server.js" ]; then
  printf '%s\n' 'Standalone build not found. Run a build before starting the app.' >&2
  exit 1
fi

PORT="${NEXT_PUBLIC_APP_PORT:-${PORT:-4000}}"
HOSTNAME=0.0.0.0
NODE_ENV=production
export PORT HOSTNAME NODE_ENV

printf '[start] Preparing standalone assets...\n'
# Next's standalone output omits public and static assets by default.
mkdir -p "$standalone_dir/public" "$standalone_dir/.next/static"
cp -R public/. "$standalone_dir/public/"
cp -R .next/static/. "$standalone_dir/.next/static/"

printf '[start] Starting standalone server on port %s.\n' "$PORT"
exec node "$standalone_dir/server.js"
