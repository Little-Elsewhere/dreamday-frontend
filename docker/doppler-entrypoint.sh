#!/bin/sh

set -eu

DOPPLER_TOKEN="$(cat /run/secrets/doppler_token)"
export DOPPLER_TOKEN

exec doppler run "$@"
