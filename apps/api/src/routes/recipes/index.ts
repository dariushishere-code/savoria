import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { recipeSearchSchema, createRecipeSchema, updateRecipeSchema, createCommentSchema, ratingSchema } from "@savoria/validation";
import { RecipeService } from "../../services/recipe.service.js";
import { validateBody, validateQuery, validateParams } from "../../middleware/validate.js";
import { requireAuth, requireEditor, optionalAuth } from "../../middleware/auth.js";
import { ok, created } from "../../lib/response.js";

export async function recipeRoutes(app: FastifyInstance) {
  const recipes = new RecipeService();
  app.get("/", { preHandler: [validateQuery(recipeSearchSchema)] }, async (request, reply) => {
    return ok(reply, await recipes.list(request.query as any));
  });
  app.get("/:recipeId/comments", { preHandler: [validateParams(z.object({ recipeId: z.string() })), validateQuery(z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(50).default(20) }))] }, async (request, reply) => {
    const { recipeId } = request.params as { recipeId: string };
    const query = request.query as { page: number; pageSize: number };
    const skip = (query.page - 1) * query.pageSize;
    const [data, total] = await Promise.all([
      (await import("@savoria/database")).prisma.comment.findMany({
        where: { recipeId, status: "APPROVED" }, skip, take: query.pageSize,
        orderBy: { createdAt: "desc" }, select: { id: true, content: true, createdAt: true, user: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      (await import("@savoria/database")).prisma.comment.count({ where: { recipeId, status: "APPROVED" } }),
    ]);
    return ok(reply, { data, meta: { total, page: query.page, pageSize: query.pageSize, totalPages: Math.max(1, Math.ceil(total / query.pageSize)), hasNext: skip + data.length < total, hasPrev: query.page > 1 } });
  });
  app.post("/:recipeId/comments", { config: { rateLimit: { max: 10, timeWindow: "1 hour" } }, preHandler: [requireAuth, validateParams(z.object({ recipeId: z.string() })), validateBody(createCommentSchema)] }, async (request, reply) => {
    const { recipeId } = request.params as { recipeId: string };
    const body = request.body as { content: string };
    const { prisma } = await import("@savoria/database");
    const recipe = await prisma.recipe.findFirst({ where: { id: recipeId, status: "PUBLISHED" }, select: { id: true } });
    if (!recipe) return reply.status(404).send({ statusCode: 404, message: "Recipe not found", code: "NOT_FOUND" });
    const comment = await prisma.comment.create({ data: { recipeId, userId: (request as any).userId, content: body.content, status: "PENDING" }, select: { id: true, content: true, status: true, createdAt: true } });
    return created(reply, comment, "Comment submitted for moderation");
  });
  app.put("/:recipeId/rating", { config: { rateLimit: { max: 30, timeWindow: "1 hour" } }, preHandler: [requireAuth, validateParams(z.object({ recipeId: z.string() })), validateBody(ratingSchema)] }, async (request, reply) => {
    const { recipeId } = request.params as { recipeId: string };
    const { score } = request.body as { score: number };
    const { prisma } = await import("@savoria/database");
    const result = await prisma.$transaction(async (tx) => {
      await tx.rating.upsert({ where: { userId_recipeId: { userId: (request as any).userId, recipeId } }, create: { userId: (request as any).userId, recipeId, score }, update: { score } });
      const aggregate = await tx.rating.aggregate({ where: { recipeId }, _avg: { score: true }, _count: { score: true } });
      return tx.recipe.update({ where: { id: recipeId }, data: { ratingAverage: aggregate._avg.score ?? 0, ratingCount: aggregate._count.score }, select: { ratingAverage: true, ratingCount: true } });
    });
    return ok(reply, result);
  });
  app.get("/:slug", { preHandler: [validateParams(z.object({ slug: z.string().min(1) })), optionalAuth] }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    return ok(reply, await recipes.getBySlug(slug, { incrementView: true }));
  });
  app.post("/", { preHandler: [requireEditor, validateBody(createRecipeSchema)] }, async (request, reply) => {
    return created(reply, await recipes.create((request as any).userId, request.body as any), "Recipe created");
  });
  app.put("/:id", { preHandler: [requireAuth, validateParams(z.object({ id: z.string() })), validateBody(updateRecipeSchema)] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return ok(reply, await recipes.update(id, (request as any).userId, (request as any).userRole, request.body as any));
  });
  app.delete("/:id", { preHandler: [requireAuth, validateParams(z.object({ id: z.string() }))] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return ok(reply, await recipes.delete(id, (request as any).userId, (request as any).userRole));
  });
}
