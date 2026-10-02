PNPM ?= pnpm
DOPPLER ?= doppler
DOPPLER_PROJECT ?= dreamday
DOPPLER_CONFIG ?= dev
SUPABASE := $(PNPM) exec supabase

.DEFAULT_GOAL := help
.PHONY: help setup supabase-start supabase-status supabase-stop supabase-reset-local env-local

help: ## Show available local development commands
	@grep -E '^[a-zA-Z0-9_-]+:.*## ' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*## "} {printf "%-22s %s\n", $$1, $$2}'

setup: ## Start the configured local Supabase stack and generate .env.local
	$(MAKE) supabase-start
	$(MAKE) env-local

supabase-start: ## Start Supabase services from supabase/config.toml
	$(SUPABASE) start

supabase-status: ## Show local Supabase URLs and keys
	$(SUPABASE) status

supabase-stop: ## Stop this project's local Supabase stack and keep its data
	$(SUPABASE) stop

supabase-reset-local: ## Reset only the local database and replay migrations and seed data
	$(SUPABASE) db reset --local

env-local: ## Download Doppler env and override Supabase values with local status
	@set -eu; \
	doppler_file=$$(mktemp); \
	status_file=$$doppler_file; \
	trap 'rm -f "$$doppler_file" "$$status_file"' 0; \
	status_file=$$(mktemp); \
	"$(DOPPLER)" secrets download --project "$(DOPPLER_PROJECT)" --config "$(DOPPLER_CONFIG)" --format json --no-file > "$$doppler_file"; \
	$(SUPABASE) status -o json > "$$status_file"; \
	node scripts/generate-local-env.mjs "$$doppler_file" "$$status_file"
