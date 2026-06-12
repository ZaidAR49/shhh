// Root layout — minimal pass-through.
// The real layout (fonts, theme, intl) lives in src/app/[locale]/layout.tsx
// This file is required by Next.js but should not render html/body itself
// to avoid nesting conflicts with the locale layout.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
