-- ============================================================
--  Shhh — Full Database Schema
--  Project: qtzockghmthzsdjjpceg | Region: eu-central-1
--  Generated: 2026-06-15
-- ============================================================


-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "supabase_vault" SCHEMA vault;


-- ------------------------------------------------------------
-- Enum types
-- ------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM (
  'user',
  'admin',
  'supervisor',
  'viewer'
);

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

CREATE TYPE public.lang AS ENUM (
  'en',
  'ar'
);


-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

CREATE TABLE public."user" (
  id                    TEXT        NOT NULL DEFAULT (gen_random_uuid())::text,
  name                  TEXT,
  email                 TEXT        NOT NULL,
  "emailVerified"       TIMESTAMP,
  image                 TEXT,
  mfa_enabled           BOOLEAN     NOT NULL DEFAULT false,
  mfa_secret            TEXT,
  role                  public.user_role NOT NULL DEFAULT 'user',
  is_locked             BOOLEAN     NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN     NOT NULL DEFAULT true,
  preferred_locale      public.lang NOT NULL DEFAULT 'en',
  created_at            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT user_pkey      PRIMARY KEY (id),
  CONSTRAINT user_email_key UNIQUE (email)
);

-- ------------------------------------------------------------

CREATE TABLE public.account (
  "userId"          TEXT NOT NULL,
  type              TEXT NOT NULL,
  provider          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token     TEXT,
  access_token      TEXT,
  expires_at        INTEGER,
  token_type        TEXT,
  scope             TEXT,
  id_token          TEXT,
  session_state     TEXT,

  CONSTRAINT account_pkey       PRIMARY KEY (provider, "providerAccountId"),
  CONSTRAINT account_userId_fkey FOREIGN KEY ("userId")
    REFERENCES public."user" (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------

CREATE TABLE public.session (
  "sessionToken" TEXT      NOT NULL,
  "userId"       TEXT      NOT NULL,
  expires        TIMESTAMP NOT NULL,

  CONSTRAINT session_pkey       PRIMARY KEY ("sessionToken"),
  CONSTRAINT session_userId_fkey FOREIGN KEY ("userId")
    REFERENCES public."user" (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------

CREATE TABLE public."verificationToken" (
  identifier TEXT      NOT NULL,
  token      TEXT      NOT NULL,
  expires    TIMESTAMP NOT NULL,

  CONSTRAINT "verificationToken_pkey" PRIMARY KEY (identifier, token)
);

-- ------------------------------------------------------------

CREATE TABLE public.secrets (
  id             TEXT                NOT NULL DEFAULT (gen_random_uuid())::text,
  user_id        TEXT                NOT NULL,
  type           public.secret_type  NOT NULL,
  title          TEXT                NOT NULL,
  encrypted_data TEXT                NOT NULL,
  encrypted_dek  TEXT                NOT NULL,
  created_at     TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_sensitive   BOOLEAN             NOT NULL DEFAULT false,
  is_favorite    BOOLEAN             NOT NULL DEFAULT false,

  CONSTRAINT secrets_pkey        PRIMARY KEY (id),
  CONSTRAINT secrets_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public."user" (id) ON DELETE CASCADE
);


-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------

CREATE INDEX idx_account_user_id
  ON public.account ("userId");

CREATE INDEX idx_session_user_id
  ON public.session ("userId");

CREATE INDEX idx_secrets_user_id_created
  ON public.secrets (user_id, created_at DESC);


-- ------------------------------------------------------------
-- Functions
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


-- ------------------------------------------------------------
-- Triggers
-- ------------------------------------------------------------

CREATE TRIGGER secrets_updated_at
  BEFORE UPDATE ON public.secrets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- ------------------------------------------------------------
-- Views
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW public.admin_analytics AS
WITH user_stats AS (
  SELECT
    COUNT(*)                                                          AS total_users,
    COUNT(*) FILTER (WHERE role = 'admin')                           AS total_admins,
    COUNT(*) FILTER (WHERE role = 'user')                            AS total_regular_users,
    COUNT(*) FILTER (WHERE mfa_enabled = true)                       AS users_with_2fa_enabled,
    COUNT(*) FILTER (WHERE mfa_enabled = false)                      AS users_without_2fa,
    ROUND(
      (COUNT(*) FILTER (WHERE mfa_enabled = true))::numeric
      / NULLIF(COUNT(*), 0)::numeric * 100, 2
    )                                                                 AS pct_users_with_2fa,
    COUNT(*) FILTER (WHERE preferred_locale = 'en')                  AS users_english,
    COUNT(*) FILTER (WHERE preferred_locale = 'ar')                  AS users_arabic,
    COUNT(*) FILTER (WHERE is_locked = true)                         AS locked_accounts,
    COUNT(*) FILTER (WHERE notifications_enabled = true)             AS users_with_notifications,
    COUNT(*) FILTER (WHERE notifications_enabled = false)            AS users_without_notifications,
    COUNT(*) FILTER (WHERE "emailVerified" IS NOT NULL)              AS verified_email_users,
    COUNT(*) FILTER (WHERE "emailVerified" IS NULL)                  AS unverified_email_users,
    MIN("emailVerified")                                              AS first_verified_at,
    MAX("emailVerified")                                             AS last_verified_at
  FROM public."user"
),
secret_stats AS (
  SELECT
    COUNT(*)                                                          AS total_secrets,
    COUNT(DISTINCT user_id)                                          AS users_with_at_least_one_secret,
    COUNT(*) FILTER (WHERE is_sensitive = true)                      AS sensitive_secrets_count,
    COUNT(*) FILTER (WHERE is_favorite = true)                       AS favorite_secrets_count,
    COUNT(*) FILTER (WHERE type = 'password')                        AS secrets_password,
    COUNT(*) FILTER (WHERE type = 'visa')                            AS secrets_visa,
    COUNT(*) FILTER (WHERE type = 'env_variable')                    AS secrets_env_variable,
    COUNT(*) FILTER (WHERE type = 'api_key')                         AS secrets_api_key,
    COUNT(*) FILTER (WHERE type = 'license')                         AS secrets_license,
    COUNT(*) FILTER (WHERE type = 'identity')                        AS secrets_identity,
    COUNT(*) FILTER (WHERE type = 'bank_account')                    AS secrets_bank_account,
    COUNT(*) FILTER (WHERE type = 'secure_note')                     AS secrets_secure_note,
    COUNT(*) FILTER (WHERE type = 'wifi')                            AS secrets_wifi,
    MIN(created_at)                                                   AS oldest_secret_created_at,
    MAX(created_at)                                                   AS newest_secret_created_at,
    MIN(updated_at)                                                   AS oldest_secret_updated_at,
    MAX(updated_at)                                                   AS newest_secret_updated_at,
    ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT user_id), 0)::numeric, 2) AS avg_secrets_per_user,
    COUNT(*) FILTER (WHERE updated_at < NOW() - INTERVAL '90 days')  AS stale_secrets_90_days
  FROM public.secrets
),
risk_stats AS (
  SELECT
    COUNT(DISTINCT s.user_id) AS high_risk_users
  FROM public.secrets s
  JOIN public."user" u ON s.user_id = u.id
  WHERE s.is_sensitive = true AND u.mfa_enabled = false
),
account_stats AS (
  SELECT
    COUNT(*)                                          AS total_linked_accounts,
    COUNT(*) FILTER (WHERE provider = 'google')      AS accounts_google,
    COUNT(*) FILTER (WHERE provider = 'github')      AS accounts_github,
    COUNT(*) FILTER (WHERE provider = 'credentials') AS accounts_credentials,
    COUNT(DISTINCT "userId")                          AS users_with_linked_account
  FROM public.account
),
session_stats AS (
  SELECT
    COUNT(*)                  AS total_active_sessions,
    COUNT(DISTINCT "userId")  AS users_with_active_session,
    MIN(expires)              AS earliest_session_expiry,
    MAX(expires)              AS latest_session_expiry
  FROM public.session
  WHERE expires > NOW()
)
SELECT
  NOW()                             AS snapshot_at,
  -- User stats
  u.total_users,
  u.total_admins,
  u.total_regular_users,
  u.verified_email_users,
  u.unverified_email_users,
  u.locked_accounts,
  u.users_with_2fa_enabled,
  u.users_without_2fa,
  u.pct_users_with_2fa,
  u.users_english,
  u.users_arabic,
  u.users_with_notifications,
  u.users_without_notifications,
  u.first_verified_at,
  u.last_verified_at,
  -- Secret stats
  s.total_secrets,
  s.users_with_at_least_one_secret,
  s.avg_secrets_per_user,
  s.sensitive_secrets_count,
  s.favorite_secrets_count,
  s.secrets_password,
  s.secrets_visa,
  s.secrets_env_variable,
  s.secrets_api_key,
  s.secrets_license,
  s.secrets_identity,
  s.secrets_bank_account,
  s.secrets_secure_note,
  s.secrets_wifi,
  s.oldest_secret_created_at,
  s.newest_secret_created_at,
  s.oldest_secret_updated_at,
  s.newest_secret_updated_at,
  s.avg_secrets_per_user,
  s.stale_secrets_90_days,
  r.high_risk_users,
  -- Account stats
  a.total_linked_accounts,
  a.accounts_google,
  a.accounts_github,
  a.accounts_credentials,
  a.users_with_linked_account,
  -- Session stats
  se.total_active_sessions,
  se.users_with_active_session,
  se.earliest_session_expiry,
  se.latest_session_expiry
FROM user_stats u
CROSS JOIN secret_stats s
CROSS JOIN risk_stats r
CROSS JOIN account_stats a
CROSS JOIN session_stats se;


-- ------------------------------------------------------------
-- Row-Level Security
-- ------------------------------------------------------------

ALTER TABLE public."user"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secrets             ENABLE ROW LEVEL SECURITY;

-- user: own row only
CREATE POLICY users_own_row ON public."user"
  FOR ALL
  USING      (id      = (SELECT auth.uid())::text)
  WITH CHECK (id      = (SELECT auth.uid())::text);

-- account: own row only
CREATE POLICY accounts_own_row ON public.account
  FOR ALL
  USING      ("userId" = (SELECT auth.uid())::text)
  WITH CHECK ("userId" = (SELECT auth.uid())::text);

-- session: own row only
CREATE POLICY sessions_own_row ON public.session
  FOR ALL
  USING      ("userId" = (SELECT auth.uid())::text)
  WITH CHECK ("userId" = (SELECT auth.uid())::text);

-- secrets: own row only
CREATE POLICY secrets_own_row ON public.secrets
  FOR ALL
  USING      (user_id = (SELECT auth.uid())::text)
  WITH CHECK (user_id = (SELECT auth.uid())::text);