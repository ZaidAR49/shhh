import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig = {
  // Phase 1: no real backend, no special config needed
};

export default withNextIntl(nextConfig);
