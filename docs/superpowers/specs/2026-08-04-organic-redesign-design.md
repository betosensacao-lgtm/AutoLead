# FlowAI organic redesign

## Context

FlowAI's current UI (landing page, login/signup, admin dashboard, chat/workflow
generator) uses a visual language that reads as generic AI-generated SaaS:
dark `slate-950` backgrounds, cyan-to-purple gradients on every icon badge,
button, and active nav state, glassmorphism (`backdrop-blur` + translucent
panels), blurred glow orbs behind the hero, pill-shaped gradient CTAs, and the
Inter/Sora font pairing — the exact combination tools like v0, Lovable, and
similar AI builders default to. The user wants the whole app to feel
hand-designed and "organic" instead, without changing any functionality.
Separately, the app is currently in Portuguese; it needs to be in English for
portfolio presentation, bundled into this same pass.

This spec was developed through iterative visual brainstorming (mockups shown
via a local browser companion) rather than abstract description, because the
core ask is fundamentally about look and feel. Each decision below was shown
to the user as a rendered comparison and explicitly chosen.

## Design direction: "Botanical / Nature-Tech"

Three distinct directions were mocked up (Warm Editorial, Grounded
Craft/Neutral, Botanical/Nature-Tech). The user chose **Botanical/Nature-Tech**
and refined it further: a warm paper background with sage green as the sole
accent, textured with paper grain and an organic root/branch line motif that
doubles as a visual metaphor for the product itself (workflows = connected
paths, same as roots or branches).

## Design tokens

**Color** (light theme only — no dark mode, per explicit decision; applies to
every page including the admin dashboard):

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f3efe3` | Page background |
| `--paper-raised` | `#f9f6ec` | Card / input fill |
| `--paper-deep` | `#e7e2d2` | Sidebar background (slightly deeper than page, for wayfinding contrast) |
| `--ink` | `#26301c` | Primary text |
| `--ink-muted` | `#55603f` | Secondary text, labels |
| `--sage` | `#6b7f4f` | Primary accent — buttons, active states, links, focus ring |
| `--sage-dark` | `#566a3d` | Hover/active state of sage elements |
| `--border` | `rgba(38,48,28,0.14)` | Hairline borders on cards, inputs, dividers |
| `--error` | `#a34a3a` | Muted brick-red for destructive/error states (not a bright red) |

No gradients anywhere. No `backdrop-blur`. No glow/neon box-shadows — the only
shadow use is a very soft, low-opacity drop shadow for true overlays (modals,
dropdowns), not for cards or buttons sitting on the page.

**Texture:**
- Paper grain: a subtle dot-noise texture (`radial-gradient` dot pattern or an
  SVG turbulence filter) applied sitewide at low opacity — present everywhere
  but never competing with content.
- Root/branch line motif: hand-drawn-feeling organic SVG paths connecting
  small circular nodes, in `--sage` at ~40-50% opacity. Used with full
  presence on the landing hero background; used sparse or omitted on
  information-dense screens (dashboard tables/stats) so it never hurts
  scanability. Never used as a repeating tiled pattern — hand-placed per
  section so it doesn't read as a generic background asset.

**Typography:**
- Display / headlines (`h1`–`h3`, hero copy, empty-state copy): **Fraunces**,
  weight 600.
- Body / UI (paragraphs, labels, buttons, nav items, table content, form
  inputs, numerals in stat tiles): **Public Sans**, weights 400/500/600.
- Replaces the current Inter (body) + Sora (display) pairing everywhere,
  including `tailwind.config.ts` `fontFamily` and the `<body>` class in
  `src/app/layout.tsx`.

**Shape:**
- Buttons, inputs, and cards use a **7-8px border radius** — explicitly not
  the pill/`rounded-full` shape used today, and not the current
  `rounded-xl`/`rounded-2xl`/`rounded-3xl` scale either. Modest, consistent
  radius across all interactive elements.
- Cards are flat fills with a 1px hairline border (`--border`), no blur, no
  translucency.

## Component patterns

- **Buttons (primary):** solid `--sage` fill, white text, 7px radius, no
  gradient, no glow shadow.
- **Buttons (secondary/outline):** transparent fill, `--ink` text, 1.5px
  border in a muted ink tone, same 7px radius.
- **Cards:** `--paper-raised` fill, 1px `--border` hairline, 8px radius, no
  shadow at rest (a very subtle shadow only on hover/interactive cards is
  acceptable, not glow-colored).
- **Inputs:** `--paper-raised` fill, 1px `--border`, 7px radius, focus ring in
  `--sage` (replacing the current cyan focus border).
- **Sidebar nav:** `--paper-deep` panel background (not a translucent dark
  glass panel). Active item gets a solid `--sage` fill with white text
  (replacing the current gradient + border treatment); inactive items are
  `--ink-muted` text with a plain hover background.
- **Icon/logo mark:** the current gradient rounded-square badge with a Lucide
  `Workflow` icon and glow shadow is replaced by a simple line-drawn mark (a
  small circular `--sage` badge with an outline icon, no fill gradient, no
  glow) — exact icon choice (e.g. a `Sprout`/`GitBranch`-style outline) is an
  implementation detail, not something that needs further sign-off.
- **Chat bubbles** (`app/chat/page.tsx`): assistant messages become plain
  `--paper-raised` bubbles with a hairline border (replacing dark slate
  bubbles); user messages get a soft `--sage`-tinted fill.

## Page-by-page application

1. **Landing (`src/app/page.tsx`):** full paper+grain+root-line hero
   background, Fraunces headline, sage button (7px radius, no pill/gradient),
   feature cards as flat bordered cards replacing the current
   `backdrop-blur` glass cards with gradient icon badges.
2. **Login / Signup (`admin/login/page.tsx`, `admin/signup/page.tsx`):**
   centered card on the paper background, texture kept subtle (root-line
   motif faint or omitted so it doesn't distract from the form), new icon
   mark, sage focus states on inputs.
3. **Admin sidebar (`admin/layout.tsx`):** `--paper-deep` panel, solid-sage
   active nav state, plain hover states, new icon mark and "engine banner"
   restyled to match (no gradient, no glow).
4. **Dashboard (`admin/dashboard/page.tsx`, `components/realtime-dashboard.tsx`):**
   flat bordered stat cards, texture minimized for readability, `--error` used
   for any failure/negative indicators instead of a bright red.
5. **Chat / generator (`app/chat/page.tsx`):** paper-toned chat bubbles per
   above, flat input bar with a sage send button.
6. **Global:** `src/styles/globals.css` gets the new CSS custom properties
   (light-only — the existing `prefers-color-scheme: dark` override block is
   removed since there is no dark theme); `tailwind.config.ts` font families
   and any `brand` color references are updated to the new tokens.

## Language: English throughout

The app must be in English (not Portuguese) for portfolio presentation. This
is bundled into the same implementation pass as the visual redesign, since
most of the same files are being touched anyway — translating and restyling
each page in one edit avoids a second pass over the same code.

**Files with Portuguese copy to translate:**
- `src/app/page.tsx` (landing) — nav, hero, feature cards, footer
- `src/app/admin/login/page.tsx` — labels, placeholders, button, error toasts
- `src/app/admin/layout.tsx` — nav item labels ("Dashboard FlowAI", "Gerador IA (LangGraph)"), engine banner copy, user role label
- `src/app/admin/dashboard/page.tsx` — headings, labels
- `src/app/chat/page.tsx` — placeholder/labels/empty states
- `src/app/api/admin/login/route.ts` — user-facing error strings ("Email e senha são obrigatórios", "Email ou senha incorretos")
- `src/app/api/admin/workflows/route.ts` — default workflow name/description ("Novo Workflow FlowAI", "Criado via FlowAI Studio")
- `src/lib/langgraph/nodes.ts` — `FLOWAI_PROMPT` (the agent's system prompt) and its canned fallback replies
- `src/lib/langgraph/tools.ts` — tool `description` strings and default values (e.g. `"Novo Workflow"`) sent to the LLM
- `src/app/layout.tsx` — `<html lang="pt">` → `lang="en"`, and the Portuguese `metadata.description`

**`src/app/admin/signup/page.tsx` needs more than translation:** it's already
in English, but it's a stale pre-pivot leftover — different visual system
entirely (`bg-brand-600`, `rounded-lg`, no paper/sage tokens) and copy that
still says *"Start qualifying leads with AI"* (the old lead-qualification
product, not FlowAI). It gets the same redesign treatment as every other page
plus a copy fix to describe FlowAI's actual workflow-automation purpose.

Not in scope for translation: code identifiers, comments, commit messages,
and `AGENTS.md`/`.env.example` are already English.

## Out of scope

- No functional changes — this is a styling-layer pass only. Every route,
  form submission, auth flow, and API call already verified in the earlier
  security-hardening work continues to work exactly as before.
- No dark mode / theme switcher — explicitly decided against.
- Beyond translating to English (and the `signup` page's product-description
  fix noted above), no content rewrites — feature descriptions, workflow
  copy, etc. keep their current meaning, just in English.
- Exact icon glyph for the new logo mark is an implementation detail chosen
  during implementation, not a design decision requiring further sign-off.

## Verification

After implementation: start the dev server, visually check each redesigned
page (landing, login, signup, dashboard, chat) in the browser at both desktop
and mobile widths, confirm every page reads in English with no leftover
Portuguese strings (re-run the accented-character grep from this spec's
research as a sanity check), confirm forms still submit correctly (login,
signup, chat message send) and no console errors were introduced, and confirm
`tsc --noEmit` and the existing Vitest suite still pass (styling changes
shouldn't touch any tested logic, but this catches accidental breakage).
