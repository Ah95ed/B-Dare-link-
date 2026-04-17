-- Idempotent placeholder: many production DBs already have `role` / manager columns
-- (from schema.sql or manual updates). The old ALTERs caused:
--   duplicate column name: role
-- Real DDL lives in 0002 (CREATE IF NOT EXISTS) and 0004 (solo bank).

SELECT 1;
