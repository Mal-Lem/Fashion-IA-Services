-- Extensions PostgreSQL nécessaires
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Recherche full-text trigram
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- Index GIN sur arrays

-- Message de confirmation
DO $$ BEGIN
  RAISE NOTICE 'Fashion AI Platform — Extensions PostgreSQL installées';
END $$;
