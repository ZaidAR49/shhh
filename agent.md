# 🤖 agent.md — AI Coding Agent Instructions
## Project: **Shhh** — The Passwordless Secrets Vault

> These instructions are to be given verbatim to an AI coding agent (Cursor, antigravity, GitHub Copilot Agent, Claude Code, etc.) at the start of every session. The agent must follow every rule in this file without exception. If a rule conflicts with a shortcut, the rule wins.

---

## 1. PROJECT IDENTITY

**Name:** Shhh
**Tagline:** Your secrets, locked by who you are — not what you remember.
**Domain:** Security-first digital vault for storing sensitive data (passwords, credit cards, API keys, bank accounts, WiFi credentials, identity documents, secure notes, license keys, environment variables).
**Core Promise:** 100% passwordless. Access via Google OAuth + device biometrics only. 1-hour session hard limit.
**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · react-icons · next-intl (i18n) · next-themes (dark/light) · Zod (validation) · React Hook Form (form state)
**Target Users:** Non-technical people who cannot or do not want to manage passwords. Design for the lowest digital literacy in the room.

---

## 2. WHAT WE ARE BUILDING RIGHT NOW

**Phase 1 — Frontend Shell Only.**
- No real backend. No real database. No real auth.
- All data is fake, seeded from a single file: `src/data/mock-data.ts`
- All API calls are mocked in `src/lib/mock-api.ts`
- All state is local (React state / localStorage for dev convenience only — never in production patterns)
- The goal is a pixel-perfect, fully responsive, fully translated, fully themed UI that can later be wired to a real backend by replacing `mock-api.ts`

---

## 3. ABSOLUTE RULES — NEVER BREAK THESE

### 3.1 No Emoji as Icons
- **NEVER** use emoji (🔒, ✅, ⚠️, etc.) as interface icons anywhere in the UI.
- **ALWAYS** use `react-icons` for every icon. Prefer the `ri` (Remix Icon) set as the primary set. Use `lu` (Lucide) as secondary. Use `tb` (Tabler) for specialized needs.
- Import pattern: `import { RiShieldKeyholeLine } from 'react-icons/ri'`

### 3.2 No AI-Default Design Patterns
The following visual patterns are **banned** because they signal AI-generated templated design:
- ❌ Warm cream background (`#F4F1EA` range) + terracotta accent
- ❌ Near-black background + single acid-green or vermilion accent as the whole palette
- ❌ Broadsheet / newspaper hairline-rule dense-column layout
- ❌ Generic "01 / 02 / 03" numbered section markers unless content is genuinely sequential
- ❌ Gradient hero banners with a big number + stat + gradient accent as the hero pattern
- ❌ Card grids with identical height cards, drop shadows, and rounded corners as the only layout device
- ❌ "Frosted glass" cards stacked on a blurred gradient background (the SaaS cliché)

### 3.3 No Form HTML Tags in React Components
- **NEVER** use `<form>` HTML elements.
- Use `<div>` wrappers with `onSubmit`-style `onClick` handlers on buttons.
- All inputs use controlled React state.

### 3.4 No Hardcoded Strings in Components
- **Every** user-facing string must go through `next-intl`'s `useTranslations()` hook or `getTranslations()` server helper.
- Never write `<p>Add a secret</p>` — write `<p>{t('vault.addSecret')}</p>`
- Translation keys live in `src/messages/en.json` and `src/messages/ar.json`

### 3.5 No Inline Styles
- Zero `style={{ }}` props except for truly dynamic CSS custom properties (`--progress`, `--rotation`, etc.).
- All styling via Tailwind utility classes or `cn()` helper.

### 3.6 Security Vocabulary in the UI
- Never say "password" when referring to the app's authentication. The app is **passwordless**.
- Say "vault" not "account" when referring to the user's data container.
- Say "secret" not "entry" or "record" or "item" when referring to stored data.
- Say "lock vault" not "log out" in the primary navigation action.
- Say "unlock" not "sign in" in the auth flow.

### 3.7 Responsive Design is Non-Negotiable
- Every component must work on: `sm` (≥640px), `md` (≥768px), `lg` (≥1024px), `xl` (≥1280px), `2xl` (≥1536px)
- Mobile-first: write the base style for mobile, then override with breakpoint prefixes.
- Test every component mentally at 375px width before considering it done.
- No horizontal scroll on any screen size.

### 3.8 Dark Mode and Light Mode
- All colors must use CSS custom properties defined in `globals.css` using the shadcn/ui convention (`--background`, `--foreground`, `--card`, `--primary`, etc.)
- Never hardcode a color class like `bg-slate-900` directly. Use semantic tokens: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`.
- The theme toggle must be accessible and persistent (via `next-themes`).

### 3.9 RTL Support for Arabic
- The `<html>` element's `dir` attribute must switch between `ltr` (English) and `rtl` (Arabic) dynamically based on locale.
- Use Tailwind's `rtl:` variant for directional overrides: `ml-2 rtl:ml-0 rtl:mr-2`
- Arabic font: use `Cairo` or `Tajawal` from Google Fonts as the Arabic typeface, loaded via `next/font`.
- English font: use `Inter` as the primary sans-serif.
- Never use `left-` / `right-` positioning without a corresponding `rtl:` override.
- Never use `text-left` without `rtl:text-right` unless it's genuinely alignment-neutral.

### 3.10 Accessibility Baseline
- All interactive elements must have accessible labels: `aria-label`, `aria-describedby`, or visible text.
- Color alone must never be the only differentiator (pair color with icon or text).
- Focus rings must be visible (use shadcn/ui defaults, do not suppress `outline`).
- `prefers-reduced-motion` must be respected: wrap all CSS animations in `@media (prefers-reduced-motion: no-preference)`.

---

## 4. DESIGN SYSTEM — THE SHHH IDENTITY

### 4.1 Aesthetic Direction
**Security-native minimalism with intentional depth.**
Shhh is a vault. The design language should feel like a physical high-security safe: precise, heavy, trustworthy. Not cold or intimidating — but serious. The signature design choice is **controlled negative space with precise grid discipline**, as if every element earned its place by passing a security audit.

**Not:** Playful SaaS. Not fintech dashboard overload. Not password manager from 2015.
**Yes:** The intersection of a Swiss security firm and a modern banking app. Deliberate. Confident. Quiet.

### 4.2 Color Palette (CSS Custom Properties)

Define these in `globals.css` under `:root` (light) and `.dark`:

```css
/* Light Mode */
:root {
  --background:        #F8F9FB;   /* Near-white with a blue-grey tint */
  --foreground:        #0F1117;   /* Almost-black, not pure black */
  --card:              #FFFFFF;
  --card-foreground:   #0F1117;
  --popover:           #FFFFFF;
  --popover-foreground:#0F1117;
  --primary:           #1B3A6B;   /* Deep navy — the vault color */
  --primary-foreground:#F8F9FB;
  --secondary:         #EEF2F7;   /* Pale blue-grey for secondary surfaces */
  --secondary-foreground:#1B3A6B;
  --muted:             #EEF2F7;
  --muted-foreground:  #6B7A99;   /* Slate blue for de-emphasized text */
  --accent:            #2C6BED;   /* Bright cobalt — used sparingly for actions */
  --accent-foreground: #FFFFFF;
  --destructive:       #DC2626;
  --destructive-foreground:#FFFFFF;
  --border:            #DDE3ED;
  --input:             #DDE3ED;
  --ring:              #2C6BED;
  --radius:            0.5rem;
  /* Security-specific tokens */
  --vault-locked:      #DC2626;   /* Red for locked/alert states */
  --vault-unlocked:    #16A34A;   /* Green for active session */
  --vault-warning:     #D97706;   /* Amber for expiry warnings */
  --vault-shield:      #1B3A6B;   /* Navy for shield/security icons */
}

/* Dark Mode */
.dark {
  --background:        #0A0D14;   /* Deep blue-black */
  --foreground:        #E8ECF4;
  --card:              #111827;   /* Slightly lighter than bg */
  --card-foreground:   #E8ECF4;
  --popover:           #111827;
  --popover-foreground:#E8ECF4;
  --primary:           #4A8CFF;   /* Lighter navy for dark bg readability */
  --primary-foreground:#0A0D14;
  --secondary:         #1A2035;
  --secondary-foreground:#A0AECF;
  --muted:             #1A2035;
  --muted-foreground:  #6B7A99;
  --accent:            #4A8CFF;
  --accent-foreground: #0A0D14;
  --destructive:       #EF4444;
  --destructive-foreground:#0A0D14;
  --border:            #1E2D47;
  --input:             #1E2D47;
  --ring:              #4A8CFF;
  /* Security-specific tokens */
  --vault-locked:      #EF4444;
  --vault-unlocked:    #22C55E;
  --vault-warning:     #F59E0B;
  --vault-shield:      #4A8CFF;
}
```

### 4.3 Typography

```css
/* In layout.tsx / globals.css */
/* Primary: Inter (Latin) */
/* Arabic: Cairo */
/* Monospace: JetBrains Mono (for secrets values, API keys, passwords) */
```

Type scale (Tailwind):
- Display: `text-4xl font-bold tracking-tight` (page titles)
- Heading 1: `text-2xl font-semibold`
- Heading 2: `text-xl font-semibold`
- Heading 3: `text-base font-semibold`
- Body: `text-sm font-normal leading-relaxed`
- Caption: `text-xs text-muted-foreground`
- Mono (secrets): `font-mono text-sm` — always for displayed secret values

**Rule:** Secret values (passwords, API keys, card numbers, etc.) are ALWAYS rendered in monospace font. This is both a design and a security affordance — it makes values scannable and signals "this is sensitive data."

### 4.4 Spacing & Grid

- Base unit: 4px (Tailwind's `1` unit)
- Page padding: `px-4 sm:px-6 lg:px-8`
- Card gap in vault grid: `gap-3 sm:gap-4`
- Section separation: `space-y-6 sm:space-y-8`
- Consistent border-radius: use `--radius` token via Tailwind's `rounded-lg`

### 4.5 The Signature Design Element

**The Lock State Indicator** — a persistent, subtle security status bar at the top of every authenticated page. A thin (2px) horizontal line below the top navigation whose color transitions from `--vault-unlocked` (green) to `--vault-warning` (amber) to `--vault-locked` (red) as the 1-hour session approaches expiry. This is the single unique element that makes Shhh visually distinctive. It is never shown on auth pages. It is never decorative — it communicates real session state.

---

## 5. APPLICATION STRUCTURE

The agent must scaffold this exact folder structure in Phase 1:

```
shhh/
├── src/
│   ├── app/
│   │   ├── [locale]/               # next-intl locale routing
│   │   │   ├── layout.tsx          # Root layout with font, theme, intl providers
│   │   │   ├── page.tsx            # Landing / marketing page
│   │   │   ├── auth/
│   │   │   │   └── page.tsx        # Unlock page (Google OAuth mock)
│   │   │   ├── vault/
│   │   │   │   ├── layout.tsx      # Vault shell layout (sidebar + session bar)
│   │   │   │   ├── page.tsx        # Vault dashboard (secret grid)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx    # Secret detail / edit page
│   │   │   │   └── new/
│   │   │   │       └── page.tsx    # Add new secret wizard
│   │   │   └── settings/
│   │   │       └── page.tsx        # User settings (theme, language, session)
│   │   ├── api/                    # Future real API routes (empty in Phase 1)
│   │   └── globals.css             # ALL CSS custom properties + base styles
│   ├── components/
│   │   ├── ui/                     # shadcn/ui auto-generated components (do not edit)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Top navigation with session indicator
│   │   │   ├── Sidebar.tsx         # Vault category sidebar
│   │   │   ├── SessionBar.tsx      # The 2px signature security status line
│   │   │   └── ThemeToggle.tsx     # Dark/light mode toggle
│   │   ├── vault/
│   │   │   ├── SecretCard.tsx      # Single secret card in the grid
│   │   │   ├── SecretGrid.tsx      # Responsive grid of SecretCards
│   │   │   ├── SecretTypeIcon.tsx  # Maps secret_type enum to react-icons icon
│   │   │   ├── SecretDetail.tsx    # Full secret detail view
│   │   │   ├── AddSecretWizard.tsx # Multi-step form for adding a secret
│   │   │   ├── CopyButton.tsx      # Copy-to-clipboard with auto-clear (30s)
│   │   │   └── MaskToggle.tsx      # Show/hide masked secret value
│   │   ├── auth/
│   │   │   ├── UnlockScreen.tsx    # Google OAuth + biometrics unlock UI
│   │   │   └── SessionExpiry.tsx   # Warning modal before session ends
│   │   └── shared/
│   │       ├── LanguageSwitcher.tsx
│   │       ├── EmptyState.tsx      # Empty vault state with CTA
│   │       ├── SearchBar.tsx       # Global vault search
│   │       └── ConfirmDialog.tsx   # Delete/destructive action confirmation
│   ├── data/
│   │   └── mock-data.ts            # ← SINGLE SOURCE OF TRUTH for all fake data
│   ├── lib/
│   │   ├── mock-api.ts             # Fake async API functions (simulate latency)
│   │   ├── utils.ts                # cn() helper + general utilities
│   │   ├── secret-types.ts         # secret_type enum + metadata (label, icon, fields)
│   │   └── session.ts              # Mock session state management
│   ├── hooks/
│   │   ├── useSession.ts           # Mock session hook (expiry countdown)
│   │   ├── useVault.ts             # Vault data fetching + CRUD (calls mock-api)
│   │   └── useClipboard.ts         # Copy with auto-clear timeout
│   ├── messages/
│   │   ├── en.json                 # English translations (complete)
│   │   └── ar.json                 # Arabic translations (complete)
│   ├── types/
│   │   └── index.ts                # All TypeScript types and interfaces
│   └── middleware.ts               # next-intl locale middleware
├── tailwind.config.ts
├── next.config.ts
├── components.json                 # shadcn/ui config
└── package.json
```

---

## 6. SECRET TYPES — COMPLETE DEFINITION

Define this in `src/lib/secret-types.ts`. This is the exhaustive list. Do not add or remove types without explicit instruction.

```typescript
export type SecretType =
  | 'password'
  | 'visa'
  | 'env_variable'
  | 'api_key'
  | 'license'
  | 'identity'
  | 'bank_account'
  | 'secure_note'
  | 'wifi';

export interface SecretTypeConfig {
  type: SecretType;
  labelKey: string;          // i18n key e.g. 'secretTypes.password'
  descriptionKey: string;
  icon: string;              // react-icons identifier string
  color: string;             // Tailwind color class for the type badge
  fields: SecretField[];     // The fields this type shows in the form/detail view
}

export interface SecretField {
  key: string;
  labelKey: string;
  type: 'text' | 'password' | 'number' | 'textarea' | 'date' | 'select';
  masked: boolean;           // Whether to show MaskToggle
  copyable: boolean;         // Whether to show CopyButton
  monospace: boolean;        // Whether to render in mono font
  required: boolean;
}
```

Field definitions per type:

| Secret Type    | Fields                                                                               |
|----------------|--------------------------------------------------------------------------------------|
| `password`     | site_url, username, password (masked, copyable, mono), notes                        |
| `visa`         | card_holder, card_number (masked, mono), expiry_date, cvv (masked), billing_address |
| `env_variable` | variable_name (mono), value (masked, mono), project, notes                           |
| `api_key`      | service_name, api_key (masked, mono), key_alias, expiry_date, notes                  |
| `license`      | software_name, license_key (masked, mono), licensed_to, purchase_date, expiry_date  |
| `identity`     | document_type (select), full_name, document_number (masked, mono), issue_date, expiry_date, issuing_country |
| `bank_account` | bank_name, account_holder, account_number (masked, mono), iban (masked, mono), swift_bic (mono), currency |
| `secure_note`  | title, content (textarea, masked), tags                                              |
| `wifi`         | network_name (ssid), password (masked, mono), security_type (select), notes          |

---

## 7. MOCK DATA SPECIFICATION

`src/data/mock-data.ts` must export:

```typescript
export const MOCK_USER = { ... }       // Fake authenticated user
export const MOCK_SECRETS: Secret[] = [...] // At least 12 secrets across all 9 types
export const MOCK_SESSION = { ... }    // Fake session with expiry
```

The mock secrets must:
- Cover all 9 `SecretType` values
- Use realistic but obviously fake data (e.g., card number `4111 1111 1111 1111`, IBAN `GB00 FAKE 0000 0000 0001`, API key `sk-fake-abc123...`)
- Include both English and Arabic labels in the title field where sensible
- Have `created_at` and `updated_at` timestamps
- Have an `encrypted_blob` field (just a fake base64 string — it signals the encryption architecture visually)

---

## 8. TRANSLATION KEY STRUCTURE

`src/messages/en.json` and `src/messages/ar.json` must cover at minimum:

```json
{
  "common": {
    "appName": "Shhh",
    "tagline": "...",
    "loading": "...",
    "save": "...",
    "cancel": "...",
    "delete": "...",
    "edit": "...",
    "copy": "...",
    "copied": "...",
    "show": "...",
    "hide": "...",
    "search": "...",
    "noResults": "...",
    "confirm": "...",
    "back": "..."
  },
  "auth": {
    "unlockVault": "...",
    "continueWithGoogle": "...",
    "useFingerprint": "...",
    "useFaceId": "...",
    "sessionExpired": "...",
    "sessionExpiresIn": "...",
    "lockVault": "..."
  },
  "vault": {
    "myVault": "...",
    "addSecret": "...",
    "allSecrets": "...",
    "emptyVault": "...",
    "emptyVaultCta": "...",
    "searchPlaceholder": "...",
    "lastUpdated": "...",
    "deleteSecret": "...",
    "deleteConfirm": "...",
    "secretAdded": "...",
    "secretUpdated": "...",
    "secretDeleted": "..."
  },
  "secretTypes": {
    "password": "...",
    "visa": "...",
    "env_variable": "...",
    "api_key": "...",
    "license": "...",
    "identity": "...",
    "bank_account": "...",
    "secure_note": "...",
    "wifi": "..."
  },
  "fields": {
    "siteUrl": "...",
    "username": "...",
    "password": "...",
    "cardHolder": "...",
    "cardNumber": "...",
    "expiryDate": "...",
    "cvv": "...",
    "variableName": "...",
    "value": "...",
    "project": "...",
    "apiKey": "...",
    "serviceName": "...",
    "licenseKey": "...",
    "softwareName": "...",
    "documentType": "...",
    "fullName": "...",
    "documentNumber": "...",
    "bankName": "...",
    "accountHolder": "...",
    "accountNumber": "...",
    "iban": "...",
    "swiftBic": "...",
    "networkName": "...",
    "securityType": "...",
    "notes": "...",
    "title": "...",
    "content": "..."
  },
  "settings": {
    "title": "...",
    "language": "...",
    "theme": "...",
    "themeLight": "...",
    "themeDark": "...",
    "themeSystem": "...",
    "sessionDuration": "...",
    "dangerZone": "...",
    "clearVault": "..."
  },
  "errors": {
    "required": "...",
    "invalidUrl": "...",
    "fieldTooLong": "...",
    "sessionExpired": "...",
    "networkError": "..."
  }
}
```

Arabic translations in `ar.json` must be complete, professionally written Arabic — not machine-translated placeholders. Use formal Arabic (فصحى مبسطة) appropriate for a security application.

---

## 9. COMPONENT DESIGN GUIDELINES

### SecretCard
- Compact, information-dense but not cluttered
- Shows: type icon, secret name, masked preview of the primary field, type badge, last-updated timestamp
- On hover: reveals a subtle action row with Copy and Edit icon buttons
- The primary masked field preview (e.g., `••••••••••••` for a password) uses `font-mono text-xs text-muted-foreground`
- Card border: `border border-border` — no drop shadows on light mode. In dark mode: `border border-border` with a very subtle `bg-card` distinction from `bg-background`
- Type badge: a small pill `<Badge>` using shadcn/ui with a type-specific background color (muted, not vivid)
- Do NOT add decorative gradients, colored left-borders, or accent stripes to cards

### AddSecretWizard
- Step 1: Choose secret type (visual type selector grid — icons + labels, no descriptions)
- Step 2: Fill in the fields for that type (dynamically rendered from `SecretTypeConfig.fields`)
- Step 3: Confirmation / save
- Progress: simple step counter at the top (`1 of 3`) — not a progress bar
- Each step transition: fade only (`opacity` transition, 150ms) — no slide animations

### UnlockScreen
- Full-page centered layout
- App logo (shield icon from react-icons) + app name + tagline
- Primary action: "Unlock with Google" button (icon + text)
- Secondary action: "Use Fingerprint" (if Web Authn mock is available)
- No decorative backgrounds, no hero images, no gradients
- The lock/shield icon must feel like the conceptual center of the page — give it scale and weight

### SessionBar (the signature element)
- `position: fixed`, `top: [navbar-height]`, `left: 0`, `right: 0`
- `height: 2px`
- Color transitions via CSS custom property + JS-driven inline style for the dynamic value:
  - `> 20 min remaining`: `background: var(--vault-unlocked)` (green)
  - `5–20 min remaining`: `background: var(--vault-warning)` (amber)
  - `< 5 min remaining`: `background: var(--vault-locked)` (red) with a CSS `pulse` animation
- When < 5 minutes: also shows a dismissible `<Alert>` banner below the navbar

---

## 10. PACKAGE INSTALLATION — PHASE 1

The agent must run these commands in order:

```bash
# 1. Bootstrap Next.js with TypeScript and Tailwind
npx create-next-app@latest shhh \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint

cd shhh

# 2. Install shadcn/ui (interactive — choose: New York style, slate base color, yes to CSS variables)
npx shadcn@latest init

# 3. Install required shadcn components
npx shadcn@latest add button card badge input label dialog alert
npx shadcn@latest add dropdown-menu separator tooltip avatar skeleton
npx shadcn@latest add select textarea switch tabs sheet

# 4. Install i18n
npm install next-intl

# 5. Install theming
npm install next-themes

# 6. Install icons
npm install react-icons

# 7. Install validation + form state
npm install zod
npm install react-hook-form @hookform/resolvers

# 8. Install utility
npm install clsx tailwind-merge
```

After installation, verify `components.json` exists and uses:
```json
{
  "style": "new-york",
  "baseColor": "slate",
  "cssVariables": true
}
```

---

## 11. NEXT.JS CONFIGURATION FOR i18n

### `src/middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### `next.config.ts`
```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig = {
  // config here
};

export default withNextIntl(nextConfig);
```

### `src/i18n.ts`
```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
```

### Root `src/app/[locale]/layout.tsx`
```typescript
// Must:
// 1. Set <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
// 2. Wrap with <NextIntlClientProvider>
// 3. Wrap with <ThemeProvider> from next-themes
// 4. Load Inter + Cairo fonts via next/font/google
// 5. Apply fonts via CSS custom properties, not className directly on html
```

---

## 12. TAILWIND CONFIGURATION

`tailwind.config.ts` must:
- Extend theme with the CSS custom properties from Section 4.2 as semantic color names
- Add `fontFamily` for `sans` (Inter), `arabic` (Cairo), and `mono` (JetBrains Mono or Geist Mono)
- Add `rtl` variant support (built-in in Tailwind v3.3+)
- Set `darkMode: ['class']` (required by next-themes)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Security tokens
        'vault-locked': 'var(--vault-locked)',
        'vault-unlocked': 'var(--vault-unlocked)',
        'vault-warning': 'var(--vault-warning)',
        'vault-shield': 'var(--vault-shield)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        arabic: ['var(--font-cairo)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

Note: CSS custom property colors use raw hex (not HSL) in `globals.css` — update the Tailwind color references to use the CSS variable directly without `hsl()` wrapper, or convert all `globals.css` colors to HSL format. Pick one approach and be consistent.

---

## 13. GLOBAL CSS BASELINE

`src/app/globals.css` must include:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 1. All CSS custom properties (Section 4.2) */
/* 2. Base layer overrides */
@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  /* Arabic body font when dir=rtl */
  [dir="rtl"] body {
    font-family: var(--font-cairo), sans-serif;
  }
}

/* 3. Monospace secret values */
@layer utilities {
  .secret-value {
    @apply font-mono text-sm tracking-wider;
  }
  .secret-masked {
    @apply font-mono text-sm tracking-widest text-muted-foreground;
    letter-spacing: 0.2em;
  }
}

/* 4. Session bar pulse animation */
@media (prefers-reduced-motion: no-preference) {
  @keyframes session-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .session-bar-critical {
    animation: session-pulse 1.5s ease-in-out infinite;
  }
}

/* 5. Scrollbar styling (subtle, theme-aware) */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}
```

---

## 14. TYPESCRIPT TYPES

`src/types/index.ts` must define:

```typescript
export type SecretType = 
  'password' | 'visa' | 'env_variable' | 'api_key' |
  'license' | 'identity' | 'bank_account' | 'secure_note' | 'wifi';

export interface Secret {
  id: string;
  user_id: string;
  name: string;                  // User-defined label for this secret
  secret_type: SecretType;
  encrypted_blob: string;        // In mock: JSON.stringify(fields) encoded as fake base64
  decrypted_fields?: Record<string, string>; // Only present after "decryption" in mock
  created_at: string;            // ISO 8601
  updated_at: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'google';
}

export interface Session {
  user: User;
  expires_at: string;           // ISO 8601 — exactly 1 hour after creation
  created_at: string;
}

export type Locale = 'en' | 'ar';
export type Theme = 'light' | 'dark' | 'system';
```

---

## 15. MOCK API DESIGN

`src/lib/mock-api.ts` must simulate real async behavior:

```typescript
// All functions return Promises with simulated delay
// Delays: 200–600ms (realistic for a fast API)

export const mockApi = {
  getSecrets: () => Promise<Secret[]>
  getSecret: (id: string) => Promise<Secret | null>
  createSecret: (payload: CreateSecretPayload) => Promise<Secret>
  updateSecret: (id: string, payload: UpdateSecretPayload) => Promise<Secret>
  deleteSecret: (id: string) => Promise<void>
  searchSecrets: (query: string) => Promise<Secret[]>
  getSession: () => Promise<Session>
  mockUnlock: () => Promise<Session>        // Simulates Google OAuth flow
  mockLock: () => Promise<void>
}
```

The `encrypted_blob` in mock data must simulate the security architecture:
- Visually it should look like base64-encoded data
- On "decryption" (clicking show), the mock simply parses the stored JSON
- This teaches the real architecture visually without implementing it

---

## 16. VALIDATION WITH ZOD + REACT HOOK FORM

All user input in `AddSecretWizard` and any edit forms must be validated using **Zod schemas** paired with **React Hook Form** via `@hookform/resolvers/zod`. This is non-negotiable — never write ad-hoc `if (!value)` validation logic inline in components.

### 16.1 File Location

All Zod schemas live in a single file:

```
src/lib/validations.ts
```

Never define a Zod schema inside a component file. Import from `validations.ts` always.

### 16.2 Base Pattern

```typescript
// src/lib/validations.ts
import { z } from 'zod';

// Reusable field primitives
const urlField = z.string().url({ message: 'errors.invalidUrl' });
const requiredString = (key: string) =>
  z.string().min(1, { message: 'errors.required' }).max(500, { message: 'errors.fieldTooLong' });
const maskedField = z.string().min(1, { message: 'errors.required' });
```

Error messages in Zod schemas must use **i18n translation keys as the message string** (e.g. `'errors.required'`), not raw English text. The component resolves the key via `t(error.message)` when rendering the error.

### 16.3 Schema Per Secret Type

Define one Zod schema per `SecretType`. The agent must implement all 9:

```typescript
export const passwordSchema = z.object({
  name:     z.string().min(1, { message: 'errors.required' }),
  site_url: z.string().url({ message: 'errors.invalidUrl' }).optional().or(z.literal('')),
  username: z.string().min(1, { message: 'errors.required' }),
  password: z.string().min(1, { message: 'errors.required' }),
  notes:    z.string().max(1000).optional(),
});

export const visaSchema = z.object({
  name:            z.string().min(1, { message: 'errors.required' }),
  card_holder:     z.string().min(2, { message: 'errors.required' }),
  card_number:     z.string()
                     .regex(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/, { message: 'errors.invalidCardNumber' }),
  expiry_date:     z.string()
                     .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'errors.invalidExpiry' }),
  cvv:             z.string()
                     .regex(/^\d{3,4}$/, { message: 'errors.invalidCvv' }),
  billing_address: z.string().optional(),
});

export const envVariableSchema = z.object({
  name:          z.string().min(1, { message: 'errors.required' }),
  variable_name: z.string()
                   .regex(/^[A-Z_][A-Z0-9_]*$/i, { message: 'errors.invalidEnvVarName' }),
  value:         z.string().min(1, { message: 'errors.required' }),
  project:       z.string().optional(),
  notes:         z.string().max(1000).optional(),
});

export const apiKeySchema = z.object({
  name:        z.string().min(1, { message: 'errors.required' }),
  service_name:z.string().min(1, { message: 'errors.required' }),
  api_key:     z.string().min(8, { message: 'errors.required' }),
  key_alias:   z.string().optional(),
  expiry_date: z.string().optional(),
  notes:       z.string().max(1000).optional(),
});

export const licenseSchema = z.object({
  name:          z.string().min(1, { message: 'errors.required' }),
  software_name: z.string().min(1, { message: 'errors.required' }),
  license_key:   z.string().min(1, { message: 'errors.required' }),
  licensed_to:   z.string().optional(),
  purchase_date: z.string().optional(),
  expiry_date:   z.string().optional(),
});

export const identitySchema = z.object({
  name:            z.string().min(1, { message: 'errors.required' }),
  document_type:   z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit']),
  full_name:       z.string().min(2, { message: 'errors.required' }),
  document_number: z.string().min(1, { message: 'errors.required' }),
  issue_date:      z.string().optional(),
  expiry_date:     z.string().optional(),
  issuing_country: z.string().optional(),
});

export const bankAccountSchema = z.object({
  name:           z.string().min(1, { message: 'errors.required' }),
  bank_name:      z.string().min(1, { message: 'errors.required' }),
  account_holder: z.string().min(2, { message: 'errors.required' }),
  account_number: z.string().min(1, { message: 'errors.required' }),
  iban:           z.string()
                    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{4,}$/, { message: 'errors.invalidIban' })
                    .optional()
                    .or(z.literal('')),
  swift_bic:      z.string()
                    .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, { message: 'errors.invalidSwift' })
                    .optional()
                    .or(z.literal('')),
  currency:       z.string().length(3, { message: 'errors.invalidCurrency' }).optional(),
});

export const secureNoteSchema = z.object({
  name:    z.string().min(1, { message: 'errors.required' }),
  title:   z.string().min(1, { message: 'errors.required' }),
  content: z.string().min(1, { message: 'errors.required' }).max(10000),
  tags:    z.array(z.string()).optional(),
});

export const wifiSchema = z.object({
  name:          z.string().min(1, { message: 'errors.required' }),
  network_name:  z.string().min(1, { message: 'errors.required' }),
  password:      z.string().min(1, { message: 'errors.required' }),
  security_type: z.enum(['WPA2', 'WPA3', 'WEP', 'open']),
  notes:         z.string().max(1000).optional(),
});

// Union type for the wizard — resolves the correct schema by secret_type
export const SECRET_SCHEMAS = {
  password:     passwordSchema,
  visa:         visaSchema,
  env_variable: envVariableSchema,
  api_key:      apiKeySchema,
  license:      licenseSchema,
  identity:     identitySchema,
  bank_account: bankAccountSchema,
  secure_note:  secureNoteSchema,
  wifi:         wifiSchema,
} as const;

// Inferred TypeScript types from each schema
export type PasswordFormData     = z.infer<typeof passwordSchema>;
export type VisaFormData         = z.infer<typeof visaSchema>;
export type EnvVariableFormData  = z.infer<typeof envVariableSchema>;
export type ApiKeyFormData       = z.infer<typeof apiKeySchema>;
export type LicenseFormData      = z.infer<typeof licenseSchema>;
export type IdentityFormData     = z.infer<typeof identitySchema>;
export type BankAccountFormData  = z.infer<typeof bankAccountSchema>;
export type SecureNoteFormData   = z.infer<typeof secureNoteSchema>;
export type WifiFormData         = z.infer<typeof wifiSchema>;
```

### 16.4 Usage Pattern in Components

Since we do not use `<form>`, React Hook Form is driven by programmatic submission:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordSchema, type PasswordFormData } from '@/lib/validations';

const { register, handleSubmit, formState: { errors } } = useForm<PasswordFormData>({
  resolver: zodResolver(passwordSchema),
});

// Trigger validation manually on button click:
const onSave = handleSubmit((data) => {
  // data is fully typed and validated
  mockApi.createSecret({ secret_type: 'password', fields: data });
});

// In JSX — button, not <form>:
<Button onClick={onSave}>
  {t('common.save')}
</Button>
```

### 16.5 Error Display Rules

- Errors appear **below** the input field they belong to, in `text-xs text-destructive`.
- Error text is resolved via `t(error.message)` — the Zod message is a translation key.
- Error messages appear **on blur** (not on every keystroke) — set `mode: 'onBlur'` in `useForm`.
- Never show a generic "Form has errors" banner — each field owns its own error.
- shadcn/ui `<Input>` must receive `aria-invalid={!!errors.fieldName}` and `aria-describedby` pointing to the error element.

### 16.6 New i18n Keys Required for Validation

Add these to both `en.json` and `ar.json` under the `errors` namespace:

```json
"errors": {
  "required": "This field is required",
  "invalidUrl": "Please enter a valid URL (e.g. https://example.com)",
  "fieldTooLong": "This field is too long",
  "invalidCardNumber": "Enter a valid 16-digit card number",
  "invalidExpiry": "Enter expiry as MM/YY",
  "invalidCvv": "CVV must be 3 or 4 digits",
  "invalidEnvVarName": "Use uppercase letters, numbers, and underscores only",
  "invalidIban": "Enter a valid IBAN (e.g. GB29 NWBK 6016 1331 9268 19)",
  "invalidSwift": "Enter a valid SWIFT/BIC code",
  "invalidCurrency": "Enter a 3-letter currency code (e.g. USD)",
  "sessionExpired": "Your session has expired. Please unlock your vault again.",
  "networkError": "Something went wrong. Please try again."
}
```

Arabic equivalents must be professionally written — not auto-translated.

---

## 17. PHASE 1 DELIVERY CHECKLIST

Before considering Phase 1 complete, verify every item:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds without errors or type errors
- [ ] All 9 secret types display in the vault grid with correct icons
- [ ] Light mode and dark mode switch correctly with no unstyled flashes
- [ ] English and Arabic both render correctly, including RTL layout flip
- [ ] Session bar is visible and changes color based on mock session state
- [ ] SecretCard masks all sensitive values by default
- [ ] CopyButton copies and auto-clears after 30 seconds
- [ ] AddSecretWizard completes a 3-step flow and adds to mock data
- [ ] Delete flow shows ConfirmDialog before deleting
- [ ] Search filters secrets in real-time from mock data
- [ ] All pages are responsive at 375px, 768px, 1024px, 1440px
- [ ] No hardcoded English strings in any component (all via `useTranslations`)
- [ ] No emoji used anywhere as UI icons
- [ ] No `<form>` HTML elements anywhere
- [ ] `mock-data.ts` is the only place fake data is defined
- [ ] TypeScript strict mode: zero `any` types, zero type errors
- [ ] All interactive elements have `aria-label` or visible text label
- [ ] All 9 Zod schemas exist in `src/lib/validations.ts`
- [ ] Every form field shows its error below the input on blur
- [ ] Zod error messages resolve via `t(error.message)` — no raw English in schema messages
- [ ] Card number, IBAN, SWIFT, env var name regex patterns reject obviously invalid input
- [ ] `useForm` is configured with `mode: 'onBlur'` in all wizard steps

---

## 18. THINGS TO AVOID — THE ANTI-PATTERN LIST

The agent must never do any of the following:

| Anti-Pattern | Why Banned |
|---|---|
| `<form>` elements | Causes hydration issues; use div + onClick |
| `style={{ color: '#...' }}` | Use Tailwind + CSS vars instead |
| Hardcoded strings in JSX | Breaks i18n — always use `t()` |
| `text-left` without `rtl:text-right` | Breaks Arabic layout |
| `ml-*` without `rtl:mr-*` | Breaks Arabic spacing |
| `absolute left-*` without `rtl:right-*` | Breaks Arabic positioning |
| Emoji as icons | Use react-icons exclusively |
| `any` type in TypeScript | Defeats type safety |
| `console.log` in production code | Remove all debug logs |
| CSS `!important` | Signals specificity failure; refactor instead |
| Placeholder `TODO` translations | All i18n keys must have real translations |
| Alert/confirm native dialogs | Use shadcn/ui `<Dialog>` and `<Alert>` |
| `window.localStorage` in SSR paths | Wrap in `useEffect` or use cookies |
| Importing from `react-icons` without tree-shaking (named imports only) | `import { X } from 'react-icons/ri'` ✅ — `import reactIcons from 'react-icons'` ❌ |
| Inline `if (!value)` validation in components | All validation goes through Zod schemas in `validations.ts` |
| Raw English strings as Zod error messages | Use translation keys: `{ message: 'errors.required' }` |
| Defining Zod schemas inside component files | Schemas live in `src/lib/validations.ts` only |
| `mode: 'onChange'` in `useForm` | Use `mode: 'onBlur'` — avoids jarring errors on every keystroke |
| Calling `mockApi` before Zod validation passes | Always validate with `handleSubmit` before any API call |

---

## 19. AGENT BEHAVIOR RULES

When acting as the AI coding agent:

1. **Read this file completely before writing a single line of code.**
2. **Ask for clarification on ambiguous requirements before implementing** — do not guess and silently deviate.
3. **Implement the file structure from Section 5 exactly** — do not reorganize, rename, or consolidate files without explicit approval.
4. **Start with setup, then structure, then data, then components** — never jump to visual components before the data layer exists.
5. **Write complete files, not snippets** — when creating a file, write the full implementation, not a skeleton with `// TODO` comments.
6. **Check RTL on every directional style** — before finishing any component, mentally audit every `left/right/ml/mr/pl/pr` Tailwind class.
7. **Verify translations on every string** — before finishing any component, verify every user-facing string has a translation key in both `en.json` and `ar.json`.
8. **Run the build after every major milestone** — catch TypeScript errors early, not at the end.
9. **Never delete mock-data.ts** — it is the single source of truth for Phase 1. Extend it, never replace it with inline data.
10. **Security vocabulary is product identity** — enforce the vocabulary rules from Section 3.6 in every string you write.

---

*End of agent.md — Version 1.1 — Shhh Project — Phase 1: Frontend Shell*