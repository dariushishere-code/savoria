import { ApiError } from './api';

const MESSAGE_BY_CODE: Record<string, string> = {
  UNAUTHORIZED: 'That email or password doesn\u2019t quite match.',
  FORBIDDEN: 'You don\u2019t have permission to do that.',
  CONFLICT: 'Looks like that email is already registered.',
  NOT_FOUND: 'We couldn\u2019t find what you were looking for.',
  BAD_REQUEST: 'A few details need a second look.',
  VALIDATION_ERROR: 'A few details need a second look.',
  CAPTCHA_REQUIRED: 'Please complete the security check to continue.',
  CAPTCHA_FAILED: 'The security check didn\u2019t pass — please try again.',
  EMAIL_VERIFICATION_REQUIRED: 'Please verify your email before continuing.',
};

const MESSAGE_BY_TEXT: Array<{ match: RegExp; message: string }> = [
  { match: /invalid.*(email|password)/i, message: 'That email or password doesn\u2019t quite match.' },
  { match: /email already registered/i, message: 'That email is already registered — try signing in instead.' },
  { match: /registration disabled/i, message: 'New sign-ups are paused right now. Please check back soon.' },
  { match: /suspended|banned/i, message: 'This account is currently suspended. Reach out if you think this is a mistake.' },
  { match: /rate.?limit|too many/i, message: 'You\u2019ve tried too many times. Take a breath and try again in a few minutes.' },
  { match: /verification.*token/i, message: 'That verification link has expired. Please request a new one.' },
  { match: /password.*require/i, message: 'Your password needs to be at least 8 characters with upper and lower case letters and a number.' },
];

export function friendlyAuthError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError) {
    if (error.code && MESSAGE_BY_CODE[error.code]) return MESSAGE_BY_CODE[error.code];
    for (const rule of MESSAGE_BY_TEXT) {
      if (rule.match.test(error.message)) return rule.message;
    }
    if (error.statusCode >= 500) return 'Our kitchen is briefly busy — please try again in a moment.';
    return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function fieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.code === 'VALIDATION_ERROR' && error.errors) {
    const result: Record<string, string> = {};
    for (const [path, messages] of Object.entries(error.errors)) {
      result[path] = messages[0] ?? 'This needs a second look.';
    }
    return result;
  }
  return {};
}