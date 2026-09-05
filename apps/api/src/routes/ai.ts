import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AIService } from "../services/ai.service.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { ok } from "../lib/response.js";
import { prisma } from "@savoria/database";

export async function aiRoutes(app: FastifyInstance) {
  const ai = new AIService();
  app.post("/chat", {
    config: { rateLimit: { max: 20, timeWindow: "1 hour" } },
    preHandler: [optionalAuth, validateBody(z.object({ message: z.string().min(1), conversationId: z.string().optional() }))],
  }, async (request, reply) => {
    const body = request.body as { message: string; conversationId?: string };
    return ok(reply, await ai.chat((request as any).userId, body.message, body.conversationId));
  });
  app.post("/chat/stream", {
    config: { rateLimit: { max: 20, timeWindow: "1 hour" } },
    preHandler: [optionalAuth, validateBody(z.object({ message: z.string().trim().min(1).max(2000), conversationId: z.string().optional() }))],
  }, async (request, reply) => {
    const body = request.body as { message: string; conversationId?: string };
    const result = await ai.chat((request as any).userId, body.message, body.conversationId);
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    const chunks = result.reply.match(/.{1,48}(?:\s|$)/g) ?? [result.reply];
    for (const chunk of chunks) reply.raw.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    reply.raw.write(`data: ${JSON.stringify({ done: true, conversationId: result.conversationId, sources: result.sources })}\n\n`);
    reply.raw.end();
    return reply;
  });
  app.get("/conversations", { preHandler: [requireAuth] }, async (request, reply) => {
    const list = await prisma.aIConversation.findMany({
      where: { userId: (request as any).userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    return ok(reply, list);
  });
}
