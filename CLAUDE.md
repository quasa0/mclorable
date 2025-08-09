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
- `morph_tool` (optional): fast code editing via morph api

## Important Context

- system prompt is in `src/lib/system.ts` - defines ai behavior
- templates for new apps in `src/lib/templates.ts` (nextjs, vite, expo)
- ai model configuration in `src/lib/model.ts` (claude-4-0-sonnet-20241022)
- webview component handles app preview with patches and hot reload
- redis used for caching and stream state management