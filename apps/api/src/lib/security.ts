import { env } from "../config/env.js";
import { BadRequestError } from "./errors.js";

export async function verifyCaptcha(token: string | undefined, ipAddress?: string) {
  if (!env.CAPTCHA_SECRET_KEY) return;
  if (!token) throw new BadRequestError("Captcha verification required");
  const endpoint = env.CAPTCHA_PROVIDER === "recaptcha"
    ? "https://www.google.com/recaptcha/api/siteverify"
    : "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const body = new URLSearchParams({ secret: env.CAPTCHA_SECRET_KEY, response: token });
  if (ipAddress) body.set("remoteip", ipAddress);
  const response = await fetch(endpoint, { method: "POST", body, signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new BadRequestError("Captcha verification failed");
  const result = await response.json() as { success?: boolean };
  if (!result.success) throw new BadRequestError("Captcha verification failed");
}
