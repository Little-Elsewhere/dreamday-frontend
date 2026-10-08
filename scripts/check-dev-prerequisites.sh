#!/bin/sh

set -eu

supabase_network="${1:-dreamday-local-network}"
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_dir/.." && pwd)

cd "$project_root"

printf '[dev] Checking local setup...\n'
if [ ! -s .env.local ]; then
  printf '%s\n' '[dev] .env.local is missing. Run `make setup` first.' >&2
  exit 1
fi

printf '[dev] Checking Doppler token...\n'
if [ -z "${DOPPLER_TOKEN:-}" ]; then
  printf '%s\n' '[dev] DOPPLER_TOKEN is missing. Export your read-only dev service token first.' >&2
  exit 1
fi

printf '[dev] Checking Docker Engine access...\n'
if ! docker_version=$(docker info --format '{{.ServerVersion}}' 2>/dev/null); then
  printf '%s\n' '[dev] Docker is unavailable or access to its daemon was denied. Start Docker/OrbStack and check socket access.' >&2
  exit 1
fi
printf '[dev] Docker Engine %s is available.\n' "$docker_version"

printf '[dev] Checking the local Supabase network...\n'
if ! docker network inspect "$supabase_network" >/dev/null 2>&1; then
  printf '[dev] Network %s is missing. Run `make setup` first.\n' "$supabase_network" >&2
  exit 1
fi

printf '[dev] Prerequisites are ready.\n'
