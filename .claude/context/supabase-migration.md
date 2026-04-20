# Supabase Migration

## Status: ✅ Complete

Migrated from SQLite (libsql) to Supabase PostgreSQL.

## Key Changes

- Prisma provider: `sqlite` → `postgresql`
- Adapter: `@prisma/adapter-libsql` → `@prisma/adapter-pg`
- JSON fields: `String` with `JSON.stringify/parse` → native `Json` type
- Connection: `prisma.config.ts` uses `DIRECT_URL` (port 5432) for CLI, `DATABASE_URL` (port 6543, pgbouncer) for runtime
- Added indexes on `Account.platform`, `Post.status`, `Post.createdAt`
- Added `@db.Text` on long fields (`accessToken`, `content`)

## Env Vars

```
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@pooler.supabase.com:5432/postgres"
```

## Important

- `prisma db push` / migrations require `DIRECT_URL` (direct connection, not pgbouncer)
- Runtime app uses `DATABASE_URL` (pooled connection via pgbouncer)
- Prisma 7 puts connection config in `prisma.config.ts`, NOT in `schema.prisma`
