-- =============================================================================
--  FULL SCHEMA DUMP — shhh (Supabase project: qtzockghmthzsdjjpceg)
--  Generated: 2026-06-13
--  Postgres 17 compatible
--  Apply top-to-bottom on a fresh Postgres / Supabase instance.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto"        WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"       WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
-- Note: supabase_vault is Supabase-internal; skip on non-Supabase providers.
-- CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA vault;


-- -----------------------------------------------------------------------------
-- 1. SCHEMAS
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS drizzle;
-- public already exists on every Postgres instance.


-- -----------------------------------------------------------------------------
-- 2. SEQUENCES
-- -----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS drizzle.__drizzle_migrations_id_seq
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 2147483647
  START WITH 1
  NO CYCLE;


-- -----------------------------------------------------------------------------
-- 3. CUSTOM TYPES / ENUMS
-- -----------------------------------------------------------------------------
CREATE TYPE public.secret_type AS ENUM (
  'password',
  'visa',
  'env_variable',
  'api_key',
  'license',
  'identity',
  'bank_account',
  'secure_note',
  'wifi'
);


-- -----------------------------------------------------------------------------
-- 4. TABLES
-- -----------------------------------------------------------------------------

-- 4a. drizzle.__drizzle_migrations  (Drizzle ORM migration tracking)
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id         int4  NOT NULL DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass),
  hash       text  NOT NULL,
  created_at int8
);

-- 4b. public."user"
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE lang AS ENUM ('en', 'ar');

CREATE TABLE public."user" (
  id                   text        NOT NULL DEFAULT (gen_random_uuid())::text,
  name                 text,
  email                text        NOT NULL UNIQUE,
  "emailVerified"      timestamp,
  image                text,
  mfa_enabled          boolean     NOT NULL DEFAULT false,
  mfa_secret           text,
  role                 user_role   NOT NULL DEFAULT 'user',
  is_locked            boolean     NOT NULL DEFAULT false,
  notifications_enabled boolean    NOT NULL DEFAULT true,
  preferred_locale     lang        NOT NULL DEFAULT 'ar',
  PRIMARY KEY (id)
);

-- 4c. public.account  (OAuth accounts linked to a user)
CREATE TABLE IF NOT EXISTS public.account (
  "userId"          text NOT NULL,
  type              text NOT NULL,
  provider          text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token     text,
  access_token      text,
  expires_at        int4,
  token_type        text,
  scope             text,
  id_token          text,
  session_state     text
);

-- 4d. public.session
CREATE TABLE IF NOT EXISTS public.session (
  "sessionToken" text      NOT NULL,
  "userId"       text      NOT NULL,
  expires        timestamp NOT NULL
);

-- 4e. public.secrets
CREATE TABLE IF NOT EXISTS public.secrets (
  id             text             NOT NULL DEFAULT (gen_random_uuid())::text,
  user_id        text             NOT NULL,
  type           public.secret_type NOT NULL,
  title          text             NOT NULL,
  encrypted_data text             NOT NULL,
  encrypted_dek  text             NOT NULL,
  created_at     timestamp        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     timestamp        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_sensitive   bool             NOT NULL DEFAULT false,
  is_favorite    bool             NOT NULL DEFAULT false
);

-- 4f. public."verificationToken"
CREATE TABLE IF NOT EXISTS public."verificationToken" (
  identifier text      NOT NULL,
  token      text      NOT NULL,
  expires    timestamp NOT NULL
);


-- -----------------------------------------------------------------------------
-- 5. PRIMARY KEYS & UNIQUE CONSTRAINTS
-- -----------------------------------------------------------------------------
ALTER TABLE drizzle.__drizzle_migrations
  ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);

ALTER TABLE public."user"
  ADD CONSTRAINT user_pkey PRIMARY KEY (id);

ALTER TABLE public."user"
  ADD CONSTRAINT user_email_key UNIQUE (email);

ALTER TABLE public.account
  ADD CONSTRAINT account_pkey PRIMARY KEY (provider, "providerAccountId");

ALTER TABLE public.session
  ADD CONSTRAINT session_pkey PRIMARY KEY ("sessionToken");

ALTER TABLE public.secrets
  ADD CONSTRAINT secrets_pkey PRIMARY KEY (id);

ALTER TABLE public."verificationToken"
  ADD CONSTRAINT "verificationToken_pkey" PRIMARY KEY (identifier, token);


-- -----------------------------------------------------------------------------
-- 6. FOREIGN KEYS
-- -----------------------------------------------------------------------------
ALTER TABLE public.account
  ADD CONSTRAINT "account_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES public."user" (id)
  ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE public.session
  ADD CONSTRAINT "session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES public."user" (id)
  ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE public.secrets
  ADD CONSTRAINT secrets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public."user" (id)
  ON UPDATE NO ACTION ON DELETE CASCADE;


-- -----------------------------------------------------------------------------
-- 7. INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_account_user_id
  ON public.account USING btree ("userId");

CREATE INDEX idx_session_user_id
  ON public.session USING btree ("userId");

CREATE INDEX idx_session_expires
  ON public.session USING btree (expires);

CREATE INDEX idx_secrets_user_id
  ON public.secrets USING btree (user_id);

CREATE INDEX idx_secrets_user_id_type
  ON public.secrets USING btree (user_id, type);

CREATE INDEX idx_secrets_user_id_created
  ON public.secrets USING btree (user_id, created_at DESC);

CREATE INDEX idx_verification_token_expires
  ON public."verificationToken" USING btree (expires);


-- -----------------------------------------------------------------------------
-- 8. FUNCTIONS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


-- -----------------------------------------------------------------------------
-- 9. TRIGGERS
-- -----------------------------------------------------------------------------
CREATE TRIGGER secrets_updated_at
  BEFORE UPDATE ON public.secrets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- -----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE public."user"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secrets   ENABLE ROW LEVEL SECURITY;

-- Policies: each user may only see/modify their own rows.
-- NOTE: auth.uid() is Supabase-specific.
--       On other providers replace with your JWT uid extraction expression.

CREATE POLICY users_own_row ON public."user"
  AS PERMISSIVE FOR ALL TO public
  USING (id = (auth.uid())::text);

CREATE POLICY accounts_own_row ON public.account
  AS PERMISSIVE FOR ALL TO public
  USING ("userId" = (auth.uid())::text);

CREATE POLICY sessions_own_row ON public.session
  AS PERMISSIVE FOR ALL TO public
  USING ("userId" = (auth.uid())::text);

CREATE POLICY secrets_own_row ON public.secrets
  AS PERMISSIVE FOR ALL TO public
  USING (user_id = (auth.uid())::text);


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================