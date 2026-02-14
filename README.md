# QuietWord Monorepo MVP

QuietWord - "Built for busy minds."  
Supporting line: "One passage at a time."

## Monorepo Layout

- `apps/api` - ASP.NET Core Web API (.NET 9) + EF Core + PostgreSQL
- `apps/web` - React + TypeScript (Vite)
- `seed/john-psalms-30.json` - 30-day John + Psalms plan seed
- `infra/docker-compose.yml` - Postgres + API + Web stack
- `tests/api-tests` - API unit + integration tests

## Architecture Notes

- MVP auth uses one fixed seeded user id (`11111111-1111-1111-1111-111111111111`).
- `ITextProvider` abstraction decouples scripture retrieval from endpoint logic.
- `BibleApiTextProvider` wraps a public-domain compatible source (`bible-api.com`), adds memory cache and graceful fallback text.
- Deterministic chunking:
  - John: chunk size 1-3 based on verse count (`<=6 => 1`, `<=15 => 2`, else `3`)
  - Psalms: chunk size 2-4 based on verse count (`<=8 => 2`, `<=16 => 3`, else `4`)
- Resume state stores section/ref/chunk index + anchor and restores by re-chunking.
- Plan seed upserts by slug and replaces `plan_days` rows for the seeded plan.

## API Endpoints

- `GET /api/bootstrap`
- `GET /api/day/today`
- `GET /api/passage?ref=...&translation=...`
- `POST /api/state/resume`
- `POST /api/notes`
- `GET /api/notes?limit=10`
- `POST /api/day/complete`
- `GET /api/recall/pending`
- `POST /api/recall/answer`
- `GET /api/settings`
- `POST /api/settings`

## Setup

1. Copy env file:
   - `Copy-Item .env.example .env`
2. Start infra stack:
   - `docker compose -f infra/docker-compose.yml --env-file .env up --build`
3. Open:
   - Web: `http://localhost:43173`
   - API: `http://localhost:8080`

## Local Dev (without Docker)

1. Start Postgres locally (or keep docker postgres only).
2. API:
   - `dotnet restore`
   - `dotnet run --project apps/api`
3. Web:
   - `cd apps/web`
   - `npm install`
   - `npm run dev`

## Migrations

- Initial migration is included at `apps/api/Migrations/202602130001_InitialCreate.cs`.
- API applies migrations on startup; in non-relational test provider it uses `EnsureCreated`.

## Testing

- Run API tests:
  - `dotnet test tests/api-tests/QuietWord.Api.Tests.csproj`

Included tests:
- Chunking determinism + bounds
- Integration flow: start day -> save resume -> bootstrap shows restored resume

## Licensed Translation Next Steps

1. Add provider implementations per translation source and select by capability in `ITextProvider` strategy.
2. Move translation config into database-backed feature flags.
3. Add provider-level attribution + license metadata in settings/help endpoints.
4. Add cache invalidation policy and background warm-up for tomorrow's passages.
