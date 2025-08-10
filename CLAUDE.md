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
- `integrate_paywall`: generate AI-powered paywall components with 16 different combinations (4 types × 4 styles)
- `morph_tool` (optional): fast code editing via morph api

### Payment Integration

Adorable includes complete Stripe payment integration for monetizing user-generated apps:

**Architecture:**
- Products and subscriptions stored in PostgreSQL (`products`, `subscriptions` tables)
- Stripe integration via server-side APIs (`src/lib/stripe.ts`)
- AI-generated paywall components via `integrate_paywall` tool
- Centralized checkout through mclorable.com backend

**Payment Flow:**
1. Users create products via "Create Product" button in TopBar UI
2. AI generates custom paywall components using `integrate_paywall` tool
3. Paywalls redirect to Stripe checkout hosted on mclorable.com
4. Webhooks update subscription status automatically
5. Apps check subscription status via `/api/payments/subscription`

**Environment Variables Required:**
- `STRIPE_SECRET_KEY`: Stripe secret key for API calls
- `STRIPE_WEBHOOK_SECRET`: For webhook signature verification

**API Endpoints:**
- `POST /api/payments/checkout` - Create checkout sessions
- `GET/POST /api/payments/products` - Product CRUD operations  
- `GET /api/payments/subscription` - Check subscription status
- `POST /api/payments/webhook` - Handle Stripe webhook events

## Important Context

- system prompt is in `src/lib/system.ts` - defines ai behavior
- templates for new apps in `src/lib/templates.ts` (nextjs, vite, expo)
- ai model configuration in `src/lib/model.ts` (claude-4-0-sonnet-20241022)
- webview component handles app preview with patches and hot reload
- redis used for caching and stream state management