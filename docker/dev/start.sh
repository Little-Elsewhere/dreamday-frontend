#!/bin/sh
set -eu

HUSKY=0 pnpm install --frozen-lockfile
exec pnpm exec next dev --hostname 0.0.0.0
