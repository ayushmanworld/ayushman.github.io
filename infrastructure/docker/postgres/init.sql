-- ==============================================================================
-- Ayushman Platform — PostgreSQL Initialization
-- ==============================================================================
-- This script runs once when the PostgreSQL container is first created.
-- It enables required extensions and sets up performance configurations.
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Performance configuration for development
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
ALTER SYSTEM SET log_statement = 'ddl';

-- Create application role with limited permissions
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ayushman_app') THEN
    CREATE ROLE ayushman_app LOGIN PASSWORD 'ayushman_dev_secret';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE ayushman_dev TO ayushman_app;
GRANT USAGE ON SCHEMA public TO ayushman_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ayushman_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ayushman_app;

-- Ensure future tables are also accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ayushman_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO ayushman_app;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Ayushman PostgreSQL initialization complete.';
  RAISE NOTICE 'Extensions enabled: uuid-ossp, vector (pgvector), pg_trgm, unaccent, citext';
END
$$;
