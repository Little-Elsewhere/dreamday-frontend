#!/bin/sh

set -eu

standalone_dir='.next/standalone'

if [ ! -d "$standalone_dir" ]; then
  printf '%s\n' 'Standalone output missing after build.' >&2
  exit 1
fi

mkdir -p "$standalone_dir/public" "$standalone_dir/.next/static"
cp -R public/. "$standalone_dir/public/"
cp -R .next/static/. "$standalone_dir/.next/static/"
