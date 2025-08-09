# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adorable is an open-source AI app builder similar to Lovable, allowing users to create websites and apps through a chat interface. It uses Next.js 15, TypeScript, PostgreSQL, Redis, and integrates with Freestyle Sandboxes for code execution and preview.

## Common Development Commands

```bash
# development
npm run dev          # run dev server with turbopack on localhost:3000
npm run build        # build for production
npm run start        # start production server
npm run lint         # run next lint

# database
npx drizzle-kit push # apply database schema changes
npx drizzle-kit generate # generate migrations
```

## Core Architecture

### Key Directories
- `src/app/` - next.js app router pages and api routes
- `src/actions/` - server actions for database operations  
- `src/components/` - react components and ui elements
- `src/db/` - database schema (drizzle orm)
- `src/lib/` - core utilities and configurations
- `src/mastra/agents/` - ai agent configuration
- `src/tools/` - mastra tools for ai agent

### Main Flows

1. **app creation**: user provides prompt → `create-app.ts` creates git repo via freestyle → initializes database record → starts ai agent conversation
2. **chat interaction**: messages flow through `/api/chat/route.ts` → uses mastra agent with tools → streams responses with patches back to ui
3. **code execution**: ai generates code → sent to freestyle dev server via mcp → preview updates in webview iframe

### Key Components

- **freestyle integration** (`src/lib/freestyle.ts`): manages git repos, dev servers, deployments
- **mastra agent** (`src/mastra/agents/builder.ts`): claude-based ai agent with memory and tools
- **stream manager** (`src/lib/internal/stream-manager.ts`): handles streaming ai responses with patches
- **database schema** (`src/db/schema.ts`): apps, users, messages, deployments tables

### Authentication
uses stack auth (`src/auth/stack-auth.ts`) for user management with freestyle identity integration

### Tools Available to AI
- `update_todo_list`: track tasks for user requests
- `integrate_paywall`: generate paywall components for subscription features
- `morph_tool` (optional): fast code editing via morph api

## Payment Integration (Polar.sh)

### Overview
The app builder integrates with Polar.sh for handling payments and subscriptions. Users can:
1. Create products with the ProductCreationModal component
2. Integrate paywalls into customer apps using the integrate_paywall tool
3. Handle subscriptions through centralized backend APIs

### Architecture
- **Polar Service** (`src/lib/polar.ts`): SDK wrapper for Polar API calls
- **Payment APIs** (`src/app/api/payments/`):
  - `/checkout`: Creates checkout sessions
  - `/subscription`: Checks subscription status
  - `/products`: Manages products
  - `/webhook`: Handles Polar webhook events
- **Database Tables**:
  - `products`: Stores product info with Polar IDs
  - `subscriptions`: Tracks user subscriptions
- **Tools**:
  - `integrate_paywall`: Generates paywall components (modal, inline, full-page, button)

### Configuration
- Polar Access Token: `polar_oat_qGemq8ufNwek0nmox5KLYzEbvgSnoYcPhTDiB3Coht9`
- Organization ID: `be03f5dd-37e6-4d69-8aed-a0ab23a9cadc`
- Webhook Secret: Set `POLAR_WEBHOOK_SECRET` env variable for production

### Payment Flow
1. Customer clicks subscribe in paywall
2. Paywall calls mclorable backend to create checkout
3. Backend creates Polar checkout session
4. Customer completes payment on Polar
5. Webhook updates subscription status
6. App checks subscription via API

## Important Context

- system prompt is in `src/lib/system.ts` - defines ai behavior
- templates for new apps in `src/lib/templates.ts` (nextjs, vite, expo)
- ai model configuration in `src/lib/model.ts` (claude-4-0-sonnet-20241022)
- webview component handles app preview with patches and hot reload
- redis used for caching and stream state management