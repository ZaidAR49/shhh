-- =============================================================
--  SHHH — Digital Vault Database Schema
--  Compatible with: PostgreSQL 15+, Supabase, Neon, Railway,
--                   Render, PlanetScale (Postgres mode), etc.
--  To apply: paste this entire file into your SQL editor and run.
-- =============================================================


-- =============================================================
--  SECTION 1 — ENUM TYPES
-- =============================================================

CREATE TYPE secret_type AS ENUM (
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


-- =============================================================
--  SECTION 2 — NEXTAUTH TABLES
-- =============================================================

-- Users
CREATE TABLE "user" (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name            TEXT,
    email           TEXT        NOT NULL UNIQUE,
    "emailVerified" TIMESTAMP,
    image           TEXT
);

-- OAuth provider accounts linked to a user
CREATE TABLE account (
    "userId"            TEXT    NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type                TEXT    NOT NULL,
    provider            TEXT    NOT NULL,
    "providerAccountId" TEXT    NOT NULL,
    refresh_token       TEXT,
    access_token        TEXT,
    expires_at          INTEGER,
    token_type          TEXT,
    scope               TEXT,
    id_token            TEXT,
    session_state       TEXT,
    PRIMARY KEY (provider, "providerAccountId")
);

-- Active user sessions
CREATE TABLE session (
    "sessionToken"  TEXT        PRIMARY KEY,
    "userId"        TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expires         TIMESTAMP   NOT NULL
);

-- Email verification tokens
CREATE TABLE "verificationToken" (
    identifier  TEXT        NOT NULL,
    token       TEXT        NOT NULL,
    expires     TIMESTAMP   NOT NULL,
    PRIMARY KEY (identifier, token)
);


-- =============================================================
--  SECTION 3 — CORE VAULT TABLE
-- =============================================================

CREATE TABLE secrets (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type            secret_type NOT NULL,
    title           TEXT        NOT NULL,
    encrypted_data  TEXT        NOT NULL,  -- AES-GCM ciphertext (base64)
    encrypted_dek   TEXT        NOT NULL,  -- DEK wrapped with user's KEK (base64)
    is_sensitive    BOOLEAN     NOT NULL DEFAULT false,  -- treat as maximum security level
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================
--  SECTION 4 — FUNCTIONS & TRIGGERS
-- =============================================================

-- Auto-update updated_at on every secrets row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER secrets_updated_at
    BEFORE UPDATE ON secrets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- =============================================================
--  SECTION 5 — INDEXES
-- =============================================================

-- account
CREATE INDEX idx_account_user_id
    ON account("userId");

-- session
CREATE INDEX idx_session_user_id
    ON session("userId");

CREATE INDEX idx_session_expires
    ON session(expires);

-- verificationToken
CREATE INDEX idx_verification_token_expires
    ON "verificationToken"(expires);

-- secrets — single column (broad lookups)
CREATE INDEX idx_secrets_user_id
    ON secrets(user_id);

-- secrets — composite: filter by type within a user's vault
CREATE INDEX idx_secrets_user_id_type
    ON secrets(user_id, type);

-- secrets — composite: sort by newest first within a user's vault
CREATE INDEX idx_secrets_user_id_created
    ON secrets(user_id, created_at DESC);


-- =============================================================
--  SECTION 6 — ROW LEVEL SECURITY (RLS)
--  Note: auth.uid() is Supabase-specific.
--  If using another provider, replace auth.uid() with your
--  equivalent session user function, or remove RLS and enforce
--  access control at the application layer instead.
-- =============================================================

ALTER TABLE "user"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE account             ENABLE ROW LEVEL SECURITY;
ALTER TABLE session             ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets             ENABLE ROW LEVEL SECURITY;

-- Each user can only access their own row
CREATE POLICY "users_own_row" ON "user"
    FOR ALL
    USING (id = auth.uid()::text);

-- Each user can only access their own linked OAuth accounts
CREATE POLICY "accounts_own_row" ON account
    FOR ALL
    USING ("userId" = auth.uid()::text);

-- Each user can only access their own sessions
CREATE POLICY "sessions_own_row" ON session
    FOR ALL
    USING ("userId" = auth.uid()::text);

-- Each user can only access their own secrets
CREATE POLICY "secrets_own_row" ON secrets
    FOR ALL
    USING (user_id = auth.uid()::text);


-- =============================================================
--  END OF SCHEMA
-- =============================================================