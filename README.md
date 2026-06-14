# Shhh — The Passwordless Secrets Vault

> **Your secrets, locked by who you are — not what you remember.**

🔗 **Live App:** [https://shhh-puce.vercel.app](https://shhh-puce.vercel.app)

---

## What is Shhh?

Shhh is a **zero-knowledge, passwordless secrets vault** built for people who are tired of remembering passwords. Instead of a master password that can be forgotten, stolen, or guessed, Shhh uses modern identity standards to verify who you are — and then lets you access your vault instantly.

Whether you need to store login credentials, API keys, payment cards, Wi-Fi passwords, bank details, or secure notes, Shhh keeps them all encrypted and organized in one beautiful, easy-to-use interface.

---

## ✨ Why Use Shhh?

### 🔑 Truly Passwordless
No master password to forget, leak, or get phished. Sign in with your Google account and you're in — frictionless and secure.

### 🌍 Multi-Language Support
Full support for **English** and **Arabic** (including RTL layout), with the ability to switch languages on the fly.

### 🌗 Light & Dark Mode
Enjoy a polished experience in both light and dark themes, adapting to your system preference or your manual choice.

### 📦 Store Any Kind of Secret
Shhh supports a wide variety of secret types out of the box:

| Secret Type | Description |
|---|---|
| 🔐 Password | Login credentials for websites and apps |
| 💳 Payment Card | Credit, debit, and prepaid card details |
| 🔧 Environment Variable | API keys and environment configuration |
| 🗝️ API Key | Service API keys and access tokens |
| 📋 License Key | Software and subscription license keys |
| 🪪 Identity Document | Passports, IDs, and travel documents |
| 🏦 Bank Account | Bank account and financial details |
| 📝 Secure Note | Encrypted private notes and text |
| 📶 Wi-Fi Credential | Network names and wireless passwords |

### 🔍 Smart Organization
- Search across all your secrets instantly
- Filter secrets by type
- Mark secrets as **Favourites** for quick access
- Assign custom **Tags** for flexible organization

### 📤 .env File Import & Export
Developers can import `.env` files directly into the vault and export secrets back as `.env` files — saving time and reducing copy-paste errors.

### 🔔 Email Notifications
Get instant email alerts when sensitive secrets are accessed or important account events occur, so you always stay informed.

### 🔐 Two-Factor Authentication (MFA)
Enable MFA on your account using an authenticator app for an added layer of protection when accessing sensitive secrets.

### ⏱️ Auto-Locking Sessions
Your vault automatically locks after 60 minutes of activity. If you step away and forget, Shhh has your back.

### 🗑️ Full Account Control
Delete individual secrets, clear your entire vault, or permanently delete your account — all from within the app. Your data is yours, and you can remove it any time.

---

## 🌐 Supported Languages

| Language | Status |
|---|---|
| English | ✅ Fully supported |
| Arabic (عربي) | ✅ Fully supported (RTL) |

---

## 🧰 Built With

- **[Next.js 16](https://nextjs.org/)** — React framework for production
- **[React 19](https://react.dev/)** — UI library
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first styling
- **[next-auth](https://next-auth.js.org/)** — Authentication with Google OAuth
- **[next-intl](https://next-intl-docs.vercel.app/)** — Internationalization
- **[Drizzle ORM](https://orm.drizzle.team/)** — Type-safe database access
- **[Zod](https://zod.dev/)** — Runtime schema validation
- **[React Hook Form](https://react-hook-form.com/)** — Performant form handling
- **[otplib](https://github.com/yeojz/otplib)** — TOTP-based MFA
- **[Shadcn/UI](https://ui.shadcn.com/)** & **[Base UI](https://base-ui.com/)** — Accessible component primitives
- **[Sonner](https://sonner.emilkowal.ski/)** — Toast notifications
- **[Lucide React](https://lucide.dev/)** — Icon set

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- A PostgreSQL database
- A Google OAuth application

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ZaidAR49/shhh.git
cd shhh

# 2. Install dependencies
npm install

# 3. Copy the environment template and fill in your values
cp .env.example .env.local

# 4. Run database migrations
npx drizzle-kit push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 Legal

- [Privacy Policy](https://shhh-puce.vercel.app/en/privacy)
- [Terms of Service](https://shhh-puce.vercel.app/en/terms)
- [Security Architecture](https://shhh-puce.vercel.app/en/security)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

## 📬 Contact

Have a question or need support? Use the [Contact page](https://shhh-puce.vercel.app/en/contact) on the live app.

---

<p align="center">Made with ❤️ — <em>Shhh, keep it secret.</em></p>