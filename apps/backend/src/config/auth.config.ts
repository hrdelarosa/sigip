import { registerAs } from '@nestjs/config';

export const AUTH_CONFIG_KEY = 'auth';

export default registerAs(AUTH_CONFIG_KEY, () => ({
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'sigip_session',
  sessionIdleMinutes: Number(process.env.SESSION_IDLE_MINUTES || 30),
  sessionAbsoluteMinutes: Number(process.env.SESSION_ABSOLUTE_MINUTES || 600),
  frontendOrigin: process.env.FRONTEND_ORIGIN,
  // secureCookie: process.env.NODE_ENV === 'production',
  secureCookie:
    process.env.SESSION_COOKIE_SECURE !== undefined
      ? process.env.SESSION_COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production',
  trustProxyHops: Number(process.env.TRUST_PROXY_HOPS || 0),
}));
