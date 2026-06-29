# Manneviga – Fjord Coordinator

A Southern Norwegian summer-house coordination app for the family: booking grid across
the three houses (Topstua, Hovedstua, Skipbua), weekly logs, a shared maintenance list,
and a "Fjord Memories" guest book.

## Stack
- React 19 + Vite 6 + TypeScript + Tailwind 4
- Supabase (Postgres + Realtime) for shared data — tables prefixed `manneviga_`
- Vercel for hosting (static SPA)

## Environment variables
See `.env.example`. For local dev copy it to `.env.local`:

- `VITE_SUPABASE_URL` – Supabase project URL (client, public)
- `VITE_SUPABASE_ANON_KEY` – Supabase anon/publishable key (client, public; protected by RLS)

In production these are set in the Vercel project settings, not committed.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in values
3. `npm run dev`

## Data model
Four tables in the shared Supabase project, all open read/write (family link, no login),
isolated from other apps by the `manneviga_` prefix:
`manneviga_bookings`, `manneviga_events`, `manneviga_tasks`, `manneviga_memories`.
