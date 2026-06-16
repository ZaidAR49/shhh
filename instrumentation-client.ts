import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
  ui_host: 'https://eu.posthog.com',
  defaults: '2026-01-30',
  capture_exceptions: true,
  autocapture: false,
  disable_session_recording: true,
  capture_pageview: true,
  debug: process.env.NODE_ENV === 'development',
});
