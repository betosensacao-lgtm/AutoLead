# FlowAI

AI chat agent that generates, saves, and runs n8n automation workflows.
Package name is `flowai` (pivoted from the earlier "autolead" lead-qualification
product — the folder name `autolead` is a historical leftover).

## Stack
- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS
- Drizzle ORM (PostgreSQL via Supabase)
- LangGraph.js — single-node agent graph (`src/lib/langgraph/`)
- LLM via OpenAI-compatible client (`src/lib/ai.ts`): OpenRouter (primary) →
  Gemini → Groq, first configured key wins
- Zod for the agent's tool-call schemas
- n8n REST API client (`src/lib/n8n/client.ts`) to create/execute workflows
- Google OAuth (`src/app/api/auth/google/*`) for Google-node integrations
- Resend (email)

## Commands
```bash
pnpm dev              # Next.js dev server (Turbopack)
pnpm build            # Production build
npx tsc --noEmit      # Typecheck
npx tsx <script>      # Run TS scripts directly
```
`pnpm lint` (`next lint`) is currently broken on this Next.js 16 version —
it errors with "Invalid project directory provided" instead of running
ESLint. Known upstream incompatibility, not project-specific; run `eslint .`
directly if you need linting until this is fixed.

## Env
- File: `.env.local` (not committed); reference: `.env.example`
- `OPENROUTER_API_KEY` (primary) — falls back to `GEMINI_API_KEY`, then
  `GROQ_API_KEY`, if unset
- `DATABASE_URL` = pooler (app runtime), `DIRECT_URL` = direct (migrations)
- `JWT_SECRET` for admin session tokens
- `WEBHOOK_SECRET` — shared secret required (via `x-webhook-secret` header)
  on `POST /api/webhook` and `POST /api/n8n/webhook`
- `RESEND_API_KEY` for email sending
- `META_*` vars are **unused** since the FlowAI pivot — kept in
  `.env.example` in case WhatsApp/Meta integration is reintroduced later

## Agent (LangGraph)
Single-node graph in `src/lib/langgraph/`, not the old multi-node lead
pipeline:
- **state.ts** — `FlowState` (messages, workflowId, executionId, status, error)
- **nodes.ts** — `workflowAgentNode`, the only node: calls the LLM with
  `FLOWAI_PROMPT`, executes any tool calls, returns the reply
- **tools.ts** — `create_n8n_workflow`, `execute_n8n_workflow`,
  `list_n8n_workflows` (function-calling tools backed by `n8nClient` + the
  `workflows`/`workflowExecutions` tables)
- **graph.ts** — compiles the graph, exports `runFlowGraph()`
- Entry points: `src/app/api/chat/route.ts` (Studio chat UI),
  `src/app/api/webhook/route.ts` and `src/app/api/n8n/webhook/route.ts`
  (external triggers, both gated by `WEBHOOK_SECRET`)

## Admin area
- `src/proxy.ts` is the Next.js middleware (Next 16 renamed the
  `middleware.ts` convention to `proxy.ts`; the old name still works but
  logs a deprecation warning). It gates both `/admin/*` pages and
  `/api/admin/*` routes on a valid `admin_session` JWT cookie, except
  `/admin/login`, `/admin/signup` and their `/api/admin/*` equivalents.
- `/api/admin/signup` only succeeds while the `users` table is empty
  (single-admin bootstrap) — it returns 403 once an admin account exists.
- Individual `/api/admin/*` route handlers also call
  `getSessionFromRequest()` (`src/lib/auth.ts`) as defense in depth beyond
  the middleware.

## Drizzle
- Schema: `src/db/schema.ts`
- Generate migration: `pnpm db:generate`
- Apply migration: `pnpm db:migrate` (uses `DIRECT_URL`)
- Push directly: `pnpm db:push`
- Studio: `pnpm db:studio`
- Seed: `pnpm db:seed`
- Known issue: `drizzle.config.ts` sets `schemaFilter: ["autolead"]`, but at
  least one connected database resolves queries against a `flowai` search
  path where the `users` relation doesn't exist. Investigate before relying
  on login working end-to-end in a given environment.

## Testing
No test suite exists yet (no vitest/jest/playwright configured).

## Language
Code and documentation in English. UI strings in English; the agent's
system prompt and tool descriptions are in Portuguese.
