import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export function proxy(request: any) {
  return intlMiddleware(request);
}

export const config = {
  // Match all routes except: API, _next internals, static files, ingest (PostHog)
  matcher: ['/((?!api|_next|_vercel|ingest|.*\\..*).*)'],
};
