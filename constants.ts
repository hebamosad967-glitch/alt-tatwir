export const Session = {
  cookieName: "kimi_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback",
  passwordLogin: "/api/admin/password-login",
} as const;

// Fixed unionId used for the password-based admin account (no Kimi OAuth involved)
export const PasswordAdmin = {
  unionId: "password-admin",
} as const;
