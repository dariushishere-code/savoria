import type { FastifyInstance } from "fastify";
import { prisma } from "@savoria/database";
export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok", service: "savoria-api", timestamp: new Date().toISOString() }));
  app.get("/health/ready", async (_req, reply) => {
    try { await prisma.$queryRaw`SELECT 1`; return { status: "ready", database: "ok" }; }
    catch { return reply.status(503).send({ status: "not_ready", database: "error" }); }
  });
}
