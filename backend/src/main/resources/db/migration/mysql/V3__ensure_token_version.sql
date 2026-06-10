-- MySQL 8.0+ supports IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- This is an idempotent guard: safe to re-run if V2 already added the column.
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0;
