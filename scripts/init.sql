-- VaidyaMarg Database Initialization
-- This runs once when PostgreSQL container first starts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for fast text search
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- for accent-insensitive search

-- Create app user with limited privileges
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vaidyamarg_app') THEN
    CREATE ROLE vaidyamarg_app LOGIN PASSWORD 'change_in_production';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE vaidyamarg_db TO vaidyamarg_app;
GRANT USAGE ON SCHEMA public TO vaidyamarg_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vaidyamarg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vaidyamarg_app;

SELECT 'VaidyaMarg database initialized successfully' AS status;
