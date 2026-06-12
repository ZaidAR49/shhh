import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export const config = {
  // Match all routes except: API, _next internals, static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
