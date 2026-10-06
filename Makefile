PNPM ?= pnpm
DOPPLER ?= doppler
DOPPLER_PROJECT ?= dreamday
DOPPLER_CONFIG ?= dev
SUPABASE_NETWORK ?= dreamday-local-network

export SUPABASE_NETWORK
DEV_COMPOSE ?= docker compose -f docker/dev/compose.yaml

SUPABASE := $(PNPM) exec supabase
DOPPLER_RUN = $(DOPPLER) run --project "$(DOPPLER_PROJECT)" \
	--config "$(DOPPLER_CONFIG)" --no-fallback --
SUPABASE_WITH_ENV = $(DOPPLER_RUN) $(SUPABASE)

.DEFAULT_GOAL := help
.PHONY: help dev dev-build setup reset local-hosts supabase-templates \
	supabase-network supabase-start supabase-status supabase-stop \
	supabase-reset-local local-domains-start local-domains-stop env-local

help: ## Show available local development commands
	@grep -E '^[a-zA-Z0-9_-]+:.*## ' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*## "} {printf "%-20s %s\n", $$1, $$2}'

dev: ## Start the development app in Docker, reusing the existing image
	$(DOPPLER_RUN) $(DEV_COMPOSE) up

dev-build: ## Rebuild and start the development app in Docker
	$(DOPPLER_RUN) $(DEV_COMPOSE) up --build

setup: ## Start local Supabase and its domain proxy, then generate .env.local
	$(MAKE) local-hosts
	$(MAKE) supabase-start
	$(MAKE) env-local
	$(MAKE) local-domains-start

reset: ## Recreate the local stack and clear local Supabase data
	$(DOPPLER_RUN) $(DEV_COMPOSE) stop app
	$(SUPABASE_WITH_ENV) stop --no-backup
	$(MAKE) setup
	$(MAKE) supabase-reset-local
	$(DOPPLER_RUN) $(DEV_COMPOSE) up -d --force-recreate

local-hosts: ## Add app, Supabase, database, Studio, and Mailpit local domains to /etc/hosts
	@if ! grep -Eq '(^|[[:space:]])dreamday\.local([[:space:]]|$$)' /etc/hosts; then \
		printf '%s\n' '127.0.0.1 dreamday.local' | sudo tee -a /etc/hosts >/dev/null; \
	fi
	@if ! grep -Eq '(^|[[:space:]])db\.supabase\.local([[:space:]]|$$)' /etc/hosts; then \
		printf '%s\n' '127.0.0.1 db.supabase.local' | sudo tee -a /etc/hosts >/dev/null; \
	fi
	@if ! grep -Fqx '127.0.0.1 supabase.local mailpit.local' /etc/hosts; then \
		printf '%s\n' '127.0.0.1 supabase.local mailpit.local' | sudo tee -a /etc/hosts >/dev/null; \
	fi
	@if ! grep -Fq 'studio.supabase.local' /etc/hosts; then \
		printf '%s\n' '127.0.0.1 studio.supabase.local' | sudo tee -a /etc/hosts >/dev/null; \
	fi

supabase-templates: ## Build locale-aware Auth templates from per-locale HTML files
	node scripts/build-supabase-email-templates.mjs

supabase-network: ## Create the shared Docker network used by Supabase and the app
	@docker network inspect "$(SUPABASE_NETWORK)" >/dev/null 2>&1 || \
	  docker network create "$(SUPABASE_NETWORK)" >/dev/null

supabase-start: supabase-templates supabase-network ## Start Supabase services on the shared Docker network
	$(SUPABASE_WITH_ENV) start --network-id "$(SUPABASE_NETWORK)"

supabase-status: ## Show local Supabase URLs and keys
	$(SUPABASE_WITH_ENV) status

supabase-stop: ## Stop this project's local Supabase stack and keep its data
	$(SUPABASE_WITH_ENV) stop
	$(MAKE) local-domains-stop

supabase-reset-local: supabase-templates ## Reset only the local database and replay migrations and seed data
	$(SUPABASE_WITH_ENV) db reset --local --network-id "$(SUPABASE_NETWORK)"

local-domains-start: ## Start the app, Supabase, Studio, and Mailpit domain proxy
	$(DEV_COMPOSE) --env-file .env.local up -d --force-recreate local-domains

local-domains-stop: ## Stop the local Supabase and Mailpit domain proxy
	$(DEV_COMPOSE) stop local-domains

env-local: ## Download Doppler env and override Supabase values with local status
	@set -eu; \
	temp_dir=$$(mktemp -d); \
	trap 'rm -rf "$$temp_dir"' EXIT; \
	trap 'exit 1' HUP INT TERM; \
	doppler_file="$$temp_dir/doppler.json"; \
	status_file="$$temp_dir/supabase-status.json"; \
	"$(DOPPLER)" secrets download \
		--project "$(DOPPLER_PROJECT)" \
		--config "$(DOPPLER_CONFIG)" \
		--format json \
		--no-file > "$$doppler_file"; \
	$(SUPABASE_WITH_ENV) status -o json > "$$status_file"; \
	node scripts/generate-local-env.mjs "$$doppler_file" "$$status_file"
