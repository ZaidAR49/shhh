<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the **shhh** vault application. The integration covers client-side event tracking, server-side event tracking, user identification, error tracking via `capture_exceptions`, and a reverse proxy to avoid ad-blockers.

## What was set up

- **`instrumentation-client.ts`** — PostHog client initialized at app startup using the Next.js 15.3+ instrumentation pattern. No `PostHogProvider` component is used.
- **`src/lib/posthog-server.ts`** — Singleton server-side PostHog client (`posthog-node`) used across all API routes.
- **`next.config.ts`** — Reverse proxy rewrites added so PostHog requests route through `/ingest/` (avoids ad-blockers and keeps traffic first-party).
- **`.env.local`** — `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables written.
- **`src/hooks/useSession.ts`** — `posthog.identify()` called when a session is loaded (after OAuth sign-in). `posthog.reset()` called on sign-out.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `secret_created` | User successfully creates a new secret | `src/hooks/useVault.ts` |
| `secret_updated` | User edits and saves an existing secret | `src/hooks/useVault.ts` |
| `secret_deleted` | User deletes a secret from their vault | `src/hooks/useVault.ts` |
| `secret_favorited` | User toggles favorite status on a secret | `src/hooks/useVault.ts` |
| `vault_searched` | User performs a search query in the vault | `src/app/[locale]/vault/page.tsx` |
| `mfa_setup_started` | User initiates the MFA/2FA setup flow | `src/components/settings/MfaSettings.tsx` |
| `mfa_enabled` | User successfully enables MFA (client-side) | `src/components/settings/MfaSettings.tsx` |
| `mfa_disabled` | User disables MFA | `src/components/settings/MfaSettings.tsx` |
| `user_signed_up` | New user account created via OAuth (server-side) | `src/app/api/auth/[...nextauth]/route.ts` |
| `user_signed_in_server` | User signs in via OAuth (server-side) | `src/app/api/auth/[...nextauth]/route.ts` |
| `secret_created_server` | Secret created successfully via API (server-side) | `src/app/api/secrets/route.ts` |
| `secret_deleted_server` | Secret deleted successfully via API (server-side) | `src/app/api/secrets/[id]/route.ts` |
| `sensitive_secret_accessed` | Sensitive secret unlocked with MFA (server-side) | `src/app/api/secrets/[id]/route.ts` |
| `mfa_enabled_server` | MFA enabled server-side confirmation | `src/app/api/auth/mfa/enable/route.ts` |

## Next steps

We've built a dashboard and five insights to keep an eye on user behavior:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/202079/dashboard/748869)
- [New user signups](https://eu.posthog.com/project/202079/insights/MItUndDL)
- [Vault activity — secrets created, updated, deleted](https://eu.posthog.com/project/202079/insights/Emy7CGIR)
- [MFA adoption rate](https://eu.posthog.com/project/202079/insights/cbIhcE0A)
- [Sensitive secret accesses](https://eu.posthog.com/project/202079/insights/O7Mj6jwP)
- [Security onboarding funnel: signup → secret → MFA](https://eu.posthog.com/project/202079/insights/rUiBUVj6)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
