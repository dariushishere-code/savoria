import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env.js";
import { AppError } from "./lib/errors.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth/index.js";
import { recipeRoutes } from "./routes/recipes/index.js";
import { taxonomyRoutes } from "./routes/taxonomy.js";
import { userRoutes } from "./routes/users/index.js";
import { adminRoutes } from "./routes/admin/index.js";
import { searchRoutes } from "./routes/search.js";
import { aiRoutes } from "./routes/ai.js";
import { connectRedis, redis } from "./lib/redis.js";

export async function buildApp() {
  const app = Fastify({ logger: { level: env.LOG_LEVEL as any }, trustProxy: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: [env.WEB_URL, "http://localhost:5173", "http://localhost:3000"], credentials: true });
  await app.register(cookie, { secret: env.COOKIE_SECRET });
  await app.register(jwt, { secret: env.JWT_ACCESS_SECRET });
  await connectRedis();
  await app.register(rateLimit, { max: 100, timeWindow: 60_000, redis, keyGenerator: (request) => request.ip });
  app.addHook("onClose", async () => { await redis.quit(); });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ statusCode: error.statusCode, message: error.message, code: error.code, errors: error.errors });
    }
    request.log.error(error);
    const statusCode = (error as any).statusCode ?? 500;
    return reply.status(statusCode).send({
      statusCode,
      message: env.NODE_ENV === "production" && statusCode === 500 ? "Internal server error" : error.message,
      code: "INTERNAL_ERROR",
    });
  });

  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(recipeRoutes, { prefix: "/api/recipes" });
  await app.register(taxonomyRoutes, { prefix: "/api" });
  await app.register(userRoutes, { prefix: "/api/users" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
  await app.register(searchRoutes, { prefix: "/api/search" });
  await app.register(aiRoutes, { prefix: "/api/ai" });
  return app;
}
