import type { Response } from 'express';

export interface SessionCookieConfig {
  name: string;
  secure: boolean;
}

function cookieOptions(config: SessionCookieConfig) {
  return {
    httpOnly: true,
    secure: config.secure,
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function setSessionCookie(
  response: Response,
  token: string,
  absoluteExpiresAt: Date,
  config: SessionCookieConfig,
): void {
  response.cookie(config.name, token, {
    ...cookieOptions(config),
    expires: absoluteExpiresAt,
  });
}

export function clearSessionCookie(
  response: Response,
  config: SessionCookieConfig,
): void {
  response.clearCookie(config.name, cookieOptions(config));
}
