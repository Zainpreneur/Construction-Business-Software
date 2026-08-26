// Shared between src/lib/auth.ts (server actions / route handlers) and
// src/proxy.ts (runs in a lighter runtime) so proxy.ts doesn't need to pull
// in bcrypt/prisma types just to know the cookie name.
export const SESSION_COOKIE = "session";
