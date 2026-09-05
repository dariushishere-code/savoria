import type { FastifyInstance } from "fastify";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "@savoria/validation";
import { AuthService } from "../../services/auth.service.js";
import { validateBody } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { ok, created } from "../../lib/response.js";
import { env } from "../../config/env.js";
import { prisma } from "@savoria/database";
import { verifyCaptcha } from "../../lib/security.js";

export async function authRoutes(app: FastifyInstance) {
  const auth = new AuthService(app);
  app.get("/config", async (_req, reply) => ok(reply, {
    captchaEnabled: Boolean(env.CAPTCHA_SECRET_KEY),
    captchaSiteKey: env.CAPTCHA_SITE_KEY ?? null,
    registrationEnabled: env.FEATURE_REGISTRATION_ENABLED !== "false",
  }));
  app.post("/register", { config: { rateLimit: { max: 5, timeWindow: "1 hour" } }, preHandler: [validateBody(registerSchema)] }, async (request, reply) => {
    const body = request.body as { email: string; password: string; name: string };
    await verifyCaptcha((request.body as any).captchaToken, request.ip);
    return created(reply, await auth.register(body), "Registration successful");
  });
  app.post("/login", { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } }, preHandler: [validateBody(loginSchema)] }, async (request, reply) => {
    const body = request.body as { email: string; password: string };
    await verifyCaptcha((request.body as any).captchaToken, request.ip);
    const result = await auth.login(body, { userAgent: request.headers["user-agent"], ipAddress: request.ip });
    reply.setCookie("refreshToken", result.refreshToken, {
      path: "/", httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax", maxAge: 7*24*60*60,
    });
    return ok(reply, { user: result.user, accessToken: result.accessToken, expiresIn: result.expiresIn });
  });
  app.post("/logout", async (request, reply) => {
    const token = (request.cookies as any)?.refreshToken ?? (request.body as any)?.refreshToken;
    if (token) await auth.logout(token);
    reply.clearCookie("refreshToken", { path: "/" });
    return ok(reply, { ok: true });
  });
  app.post("/refresh", async (request, reply) => {
    const token = (request.cookies as any)?.refreshToken ?? (request.body as any)?.refreshToken;
    if (!token) return reply.status(401).send({ statusCode: 401, message: "Refresh token required", code: "UNAUTHORIZED" });
    const tokens = await auth.refresh(token);
    reply.setCookie("refreshToken", tokens.refreshToken, {
      path: "/", httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax", maxAge: 7*24*60*60,
    });
    return ok(reply, { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn });
  });
  app.post("/forgot-password", { config: { rateLimit: { max: 5, timeWindow: "1 hour" } }, preHandler: [validateBody(forgotPasswordSchema)] }, async (request, reply) => {
    await verifyCaptcha((request.body as any).captchaToken, request.ip);
    return ok(reply, await auth.forgotPassword((request.body as any).email));
  });
  app.post("/reset-password", { preHandler: [validateBody(resetPasswordSchema)] }, async (request, reply) => {
    const body = request.body as { token: string; password: string };
    return ok(reply, await auth.resetPassword(body.token, body.password));
  });
  app.post("/verify-email", async (request, reply) => {
    const token = (request.body as any)?.token ?? (request.query as any)?.token;
    if (!token) return reply.status(400).send({ statusCode: 400, message: "Token required", code: "BAD_REQUEST" });
    return ok(reply, await auth.verifyEmail(token));
  });
  app.post("/change-password", { preHandler: [requireAuth, validateBody(changePasswordSchema)] }, async (request, reply) => {
    const body = request.body as { currentPassword: string; newPassword: string };
    return ok(reply, await auth.changePassword((request as any).userId, body.currentPassword, body.newPassword));
  });
  app.get("/sessions", { preHandler: [requireAuth] }, async (request, reply) => {
    const sessions = await prisma.session.findMany({
      where: { userId: (request as any).userId },
      select: { id: true, userAgent: true, ipAddress: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(reply, sessions);
  });
  app.delete("/sessions", { preHandler: [requireAuth] }, async (request, reply) => {
    await auth.logoutAll((request as any).userId);
    reply.clearCookie("refreshToken", { path: "/" });
    return ok(reply, { ok: true });
  });
}
