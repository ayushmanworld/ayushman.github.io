#!/usr/bin/env bash
# ==============================================================================
# Ayushman Platform — Development Setup Script
# ==============================================================================
# This script sets up the complete development environment from scratch.
# Run once after cloning the repository.
# ==============================================================================

set -euo pipefail

BOLD=$(tput bold 2>/dev/null || echo '')
RESET=$(tput sgr0 2>/dev/null || echo '')
GREEN=$(tput setaf 2 2>/dev/null || echo '')
YELLOW=$(tput setaf 3 2>/dev/null || echo '')
RED=$(tput setaf 1 2>/dev/null || echo '')
BLUE=$(tput setaf 4 2>/dev/null || echo '')

log_info()    { echo "${BLUE}ℹ ${RESET}$*"; }
log_success() { echo "${GREEN}✅ ${RESET}$*"; }
log_warning() { echo "${YELLOW}⚠  ${RESET}$*"; }
log_error()   { echo "${RED}❌ ${RESET}$*"; exit 1; }
log_step()    { echo "\n${BOLD}${BLUE}━━━ $* ${RESET}${BOLD}━━━${RESET}"; }

# ─── Prerequisites check ─────────────────────────────────
log_step "Checking prerequisites"

check_command() {
  if ! command -v "$1" &> /dev/null; then
    log_error "$1 is not installed. Please install it and re-run this script."
  fi
  log_success "$1 found: $($1 --version 2>&1 | head -1)"
}

check_command node
check_command pnpm
check_command docker
check_command git

# Verify Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_NODE="20"
if [[ "${NODE_VERSION%%.*}" -lt "$REQUIRED_NODE" ]]; then
  log_error "Node.js >= $REQUIRED_NODE required. Found: v$NODE_VERSION"
fi

# Verify pnpm version
PNPM_VERSION=$(pnpm --version)
REQUIRED_PNPM="9"
if [[ "${PNPM_VERSION%%.*}" -lt "$REQUIRED_PNPM" ]]; then
  log_error "pnpm >= $REQUIRED_PNPM required. Found: $PNPM_VERSION"
fi

log_success "All prerequisites met"

# ─── Environment setup ───────────────────────────────────
log_step "Setting up environment files"

if [ ! -f ".env" ]; then
  cp .env.example .env
  log_success "Created .env from .env.example"
  log_warning "Please edit .env and fill in your API keys before continuing"
else
  log_info ".env already exists — skipping"
fi

# ─── Install dependencies ────────────────────────────────
log_step "Installing dependencies"

pnpm install --frozen-lockfile
log_success "Dependencies installed"

# ─── Setup Git hooks ─────────────────────────────────────
log_step "Setting up Git hooks"

pnpm prepare
log_success "Husky hooks installed"

# ─── Start Docker services ───────────────────────────────
log_step "Starting Docker services"

if ! docker info &> /dev/null; then
  log_error "Docker daemon is not running. Please start Docker and re-run."
fi

docker compose up -d
log_success "Docker services started"

# Wait for PostgreSQL
log_info "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U ayushman -d ayushman_dev &> /dev/null; then
    log_success "PostgreSQL ready"
    break
  fi
  if [ $i -eq 30 ]; then
    log_error "PostgreSQL did not become ready in time"
  fi
  sleep 2
done

# Wait for Redis
log_info "Waiting for Redis to be ready..."
for i in {1..15}; do
  if docker compose exec -T redis redis-cli ping &> /dev/null; then
    log_success "Redis ready"
    break
  fi
  if [ $i -eq 15 ]; then
    log_error "Redis did not become ready in time"
  fi
  sleep 2
done

# ─── Build shared packages ───────────────────────────────
log_step "Building shared packages"

pnpm turbo run build \
  --filter=@ayushman/types \
  --filter=@ayushman/config \
  --filter=@ayushman/utils \
  --filter=@ayushman/ui

log_success "Shared packages built"

# ─── Database setup ──────────────────────────────────────
log_step "Setting up database"

pnpm db:migrate
log_success "Migrations applied"

pnpm db:seed
log_success "Database seeded"

# ─── Validate environment ────────────────────────────────
log_step "Validating environment"

pnpm check-env || log_warning "Some optional environment variables are missing. Check .env.example."

# ─── Done ────────────────────────────────────────────────
echo ""
echo "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo "${GREEN}${BOLD}  🚀 Ayushman development environment is ready!   ${RESET}"
echo "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "  Start development:"
echo "    ${BOLD}pnpm dev${RESET}               — Start all apps in parallel"
echo "    ${BOLD}pnpm --filter @ayushman/api dev${RESET}  — API only"
echo "    ${BOLD}pnpm --filter @ayushman/web dev${RESET}  — Web only"
echo ""
echo "  URLs:"
echo "    Web:        http://localhost:3000"
echo "    API:        http://localhost:4000/api/v1"
echo "    API Docs:   http://localhost:4000/api/v1/docs"
echo "    Admin:      http://localhost:3001"
echo "    Adminer:    http://localhost:8080"
echo "    Mailpit:    http://localhost:8025"
echo "    Meilisearch: http://localhost:7700"
echo ""
echo "  Credentials:"
echo "    Founder:  ayushmans@outlook.in / Ayushman@Founder2026!"
echo "    Admin:    admin@ayushman.world / Ayushman@Admin2026!"
echo ""
