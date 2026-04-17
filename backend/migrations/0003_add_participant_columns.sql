-- Idempotent: hints/role columns are already on room_participants in current schema.sql.
-- Old ALTERs duplicated 0001 and failed on DBs that already had these columns.

SELECT 1;
