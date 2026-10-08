PNPM ?= pnpm
DOPPLER ?= doppler
DOPPLER_PROJECT ?= dreamday
DOPPLER_CONFIG ?= dev
SUPABASE_NETWORK ?= dreamday-local-network

export SUPABASE_NETWORK
DEV_COMPOSE ?= docker compose --progress plain -f docker/dev/compose.yaml

SUPABASE := $(PNPM) exec supabase
DOPPLER_RUN = $(DOPPLER) run --project "$(DOPPLER_PROJECT)" \
	--config "$(DOPPLER_CONFIG)" --no-fallback --
SUPABASE_WITH_ENV = $(DOPPLER_RUN) $(SUPABASE)

.DEFAULT_GOAL := help
.PHONY: help dev dev-build check-dev setup reset local-hosts supabase-templates \
	supabase-network supabase-start supabase-status supabase-stop \
	supabase-reset-local local-domains-start local-domains-stop env-local

help: ## Show available local development commands
	@grep -E '^[a-zA-Z0-9_-]+:.*## ' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*## "} {printf "%-20s %s\n", $$1, $$2}'

dev: check-dev ## Start the development app in Docker, reusing the existing image
	@printf '\n[dev] Starting the Docker development stack. A first run may build the app image.\n'
	@$(DOPPLER_RUN) $(DEV_COMPOSE) up

dev-build: check-dev ## Rebuild and start the development app in Docker
	@printf '\n[dev] Rebuilding the app image, then starting the Docker development stack.\n'
	@$(DOPPLER_RUN) $(DEV_COMPOSE) up --build

check-dev:
	@sh scripts/check-dev-prerequisites.sh "$(SUPABASE_NETWORK)"

setup: ## Start local Supabase and its domain proxy, then generate .env.local
	@printf '\n[setup 1/4] Ensure local hostnames are configured.\n'
	@$(MAKE) --no-print-directory local-hosts
	@printf '\n[setup 2/4] Start local Supabase services.\n'
	@$(MAKE) --no-print-directory supabase-start
	@printf '\n[setup 3/4] Create .env.local from Doppler and local Supabase status.\n'
	@$(MAKE) --no-print-directory env-local
	@printf '\n[setup 4/4] Start the local domain proxy.\n'
	@$(MAKE) --no-print-directory local-domains-start
	@printf '\n[setup] Local environment is ready. Start the app with `pnpm dev`.\n'

reset: ## Recreate the local stack and clear local Supabase data
	@printf '\n[reset 1/5] Stop the development app.\n'
	@$(DOPPLER_RUN) $(DEV_COMPOSE) stop app
	@printf '\n[reset 2/5] Remove local Supabase containers and volumes; local data will be deleted.\n'
	@$(SUPABASE_WITH_ENV) stop --no-backup
	@printf '\n[reset 3/5] Recreate the local setup.\n'
	@$(MAKE) --no-print-directory setup
	@printf '\n[reset 4/5] Replay local migrations and seed data.\n'
	@$(MAKE) --no-print-directory supabase-reset-local
	@printf '\n[reset 5/5] Start the development app in the background.\n'
	@$(DOPPLER_RUN) $(DEV_COMPOSE) up -d --force-recreate

local-hosts: ## Add app, Supabase, database, Studio, and Mailpit local domains to /etc/hosts
	@printf '[setup] Checking /etc/hosts (sudo may prompt if entries need to be added).\n'
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
	@if docker network inspect "$(SUPABASE_NETWORK)" >/dev/null 2>&1; then \
	  printf '[supabase] Reusing network %s.\n' '$(SUPABASE_NETWORK)'; \
	else \
	  printf '[supabase] Creating network %s.\n' '$(SUPABASE_NETWORK)'; \
	  docker network create "$(SUPABASE_NETWORK)" >/dev/null; \
	fi

supabase-start: supabase-templates supabase-network ## Start Supabase services on the shared Docker network
	@printf '[supabase] Starting local services; Supabase CLI will report service health below.\n'
	$(SUPABASE_WITH_ENV) start --network-id "$(SUPABASE_NETWORK)"

supabase-status: ## Show local Supabase URLs and keys
	$(SUPABASE_WITH_ENV) status

supabase-stop: ## Stop this project's local Supabase stack and keep its data
	$(SUPABASE_WITH_ENV) stop
	$(MAKE) local-domains-stop

supabase-reset-local: supabase-templates ## Reset only the local database and replay migrations and seed data
	$(SUPABASE_WITH_ENV) db reset --local --network-id "$(SUPABASE_NETWORK)"

local-domains-start: ## Start the app, Supabase, Studio, and Mailpit domain proxy
	@printf '[setup] Starting local domain proxy.\n'
	$(DEV_COMPOSE) --env-file .env.local up -d --force-recreate local-domains

local-domains-stop: ## Stop the local Supabase and Mailpit domain proxy
	$(DEV_COMPOSE) stop local-domains

env-local: ## Download Doppler env and override Supabase values with local status
	@DOPPLER='$(DOPPLER)' \
		DOPPLER_PROJECT='$(DOPPLER_PROJECT)' \
		DOPPLER_CONFIG='$(DOPPLER_CONFIG)' \
		PNPM='$(PNPM)' \
		sh scripts/setup-local-env.sh
