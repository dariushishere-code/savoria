import { config as loadDotenv } from "dotenv";
import { z } from "zod";
loadDotenv();
const schema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("0.0.0.0"),
  WEB_URL: z.string().default("http://localhost:5173"),
  API_URL: z.string().default("http://localhost:3001"),
  DATABASE_URL: z.string().default("postgresql://savoria:savoria@localhost:5432/savoria?schema=public"),
  JWT_ACCESS_SECRET: z.string().default("dev-access-secret-change-me-32chars!!"),
  JWT_REFRESH_SECRET: z.string().default("dev-refresh-secret-change-me-32ch!!"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  COOKIE_SECRET: z.string().default("dev-cookie-secret-change-me-32chars!"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  CAPTCHA_SECRET_KEY: z.string().optional(),
  CAPTCHA_SITE_KEY: z.string().optional(),
  CAPTCHA_PROVIDER: z.enum(["turnstile", "recaptcha"]).default("turnstile"),
  FEATURE_REGISTRATION_ENABLED: z.string().optional(),
  LOG_LEVEL: z.string().default("info"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
});
const parsed = schema.safeParse(process.env);
export const env = parsed.success ? parsed.data : schema.parse({});
