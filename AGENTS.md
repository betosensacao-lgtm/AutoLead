# AutoLead

Multi-agent lead qualification and nurturing system powered by AI.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Drizzle ORM (PostgreSQL via Supabase)
- LangGraph.js (multi-agent orchestration)
- Groq via OpenAI SDK (`src/lib/ai.ts`)
- Zod for validation
- Resend (email)
- Meta API (WhatsApp)

## Commands
```bash
pnpm dev              # Next.js dev server
pnpm build            # Production build
npx tsc --noEmit      # Typecheck
npx tsx <script>      # Run TS scripts directly
```

## Env
- File: `.env.local` (not committed)
- `GROQ_API_KEY` is required for the AI agent
- `DATABASE_URL` = pooler (app runtime), `DIRECT_URL` = direct (migrations)
- `RESEND_API_KEY` for email sending
- `META_*` for WhatsApp integration

## Drizzle
- Schema: `src/db/schema.ts`
- Generate migration: `pnpm db:generate`
- Apply migration: `pnpm db:migrate` (uses DIRECT_URL)
- Push directly: `pnpm db:push`
- Studio: `pnpm db:studio`
- Seed: `pnpm db:seed`

## LangGraph
The lead qualification agent is a StateGraph in `src/lib/langgraph/`:
- **state.ts** — LeadState (Annotation.Root)
- **nodes.ts** — Router, Capture, Qualification, DoubtResolution, Distribution
- **edges.ts** — Conditional routing between nodes
- **tools.ts** — Function Calling tools (save_lead, calculate_score, etc.)
- **graph.ts** — Compiled graph + `runLeadGraph()`
- **webhook**: `src/app/api/chat/route.ts` and `src/app/api/webhook/route.ts`

## Language
Code and documentation in English. UI strings in English.
